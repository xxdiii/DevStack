import { db, questionCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import { isNotFound } from "@/models/server/helpers";
import { notFound } from "next/navigation";
import { Models } from "node-appwrite";
import React from "react";
import EditQues from "./EditQues";

const Page = async ({ params }: { params: Promise<{ quesId: string; quesName: string }> }) => {
    const { quesId } = await params;

    let question: Models.Document;
    try {
        question = await databases.getDocument(db, questionCollection, quesId);
    } catch (error) {
        if (isNotFound(error)) notFound();
        throw error;
    }

    return <EditQues question={question} />;
};

export default Page;
