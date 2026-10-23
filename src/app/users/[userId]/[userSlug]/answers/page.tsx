import Pagination from "@/components/Pagination";
import { MarkdownPreview } from "@/components/RTE";
import { answerCollection, db, questionCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import { isNotFound } from "@/models/server/helpers";
import slugify from "@/utils/slugify";
import Link from "next/link";
import { Models, Query } from "node-appwrite";
import React from "react";

const Page = async ({
    params,
    searchParams,
}: {
    params: Promise<{ userId: string; userSlug: string }>;
    searchParams: Promise<{ page?: string }>;
}) => {
    const { userId } = await params;
    const { page = "1" } = await searchParams;
    const pageNumber = Math.max(1, parseInt(page) || 1);

    const queries = [
        Query.equal("authorId", userId),
        Query.orderDesc("$createdAt"),
        Query.offset((pageNumber - 1) * 25),
        Query.limit(25),
    ];

    const answers = await databases.listDocuments(db, answerCollection, queries);

    const documents = await Promise.all(
        answers.documents.map(async (ans): Promise<Models.Document & { question: { title?: string } | null }> => {
            try {
                const question = await databases.getDocument(db, questionCollection, ans.questionId, [
                    Query.select(["title"]),
                ]);
                return { ...ans, question: { title: String(question.title) } };
            } catch (error) {
                // The question may have been deleted
                if (!isNotFound(error)) throw error;
                return { ...ans, question: null };
            }
        })
    );

    return (
        <div className="px-4">
            <div className="mb-4">
                <p>{answers.total} answers</p>
            </div>
            <div className="mb-4 max-w-3xl space-y-6">
                {documents.map(ans => (
                    <div key={ans.$id}>
                        <div className="max-h-40 overflow-auto">
                            <MarkdownPreview source={ans.content} className="rounded-lg p-4" />
                        </div>
                        {ans.question ? (
                            <Link
                                href={`/questions/${ans.questionId}/${slugify(ans.question.title || "")}`}
                                className="mt-3 inline-block shrink-0 rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600"
                            >
                                Question
                            </Link>
                        ) : (
                            <p className="mt-3 text-sm text-white/60">The question was deleted.</p>
                        )}
                    </div>
                ))}
            </div>
            <Pagination total={answers.total} limit={25} />
        </div>
    );
};

export default Page;
