import { answerCollection, commentCollection, db, questionCollection, voteCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import { errorResponse, forbidden, getAuthUser, unauthorized } from "@/models/server/auth";
import { changeReputation, deleteAllDocuments } from "@/models/server/helpers";
import { NextRequest, NextResponse} from "next/server";
import { ID, Query } from "node-appwrite";

export async function POST(request: NextRequest){
    try {
        const user = await getAuthUser(request)
        if (!user) return unauthorized()

        const {questionId,answer} = await request.json()
        const content = String(answer || "").trim()

        if (!questionId || !content) {
            return NextResponse.json({error: "Question and answer are required"}, {status: 400})
        }
        if (content.length > 10000) {
            return NextResponse.json({error: "Answer must be at most 10000 characters"}, {status: 400})
        }

        // Throws 404 if the question doesn't exist
        await databases.getDocument(db, questionCollection, questionId)

        const response = await databases.createDocument(db,answerCollection,ID.unique(),{
            content,
            questionId,
            authorId: user.$id,
        })

        await changeReputation(user.$id, 1)

        return NextResponse.json(response,{status:201})

    } catch (error) {
        return errorResponse(error, "Error creating answer")
    }
}

export async function DELETE(request: NextRequest){
    try {
        const user = await getAuthUser(request)
        if (!user) return unauthorized()

        const {answerId} = await request.json()

        const answer = await databases.getDocument(db,answerCollection,answerId)
        if (answer.authorId !== user.$id) return forbidden()

        await Promise.all([
            deleteAllDocuments(commentCollection, [Query.equal("type", "answer"), Query.equal("typeId", answerId)]),
            deleteAllDocuments(voteCollection, [Query.equal("type", "answer"), Query.equal("typeId", answerId)]),
        ])
        await databases.deleteDocument(db,answerCollection,answerId)

        await changeReputation(answer.authorId, -1)

        return NextResponse.json({data: {$id: answerId}},{status:200})

    } catch (error) {
        return errorResponse(error, "Error deleting answer")
    }
}
