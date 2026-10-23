import QuestionCard from "@/components/QuestionCard";
import { db, questionCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import { enrichQuestions } from "@/models/server/helpers";
import { Query } from "node-appwrite";

const LatestQuestions = async () => {
    const questions = await databases.listDocuments(db, questionCollection, [
        Query.limit(5),
        Query.orderDesc("$createdAt"),
    ]);

    const documents = await enrichQuestions(questions.documents);

    if (documents.length === 0) {
        return <p className="text-white/60">No questions yet. Be the first to ask one!</p>;
    }

    return (
        <div className="space-y-6">
            {documents.map(question => (
                <QuestionCard key={question.$id} ques={question} />
            ))}
        </div>
    );
};

export default LatestQuestions;
