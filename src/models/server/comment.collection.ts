import {IndexType, Permission,Role} from "node-appwrite"
import { db, commentCollection } from "../name"
import { databases } from "./config"

export default async function createCommentCollection(){
    await databases.createCollection(db,commentCollection,commentCollection,[
        Permission.read(Role.any()),
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
    ])
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