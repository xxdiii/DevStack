import { answerCollection, commentCollection, db, questionCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import { errorResponse, forbidden, getAuthUser, unauthorized } from "@/models/server/auth";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) return unauthorized();

        const { type, typeId, content: rawContent } = await request.json();
        const content = String(rawContent || "").trim();

        if ((type !== "question" && type !== "answer") || !typeId || !content) {
            return NextResponse.json({ error: "Type, target and content are required" }, { status: 400 });
        }
        if (content.length > 10000) {
            return NextResponse.json({ error: "Comment must be at most 10000 characters" }, { status: 400 });
        }

        // Throws 404 if the target doesn't exist
        await databases.getDocument(db, type === "question" ? questionCollection : answerCollection, typeId);

        const response = await databases.createDocument(db, commentCollection, ID.unique(), {
            content,
            type,
            typeId,
            authorId: user.$id,
        });

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        return errorResponse(error, "Error creating comment");
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) return unauthorized();

        const { commentId } = await request.json();

        const comment = await databases.getDocument(db, commentCollection, commentId);
        if (comment.authorId !== user.$id) return forbidden();

        await databases.deleteDocument(db, commentCollection, commentId);

        return NextResponse.json({ data: { $id: commentId } }, { status: 200 });
    } catch (error) {
        return errorResponse(error, "Error deleting comment");
    }
}
