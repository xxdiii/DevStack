import {IndexType, Permission,Role} from "node-appwrite"
import { db, answerCollection } from "../name"
import { databases } from "./config"

export default async function createanswerCollection(){
    await databases.createCollection(db,answerCollection,answerCollection,[
        Permission.read(Role.any()),
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
    ])
    console.log("Answer collection is created");

    //creating attributes and indexes
    await Promise.all([
        databases.createStringAttribute(db,answerCollection,"content",10000,true ),
        databases.createStringAttribute(db,answerCollection,"questionId",50,true ),
        databases.createStringAttribute(db,answerCollection,"authorId",50,true ),
    ])
    console.log("Answer Attribute created");

    
    
}