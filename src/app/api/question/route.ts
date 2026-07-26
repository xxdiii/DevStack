import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";

import { questionAttachmentBucket, questionCollection, db } from "@/models/name";
import { databases, storage } from "@/models/server/config";

async function uploadAttachment(file: File | null) {
    if (!file || file.size === 0) return null;

    const uploaded = await storage.createFile(questionAttachmentBucket, ID.unique(), file);
    return uploaded.$id;
}

function parseTags(tagsValue: FormDataEntryValue | null) {
    if (typeof tagsValue !== "string" || !tagsValue.trim()) return [] as string[];

    try {
        const parsed = JSON.parse(tagsValue);
        return Array.isArray(parsed) ? parsed.map(tag => String(tag)) : [];
    } catch {
        return [] as string[];
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const title = String(formData.get("title") || "").trim();
        const content = String(formData.get("content") || "").trim();
        const authorId = String(formData.get("authorId") || "").trim();
        const tags = parseTags(formData.get("tags"));
        const attachment = formData.get("attachment");

        if (!title || !content || !authorId) {
            return NextResponse.json(
                { error: "Title, content and author are required" },
                { status: 400 }
            );
        }

        const attachmentId = attachment instanceof File ? await uploadAttachment(attachment) : null;

        const response = await databases.createDocument(db, questionCollection, ID.unique(), {
            title,
            content,
            authorId,
            tags,
            ...(attachmentId ? { attachmentId } : {}),
        });

        return NextResponse.json({ question: response }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Error creating question" },
            { status: error?.status || 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const formData = await request.formData();
        const questionId = String(formData.get("questionId") || "").trim();
        const title = String(formData.get("title") || "").trim();
        const content = String(formData.get("content") || "").trim();
        const authorId = String(formData.get("authorId") || "").trim();
        const tags = parseTags(formData.get("tags"));
        const currentAttachmentId = String(formData.get("currentAttachmentId") || "").trim();
        const attachment = formData.get("attachment");

        if (!questionId || !title || !content || !authorId) {
            return NextResponse.json(
                { error: "Question id, title, content and author are required" },
                { status: 400 }
            );
        }

        let attachmentId = currentAttachmentId || null;

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
            authorId,
            tags,
        };

        if (attachmentId) {
            payload.attachmentId = attachmentId;
        }

        const response = await databases.updateDocument(db, questionCollection, questionId, payload);

        return NextResponse.json({ question: response }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Error updating question" },
            { status: error?.status || 500 }
        );
    }
}