import { AppwriteException, Models, Query } from "node-appwrite";
import { answerCollection, db, voteCollection } from "../name";
import { databases, users } from "./config";
import type { UserPrefs } from "@/store/Auth";

export interface Author {
    $id: string;
    name: string;
    reputation: number;
}

export function isNotFound(error: unknown) {
    return error instanceof AppwriteException && error.code === 404;
}

// Falls back to a placeholder so a deleted user doesn't crash the page
export async function getAuthor(userId: string): Promise<Author> {
    try {
        const user = await users.get<UserPrefs>(userId);
        return {
            $id: user.$id,
            name: user.name,
            reputation: Number(user.prefs?.reputation ?? 0),
        };
    } catch (error) {
        if (!isNotFound(error)) throw error;
        return { $id: userId, name: "Deleted user", reputation: 0 };
    }
}

export async function getVotes(type: "question" | "answer", typeId: string) {
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
    return { upvotes, downvotes };
}

export async function getVoteScore(type: "question" | "answer", typeId: string) {
    const { upvotes, downvotes } = await getVotes(type, typeId);
    return upvotes.total - downvotes.total;
}

// Adds author, answer count and net vote score for QuestionCard
export async function enrichQuestions(questions: Models.Document[]) {
    return Promise.all(
        questions.map(async ques => {
            const [author, answers, totalVotes] = await Promise.all([
                getAuthor(ques.authorId),
                databases.listDocuments(db, answerCollection, [
                    Query.equal("questionId", ques.$id),
                    Query.limit(1),
                ]),
                getVoteScore("question", ques.$id),
            ]);

            return {
                ...ques,
                totalAnswers: answers.total,
                totalVotes,
                author,
            };
        })
    );
}

// Deletes every document matching the queries, 100 at a time
export async function deleteAllDocuments(collectionId: string, queries: string[]) {
    while (true) {
        const { documents } = await databases.listDocuments(db, collectionId, [
            ...queries,
            Query.limit(100),
        ]);
        if (documents.length === 0) return;
        await Promise.all(documents.map(doc => databases.deleteDocument(db, collectionId, doc.$id)));
    }
}

export async function changeReputation(userId: string, change: number) {
    try {
        const prefs = await users.getPrefs<UserPrefs>(userId);
        await users.updatePrefs<UserPrefs>(userId, {
            ...prefs,
            reputation: Number(prefs.reputation || 0) + change,
        });
    } catch (error) {
        if (!isNotFound(error)) throw error;
    }
}
