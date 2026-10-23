import { questionAttachmentBucket } from "../name"
import { storage } from "./config"
import { isNotFound } from "./helpers"
import { publicReadOnly, samePermissions } from "./permissions"

const allowedExtensions = ["jpg","png","gif","jpeg","webp","heic"]

export default async function getOrCreateStorage(){
    try {
        const bucket = await storage.getBucket(questionAttachmentBucket)
        console.log("storage Connected");

        // Older buckets let any logged-in user change files; uploads now go through /api/question
        if (!samePermissions(bucket.$permissions, publicReadOnly) || bucket.fileSecurity) {
            await storage.updateBucket(
                questionAttachmentBucket,
                bucket.name,
                publicReadOnly,
                false,
                bucket.enabled,
                bucket.maximumFileSize,
                bucket.allowedFileExtensions,
            )
            console.log("Storage permissions updated");
        }
    } catch (error) {
        if (!isNotFound(error)) throw error;

        await storage.createBucket(
            questionAttachmentBucket,
            questionAttachmentBucket,
            publicReadOnly,
            false,
            undefined,
            undefined,
            allowedExtensions
        );
        console.log("Storage Created");
    }
}
