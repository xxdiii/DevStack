import { publicReadOnly } from "./permissions"
import { db, commentCollection } from "../name"
import { databases } from "./config"

export default async function createCommentCollection(){
    await databases.createCollection(db,commentCollection,commentCollection,publicReadOnly)
    console.log("Comment Collection Created");
    

    //Creating attribute
    await Promise.all([
        databases.createStringAttribute(db,commentCollection,"content",10000,true),
        databases.createEnumAttribute(db,commentCollection,"type",["answer","question"],true),
        databases.createStringAttribute(db,commentCollection,"typeId",50,true),
        databases.createStringAttribute(db,commentCollection,"authorId",50,true),
    ]);
    console.log("Comment attribute created");
    
}