import { databases } from "@/models/server/config";
import { db, questionCollection } from "@/models/name";
import { enrichQuestions } from "@/models/server/helpers";
import { Query } from "node-appwrite";
import React from "react";
import Link from "next/link";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import QuestionCard from "@/components/QuestionCard";
import Pagination from "@/components/Pagination";
import Search from "./Search";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    tag?: string;
    search?: string;
  }>;
}

const PAGE_SIZE = 25;

const Page = async ({ searchParams }: PageProps) => {
  const resolvedSearchParams = await searchParams;

  const page = Math.max(1, parseInt(resolvedSearchParams.page || "1") || 1);
  const tag = resolvedSearchParams.tag?.trim();
  const search = resolvedSearchParams.search?.trim();

  const queries = [
    Query.orderDesc("$createdAt"),
    Query.offset((page - 1) * PAGE_SIZE),
    Query.limit(PAGE_SIZE),
  ];

  // "tags" is an array attribute, which Appwrite only matches with contains
  if (tag) queries.push(Query.contains("tags", tag));
  if (search) {
    // Needs the full-text indexes created in questions.collection.ts
    queries.push(
      Query.or([
        Query.search("title", search),
        Query.search("content", search),
      ])
    );
  }

  const questions = await databases.listDocuments(db, questionCollection, queries);
  const formattedDocuments = await enrichQuestions(questions.documents);

  return (
    <div className="container mx-auto px-4 pb-20 pt-36">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Questions</h1>
        <Link href="/questions/ask">
          <ShimmerButton className="shadow-2xl">
            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
              Ask a question
            </span>
          </ShimmerButton>
        </Link>
      </div>
      <div className="mb-4">
        <Search />
      </div>
      <div className="mb-4">
        <p>
          {questions.total} questions
          {tag ? ` tagged #${tag}` : ""}
        </p>
      </div>
      <div className="mb-4 max-w-3xl space-y-6">
        {formattedDocuments.map((ques) => (
          <QuestionCard key={ques.$id} ques={ques} />
        ))}
      </div>
      <Pagination total={questions.total} limit={PAGE_SIZE} />
    </div>
  );
};

export default Page;
