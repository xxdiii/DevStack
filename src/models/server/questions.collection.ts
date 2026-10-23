import { IndexType } from "node-appwrite"
import { publicReadOnly } from "./permissions"
import { db, questionCollection } from "../name"
import { databases } from "./config"

export default async function createQuestionCollection(){
    await databases.createCollection(db,questionCollection,questionCollection,publicReadOnly)
    console.log("Question collection is created");

    //creating attributes and indexes

    await Promise.all([
        databases.createStringAttribute(db,questionCollection,"title",100,true ),
        databases.createStringAttribute(db,questionCollection,"content",10000,true ),
        databases.createStringAttribute(db,questionCollection,"authorId",50,true ),
        databases.createStringAttribute(db,questionCollection,"tags",50,true, undefined,true ),
        databases.createStringAttribute(db,questionCollection,"attachmentId",50,false),
    ])
    console.log("Question attribute created");
}

// Appwrite builds attributes in the background; indexes need them to be ready
async function waitForAttribute(key: string, attempts = 30) {
    for (let i = 0; i < attempts; i++) {
        const attribute = await databases.getAttribute(db, questionCollection, key) as { status?: string };
        if (attribute.status === "available") return;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error(`Attribute "${key}" is not available yet`);
}

// Query.search() on the questions page needs a full-text index per attribute.
// Runs on every startup so databases created before this existed get them too.
export async function ensureQuestionSearchIndexes(){
    const { indexes } = await databases.listIndexes(db, questionCollection);

    for (const attribute of ["title", "content"]) {
        const exists = indexes.some(
            index => index.type === IndexType.Fulltext && index.attributes.length === 1 && index.attributes[0] === attribute
        );
        if (exists) continue;

        await waitForAttribute(attribute);
        await databases.createIndex(db, questionCollection, `${attribute}_search`, IndexType.Fulltext, [attribute]);
        console.log(`Full-text index on question ${attribute} created`);
    }
}
