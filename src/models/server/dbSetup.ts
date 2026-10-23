import { answerCollection, commentCollection, db, questionCollection, voteCollection } from "../name";
import createCommentCollection from "./comment.collection";
import createQuestionCollection, { ensureQuestionSearchIndexes } from "./questions.collection";
import createanswerCollection from "./answer.collection";
import createVoteCollection from "./vote.collection";
import { databases } from "./config";
import { isNotFound } from "./helpers";
import { publicReadOnly, samePermissions } from "./permissions";

// Older databases were created letting any logged-in user edit or delete any
// document. Bring them in line with the read-only permissions.
async function syncCollectionPermissions(){
    await Promise.all(
        [questionCollection, answerCollection, commentCollection, voteCollection].map(async collectionId => {
            const collection = await databases.getCollection(db, collectionId);
            if (samePermissions(collection.$permissions, publicReadOnly) && !collection.documentSecurity) return;

            await databases.updateCollection(db, collectionId, collection.name, publicReadOnly, false, collection.enabled);
            console.log(`Permissions updated for ${collectionId}`);
        })
    );
}

export default async function getOrCreateDB(){
    try {
        await databases.get(db)
        console.log("Database Connected");
    } catch (error) {
        // Only create on a real "not found"; a network error or paused project must not trigger it
        if (!isNotFound(error)) throw error;

        await databases.create(db,db)
        await Promise.all([
            createCommentCollection(),
            createQuestionCollection(),
            createVoteCollection(),
            createanswerCollection(),
        ])
        console.log("Database created");
    }

    await Promise.all([syncCollectionPermissions(), ensureQuestionSearchIndexes()]);

    return databases
}
