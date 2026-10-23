import Answers from "@/components/Answers";
import Comments from "@/components/Comments";
import { MarkdownPreview } from "@/components/RTE";
import VoteButtons from "@/components/VoteButtons";
import { Particles } from "@/components/magicui/particles";
import {ShimmerButton} from "@/components/magicui/shimmer-button";
import { avatars } from "@/models/client/config";
import {
    answerCollection,
    db,
    questionCollection,
    commentCollection,
    questionAttachmentBucket,
} from "@/models/name";
import { databases } from "@/models/server/config";
import { getAuthor, getVotes, isNotFound } from "@/models/server/helpers";
import { storage } from "@/models/client/config";
import convertDateToRelativeTime from "@/utils/relativeTime";
import slugify from "@/utils/slugify";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Models, Query } from "node-appwrite";
import React from "react";
import DeleteQuestion from "./DeleteQuestion";
import EditQuestion from "./EditQuestion";
import { TracingBeam } from "@/components/ui/tracing-beam";

type Props = {
    params: Promise<{quesId: string; quesName: string}>;
};

async function withAuthors<T extends Models.Document>(documents: T[]) {
    return Promise.all(
        documents.map(async document => ({
            ...document,
            author: await getAuthor(document.authorId),
        }))
    );
}

const Page = async ({params}:Props)=>{
    const { quesId } = await params;

    let question: Models.Document;
    try {
        question = await databases.getDocument(db, questionCollection, quesId);
    } catch (error) {
        if (isNotFound(error)) notFound();
        throw error;
    }

    const [answers, { upvotes, downvotes }, comments, author] = await Promise.all([
        databases.listDocuments(db,answerCollection,[
            Query.orderDesc("$createdAt"),
            Query.equal("questionId", quesId),
            Query.limit(100),
        ]),
        getVotes("question", quesId),
        databases.listDocuments(db, commentCollection,[
            Query.orderDesc("$createdAt"),
            Query.equal("type","question"),
            Query.equal("typeId",quesId),
            Query.limit(100),
        ]),
        getAuthor(question.authorId),
    ])

    const [commentDocuments, answerDocuments] = await Promise.all([
        withAuthors(comments.documents),
        Promise.all(
            answers.documents.map(async(answer)=>{
                const [answerAuthor, answerVotes, answerComments] = await Promise.all([
                    getAuthor(answer.authorId),
                    getVotes("answer", answer.$id),
                    databases.listDocuments(db,commentCollection,[
                        Query.equal("type","answer"),
                        Query.equal("typeId",answer.$id),
                        Query.orderDesc("$createdAt"),
                        Query.limit(100),
                    ])
                ])

                return {
                    ...answer,
                    comments: {
                        total: answerComments.total,
                        documents: await withAuthors(answerComments.documents),
                    },
                    upvotes: answerVotes.upvotes,
                    downvotes: answerVotes.downvotes,
                    author: answerAuthor,
                }
            })
        )
    ])

    return (
        <TracingBeam className="container pl-6">
            <Particles
                className="fixed inset-0 h-full w-full"
                quantity={500}
                ease={100}
                color="#ffffff"
                refresh
            />
            <div className="relative mx-auto px-4 pb-20 pt-36">
                <div className="flex">
                    <div className="w-full">
                        <h1 className="mb-1 text-3xl font-bold">{question.title}</h1>
                        <div className="flex gap-4 text-sm">
                            <span>
                                Asked {convertDateToRelativeTime(new Date(question.$createdAt))}
                            </span>
                            <span>Answers {answers.total}</span>
                            <span>Votes {upvotes.total - downvotes.total}</span>
                        </div>
                    </div>
                    <Link href="/questions/ask" className="ml-auto inline-block shrink-0">
                        <ShimmerButton className="shadow-2xl">
                            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                                Ask a question
                            </span>
                        </ShimmerButton>
                    </Link>
                </div>
                <hr className="my-4 border-white/40" />
                <div className="flex gap-4">
                    <div className="flex shrink-0 flex-col items-center gap-4">
                        <VoteButtons
                            type="question"
                            id={question.$id}
                            className="w-full"
                            upvotes={upvotes}
                            downvotes={downvotes}
                        />
                        <EditQuestion
                            questionId={question.$id}
                            questionTitle={question.title}
                            authorId={question.authorId}
                        />
                        <DeleteQuestion questionId={question.$id} authorId={question.authorId} />
                    </div>
                    <div className="w-full overflow-auto">
                        <MarkdownPreview className="rounded-xl p-4" source={question.content} />
                        {question.attachmentId && (
                            <picture>
                                <img
                                    src={
                                        storage.getFilePreview(
                                            questionAttachmentBucket,
                                            question.attachmentId
                                        ).href
                                    }
                                    alt={question.title}
                                    className="mt-3 rounded-lg"
                                />
                            </picture>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                            {question.tags.map((tag: string) => (
                                <Link
                                    key={tag}
                                    href={`/questions?tag=${encodeURIComponent(tag)}`}
                                    className="inline-block rounded-lg bg-white/10 px-2 py-0.5 duration-200 hover:bg-white/20"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center justify-end gap-1">
                            <picture>
                                <img
                                    src={avatars.getInitials(author.name, 36, 36).href}
                                    alt={author.name}
                                    className="rounded-lg"
                                />
                            </picture>
                            <div className="block leading-tight">
                                <Link
                                    href={`/users/${author.$id}/${slugify(author.name)}`}
                                    className="text-orange-500 hover:text-orange-600"
                                >
                                    {author.name}
                                </Link>
                                <p>
                                    <strong>{author.reputation}</strong>
                                </p>
                            </div>
                        </div>
                        <Comments
                            comments={{ total: comments.total, documents: commentDocuments }}
                            className="mt-4"
                            type="question"
                            typeId={question.$id}
                        />
                        <hr className="my-4 border-white/40" />
                    </div>
                </div>
                <Answers answers={{ total: answers.total, documents: answerDocuments }} questionId={question.$id} />
            </div>
        </TracingBeam>
    );

}

export default Page;
