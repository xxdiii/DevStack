import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import { errorResponse, getAuthUser, unauthorized } from "@/models/server/auth";
import { changeReputation, getVoteScore } from "@/models/server/helpers";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) return unauthorized();

        const { type, typeId, voteStatus } = await request.json();

        if (
            (type !== "question" && type !== "answer") ||
            (voteStatus !== "upvoted" && voteStatus !== "downvoted") ||
            !typeId
        ) {
            return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
        }

        // Throws 404 if the target doesn't exist
        const collection = type === "question" ? questionCollection : answerCollection;
        const questionOrAnswer = await databases.getDocument(db, collection, typeId);

        // 1. Check for existing vote
        const response = await databases.listDocuments(db, voteCollection, [
            Query.equal("type", type),
            Query.equal("typeId", typeId),
            Query.equal("votedById", user.$id)
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
                votedById: user.$id,
                voteStatus
            });

            // Apply the new vote's effect on reputation
            reputationChange += voteStatus === "upvoted" ? 1 : -1;
            message = existingVote ? "Vote status updated" : "Voted";
        }

        // 4. Update the author's reputation exactly ONCE if it changed
        if (reputationChange !== 0) {
            await changeReputation(questionOrAnswer.authorId, reputationChange);
        }

        // 5. Get the final vote result and return
        const voteResult = await getVoteScore(type, typeId);

        return NextResponse.json(
            {
                data: { document: newDoc, voteResult },
                message: message,
            },
            { status: 201 }
        );

    } catch (error) {
        return errorResponse(error, "Error handling vote");
    }
}
