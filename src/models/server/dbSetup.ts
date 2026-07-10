import { db } from "../name";
import createCommentCollection from "./comment.collection";
import createQuestionCollection from "./questions.collection";
import createanswerCollection from "./answer.collection";
import createVoteCollection from "./vote.collection";
import { databases } from "./config";

export default async function getOrCreateDB(){
    try {
        await databases.get(db)
        console.log("Database Connected");
        
    } catch (error) {
        try {
            await databases.create(db,db)   
            console.log("Database created");
            await Promise.all([
                createCommentCollection(),
                createQuestionCollection(),
                createVoteCollection(),
                createanswerCollection(),
            ])
            console.log("Database created");
            console.log("Database connected");
            
        } catch (error) {
            console.error("Database connection falied",error);
            
        }
    }

    return databases
}