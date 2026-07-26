import QuestionForm from "@/components/QuestionForm";
import React from "react";

export default function AskQuestion() {
    return (
        <div className="block pb-20 pt-32">
            <div className="container mx-auto px-4">
                <h1 className="mb-10 mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                    Ask a public question
                </h1>
                
                <div className="flex flex-wrap md:flex-row-reverse">
                    {/* Tips sidebar */}
                    <div className="w-full md:w-1/3 md:pl-8">
                        <div className="sticky top-32">
                            <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
                                <h2 className="mb-4 text-lg font-semibold text-blue-900 dark:text-blue-100">
                                    Writing a good question
                                </h2>
                                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                                    <li>• Summarize your problem in a one-line title</li>
                                    <li>• Describe your problem in detail</li>
                                    <li>• Include what you tried and what you expected</li>
                                    <li>• Add relevant tags to help others find your question</li>
                                    <li>• Review your question before posting</li>
                                </ul>
                            </div>
                            
                            <div className="mt-6 rounded-lg bg-yellow-50 p-6 dark:bg-yellow-900/20">
                                <h3 className="mb-2 font-semibold text-yellow-900 dark:text-yellow-100">
                                    Step 1: Draft your question
                                </h3>
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    The community is here to help you with specific programming problems, 
                                    but we expect you to do your homework first.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main form */}
                    <div className="w-full md:w-2/3">
                        <QuestionForm />
                    </div>
                </div>
            </div>
        </div>
    );
}