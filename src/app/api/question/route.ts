import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

import {
    answerCollection,
    commentCollection,
    questionAttachmentBucket,
    questionCollection,
    db,
    voteCollection,
} from "@/models/name";
import { databases, storage } from "@/models/server/config";
import { errorResponse, forbidden, getAuthUser, unauthorized } from "@/models/server/auth";
import { deleteAllDocuments } from "@/models/server/helpers";

async function uploadAttachment(file: File | null) {
    if (!file || file.size === 0) return null;

    const uploaded = await storage.createFile(questionAttachmentBucket, ID.unique(), file);
    return uploaded.$id;
}

function parseTags(tagsValue: FormDataEntryValue | null) {
    if (typeof tagsValue !== "string" || !tagsValue.trim()) return [] as string[];

    try {
        const parsed = JSON.parse(tagsValue);
        if (!Array.isArray(parsed)) return [] as string[];
        const tags = parsed.map(tag => String(tag).trim()).filter(Boolean);
        return Array.from(new Set(tags));
    } catch {
        return [] as string[];
    }
}

function validate(title: string, content: string, tags: string[]) {
    if (!title || !content) return "Title and content are required";
    if (title.length > 100) return "Title must be at most 100 characters";
    if (content.length > 10000) return "Content must be at most 10000 characters";
    if (tags.length === 0) return "Add at least one tag";
    if (tags.some(tag => tag.length > 50)) return "Tags must be at most 50 characters";
    return null;
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) return unauthorized();

        const formData = await request.formData();
        const title = String(formData.get("title") || "").trim();
        const content = String(formData.get("content") || "").trim();
        const tags = parseTags(formData.get("tags"));
        const attachment = formData.get("attachment");

        const validationError = validate(title, content, tags);
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        const attachmentId = attachment instanceof File ? await uploadAttachment(attachment) : null;

        const response = await databases.createDocument(db, questionCollection, ID.unique(), {
            title,
            content,
            authorId: user.$id,
            tags,
            ...(attachmentId ? { attachmentId } : {}),
        });

        return NextResponse.json({ question: response }, { status: 201 });
    } catch (error) {
        return errorResponse(error, "Error creating question");
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) return unauthorized();

        const formData = await request.formData();
        const questionId = String(formData.get("questionId") || "").trim();
        const title = String(formData.get("title") || "").trim();
        const content = String(formData.get("content") || "").trim();
        const tags = parseTags(formData.get("tags"));
        const attachment = formData.get("attachment");

        if (!questionId) {
            return NextResponse.json({ error: "Question id is required" }, { status: 400 });
        }
        const validationError = validate(title, content, tags);
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        const existing = await databases.getDocument(db, questionCollection, questionId);
        if (existing.authorId !== user.$id) return forbidden();

        // Use the stored attachment id, not one supplied by the client
        const currentAttachmentId: string | null = existing.attachmentId || null;
        let attachmentId = currentAttachmentId;

        if (attachment instanceof File && attachment.size > 0) {
            const uploadedAttachmentId = await uploadAttachment(attachment);
            if (uploadedAttachmentId) {
                attachmentId = uploadedAttachmentId;
                if (currentAttachmentId) {
                    await storage.deleteFile(questionAttachmentBucket, currentAttachmentId).catch(() => {});
                }
            }
        }

        const payload: Record<string, string | string[]> = {
            title,
            content,
            tags,
        };

        if (attachmentId) {
            payload.attachmentId = attachmentId;
        }

        const response = await databases.updateDocument(db, questionCollection, questionId, payload);

        return NextResponse.json({ question: response }, { status: 200 });
    } catch (error) {
        return errorResponse(error, "Error updating question");
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) return unauthorized();

        const { questionId } = await request.json();

        const question = await databases.getDocument(db, questionCollection, questionId);
        if (question.authorId !== user.$id) return forbidden();

        // Remove the question's answers along with their comments and votes
        while (true) {
            const { documents: answers } = await databases.listDocuments(db, answerCollection, [
                Query.equal("questionId", questionId),
                Query.limit(100),
            ]);
            if (answers.length === 0) break;

            await Promise.all(
                answers.map(async answer => {
                    await Promise.all([
                        deleteAllDocuments(commentCollection, [Query.equal("type", "answer"), Query.equal("typeId", answer.$id)]),
                        deleteAllDocuments(voteCollection, [Query.equal("type", "answer"), Query.equal("typeId", answer.$id)]),
                    ]);
                    await databases.deleteDocument(db, answerCollection, answer.$id);
                })
            );
        }

        await Promise.all([
            deleteAllDocuments(commentCollection, [Query.equal("type", "question"), Query.equal("typeId", questionId)]),
            deleteAllDocuments(voteCollection, [Query.equal("type", "question"), Query.equal("typeId", questionId)]),
            question.attachmentId
                ? storage.deleteFile(questionAttachmentBucket, question.attachmentId).catch(() => {})
                : null,
        ]);
        await databases.deleteDocument(db, questionCollection, questionId);

        return NextResponse.json({ data: { $id: questionId } }, { status: 200 });
    } catch (error) {
        return errorResponse(error, "Error deleting question");
    }
}
