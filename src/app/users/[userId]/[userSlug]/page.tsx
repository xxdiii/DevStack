import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import React from "react";
import { MagicCard, MagicContainer } from "@/components/magicui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { answerCollection, db, questionCollection } from "@/models/name";
import { Query } from "node-appwrite";

const Page = async ({ params }: {params: Promise<{ userId: string; userSlug: string }>;}) => {
    const { userId } = await params;

    const [user, questions, answers] = await Promise.all([
        users.get<UserPrefs>(userId),
        databases.listDocuments(db, questionCollection, [
            Query.equal("authorId", userId),
            Query.limit(1),
        ]),
        databases.listDocuments(db, answerCollection, [
            Query.equal("authorId", userId),
            Query.limit(1),
        ]),
    ]);

    return (
        <div className="grid w-full gap-4 lg:grid-cols-3">
            <MagicCard className="min-h-56 w-full cursor-pointer overflow-hidden shadow-2xl">
                <div className="flex min-h-56 w-full flex-col p-6">
                    <div className="text-left">
                        <h2 className="text-xl font-medium">Reputation</h2>
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                        <p className="z-10 whitespace-nowrap text-5xl font-medium text-gray-800 dark:text-gray-200">
                            <NumberTicker value={Number(user.prefs?.reputation ?? 0)} />
                        </p>
                    </div>
                </div>
                <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
            </MagicCard>
            <MagicCard className="min-h-56 w-full cursor-pointer overflow-hidden shadow-2xl">
                <div className="flex min-h-56 w-full flex-col p-6">
                    <div className="text-left">
                        <h2 className="text-xl font-medium">Questions asked</h2>
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                        <p className="z-10 whitespace-nowrap text-5xl font-medium text-gray-800 dark:text-gray-200">
                            <NumberTicker value={questions.total} />
                        </p>
                    </div>
                </div>
                <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
            </MagicCard>
            <MagicCard className="min-h-56 w-full cursor-pointer overflow-hidden shadow-2xl">
                <div className="flex min-h-56 w-full flex-col p-6">
                    <div className="text-left">
                        <h2 className="text-xl font-medium">Answers given</h2>
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                        <p className="z-10 whitespace-nowrap text-5xl font-medium text-gray-800 dark:text-gray-200">
                            <NumberTicker value={answers.total} />
                        </p>
                    </div>
                </div>
                <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
            </MagicCard>
        </div>
    );
};

export default Page;