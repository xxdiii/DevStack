import { publicReadOnly } from "./permissions"
import { db, voteCollection } from "../name"
import { databases } from "./config"

export default async function createVoteCollection(){
    await databases.createCollection(db,voteCollection,voteCollection,publicReadOnly)
    console.log("Vote Collection Created");
    

    //Creating attribute
    await Promise.all([
        databases.createEnumAttribute(db,voteCollection,"type",["answer","question"],true),
        databases.createStringAttribute(db,voteCollection,"typeId",50,true),
        databases.createEnumAttribute(db,voteCollection,"voteStatus",["upvoted","downvoted"],true),
        databases.createStringAttribute(db,voteCollection,"votedById",50,true),
    ]);
    console.log("Vote attribute created");
    
}