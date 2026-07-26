import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

async function getVoteResult(type: "question" | "answer", typeId: string) {
    const [upvotes, downvotes] = await Promise.all([
        databases.listDocuments(db, voteCollection, [
            Query.equal("type", type),
            Query.equal("typeId", typeId),
            Query.equal("voteStatus", "upvoted"),
            Query.limit(1),
        ]),
        databases.listDocuments(db, voteCollection, [
            Query.equal("type", type),
            Query.equal("typeId", typeId),
            Query.equal("voteStatus", "downvoted"),
            Query.limit(1),
        ]),
    ]);

    return upvotes.total - downvotes.total;
}

export async function POST(request: NextRequest) {
    try {
        const { type, typeId, voteStatus, votedById } = await request.json();

        // 1. Check for existing vote
        const response = await databases.listDocuments(db, voteCollection, [
            Query.equal("type", type),
            Query.equal("typeId", typeId),
            Query.equal("votedById", votedById)
        ]);

        const existingVote = response.documents.length > 0 ? response.documents[0] : null;
        let reputationChange = 0;

        // 2. If an old vote exists, delete it and revert its effect on reputation
        if (existingVote) {
            await databases.deleteDocument(db, voteCollection, existingVote.$id);
            reputationChange -= existingVote.voteStatus === "upvoted" ? 1 : -1;
        }

        let newDoc = null;
        let message = "Vote withdrawn";

        // 3. If it's a brand new vote, OR they are switching their vote (e.g., Down to Up)
        if (existingVote?.voteStatus !== voteStatus) {
            newDoc = await databases.createDocument(db, voteCollection, ID.unique(), {
                typeId,
                type,
                votedById,
                voteStatus
            });
            
            // Apply the new vote's effect on reputation
            reputationChange += voteStatus === "upvoted" ? 1 : -1;
            message = existingVote ? "Vote status updated" : "Voted";
        }

        // 4. Update the author's reputation exactly ONCE if it changed
        if (reputationChange !== 0) {
            const collection = type === "question" ? questionCollection : answerCollection;
            const questionOrAnswer = await databases.getDocument(db, collection, typeId);
            const authorPrefs = await users.getPrefs<UserPrefs>(questionOrAnswer.authorId);
            
            await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId, {
                // Use a fallback to 0 in case reputation is undefined for a new user
                reputation: Number(authorPrefs.reputation || 0) + reputationChange
            });
        }

        // 5. Get the final vote result and return
        const voteResult = await getVoteResult(type, typeId);

        return NextResponse.json(
            {
                data: { document: newDoc, voteResult },
                message: message,
            },
            { status: 201 }
        );

    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Error handling vote" },
            { status: 500 }
        );
    }
}