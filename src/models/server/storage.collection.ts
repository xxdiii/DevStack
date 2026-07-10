import {IndexType, Permission,Role} from "node-appwrite"
import { questionAttachmentBucket } from "../name"
import { storage } from "./config"

export default async function getOrCreateStorage(){
    try {
        await storage.getBucket(questionAttachmentBucket)
        console.log("storage Connected");  
    } catch (error) {
        try {
            await storage.createBucket(
                questionAttachmentBucket,
                questionAttachmentBucket,
                [
                    Permission.read(Role.any()),
                    Permission.read(Role.users()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ],
                false,
                undefined,
                undefined,
                ["jpg","png","gif","jpeg","webp","heic"]
            );

            console.log("Storage Created");
            console.log("Storage Connected");
            
        } catch (error) {
            console.error("Error creating storage",error);
            
        }
    }
    

    
    
}