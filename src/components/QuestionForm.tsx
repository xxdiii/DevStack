"use client";

import RTE from "@/components/RTE";
import {Meteors} from "@/components/magicui/meteors";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/Auth";
import { cn } from "@/lib/utils";
import slugify from "@/utils/slugify";
import { IconX } from "@tabler/icons-react";
import { Models } from "appwrite";
import { useRouter } from "next/navigation";
import React from "react";
import confetti from "canvas-confetti";

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "relative flex w-full min-w-0 flex-col space-y-2 overflow-hidden rounded-xl border border-white/20 bg-slate-950 p-4",
                className
            )}
        >
            <Meteors number={30} />
            {children}
        </div>
    );
};

/**
 * ******************************************************************************
 * ![INFO]: for buttons, refer to https://ui.aceternity.com/components/tailwindcss-buttons
 * ******************************************************************************
 */
const QuestionForm = ({ question }: { question?: Models.Document }) => {
    const { user, hydrated } = useAuthStore();
    const [tag, setTag] = React.useState("");
    const [showImageUpload, setShowImageUpload] = React.useState(false);
    const router = useRouter();

    const [formData, setFormData] = React.useState({
        title: String(question?.title || ""),
        content: String(question?.content || ""),
        authorId: user?.$id,
        tags: new Set((question?.tags || []) as string[]),
        attachment: null as File | null,
    });

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        if (!hydrated) return;

        setFormData(prev => ({
            ...prev,
            authorId: user?.$id,
        }));
    }, [hydrated, user?.$id]);

    const loadConfetti = (timeInMS = 3000) => {
        const end = Date.now() + timeInMS; // 3 seconds
        const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

        const frame = () => {
            if (Date.now() > end) return;

            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                startVelocity: 60,
                origin: { x: 0, y: 0.5 },
                colors: colors,
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                startVelocity: 60,
                origin: { x: 1, y: 0.5 },
                colors: colors,
            });

            requestAnimationFrame(frame);
        };

        frame();
    };

    const readErrorMessage = async (response: Response) => {
        const text = await response.text();

        try {
            const data = JSON.parse(text) as { error?: string };
            return data.error || text || "Request failed";
        } catch {
            return text || "Request failed";
        }
    };

    const create = async () => {
        const apiFormData = new FormData();
        apiFormData.append('title', formData.title);
        apiFormData.append('content', formData.content);
        apiFormData.append('authorId', formData.authorId!);
        apiFormData.append('tags', JSON.stringify(Array.from(formData.tags)));
        
        if (formData.attachment) {
            apiFormData.append('attachment', formData.attachment);
        }

        const response = await fetch('/api/question', {
            method: 'POST',
            body: apiFormData,
        });

        if (!response.ok) {
            throw new Error(await readErrorMessage(response));
        }

        const result = await response.json();
        loadConfetti();

        return result.question;
    };

    const update = async () => {
        if (!question) throw new Error("Please provide a question");

        const apiFormData = new FormData();
        apiFormData.append('questionId', question.$id);
        apiFormData.append('title', formData.title);
        apiFormData.append('content', formData.content);
        apiFormData.append('authorId', formData.authorId!);
        apiFormData.append('tags', JSON.stringify(Array.from(formData.tags)));
        apiFormData.append('currentAttachmentId', question.attachmentId || '');
        
        if (formData.attachment) {
            apiFormData.append('attachment', formData.attachment);
        }

        const response = await fetch('/api/question', {
            method: 'PUT',
            body: apiFormData,
        });

        if (!response.ok) {
            throw new Error(await readErrorMessage(response));
        }

        const result = await response.json();
        return result.question;
    };

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.title?.trim()) {
            setError(() => "Please enter a question title");
            return;
        }
        
        if (!formData.content?.trim()) {
            setError(() => "Please describe your problem in detail");
            return;
        }
        
        if (!formData.authorId) {
            setError(() => "User authentication required");
            return;
        }
        
        if (formData.title.trim().length < 10) {
            setError(() => "Question title must be at least 10 characters long");
            return;
        }
        
        if (formData.content.trim().length < 20) {
            setError(() => "Question description must be at least 20 characters long");
            return;
        }

        setLoading(() => true);
        setError(() => "");

        try {
            console.log("Creating/updating question with data:", {
                title: formData.title,
                content: formData.content,
                authorId: formData.authorId,
                tags: Array.from(formData.tags),
            });
            
            const response = question ? await update() : await create();
            
            console.log("Question created/updated successfully:", response);

            router.push(`/questions/${response.$id}/${slugify(formData.title)}`);
        } catch (error: any) {
            console.error("Error creating/updating question:", error);
            setError(() => error.message);
        }

        setLoading(() => false);
    };

    return (
        <form className="space-y-4" onSubmit={submit}>
            {error && (
                <LabelInputContainer>
                    <div className="text-center">
                        <span className="text-red-400 font-medium bg-red-900/20 px-4 py-2 rounded-md border border-red-500/30">{error}</span>
                    </div>
                </LabelInputContainer>
            )}
            <LabelInputContainer>
                <Label htmlFor="title" className="text-white">
                    Title Address
                    <br />
                    <small className="text-slate-300">
                        Be specific and imagine you&apos;re asking a question to another person.
                    </small>
                </Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Is there an R function for finding the index of an element in a vector?"
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-slate-800 text-white border-slate-600 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500"
                />
            </LabelInputContainer>
            <LabelInputContainer>
                <Label htmlFor="content" className="text-white">
                    What are the details of your problem?
                    <br />
                    <small className="text-slate-300">
                        Introduce the problem and expand on what you put in the title. Minimum 20
                        characters.
                    </small>
                </Label>
                <div className="rte-container w-full min-w-0" data-color-mode="dark">
                    <RTE
                        value={formData.content}
                        onChange={value => setFormData(prev => ({ ...prev, content: value || "" }))}
                        data-color-mode="dark"
                        className="w-full"
                        enablePreview={true}
                        showToolbar={true}
                        visible={true}
                        visibleEditor={true}
                        previewWidth="50%"
                        height="300px"
                    />
                </div>
            </LabelInputContainer>
            <LabelInputContainer>
                <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="image" className="text-white">
                        Image
                        <br />
                        <small className="text-slate-300">
                            Optional. Add one only if it helps explain the problem.
                        </small>
                    </Label>
                    <button
                        type="button"
                        onClick={() => setShowImageUpload(prev => !prev)}
                        className="rounded-full border border-slate-600 bg-slate-800 px-4 py-2 text-xs font-medium text-white transition hover:border-slate-500 hover:bg-slate-700"
                    >
                        {showImageUpload ? "Hide image" : "Add image"}
                    </button>
                </div>
                {showImageUpload && (
                    <div className="space-y-3">
                        <Input
                            id="image"
                            name="image"
                            accept="image/*"
                            type="file"
                            onChange={e => {
                                const files = e.target.files;
                                if (!files || files.length === 0) return;
                                setFormData(prev => ({
                                    ...prev,
                                    attachment: files[0],
                                }));
                            }}
                            className="bg-slate-800 text-white border-slate-600 file:text-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500"
                        />
                        {formData.attachment && (
                            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200">
                                <span className="truncate">{formData.attachment.name}</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, attachment: null }))}
                                    className="ml-3 rounded-md border border-slate-600 px-2 py-1 text-xs text-white transition hover:bg-slate-700"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </LabelInputContainer>
            <LabelInputContainer>
                <Label htmlFor="tag" className="text-white">
                    Tags
                    <br />
                    <small className="text-slate-300">
                        Add tags to describe what your question is about. Start typing to see
                        suggestions.
                    </small>
                </Label>
                <div className="flex w-full gap-4">
                    <div className="w-full">
                        <Input
                            id="tag"
                            name="tag"
                            placeholder="e.g. (java c objective-c)"
                            type="text"
                            value={tag}
                            onChange={e => setTag(() => e.target.value)}
                            className="bg-slate-800 text-white border-slate-600 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500"
                        />
                    </div>
                    <button
                        className="relative shrink-0 rounded-full border border-slate-600 bg-slate-700 px-8 py-2 text-sm text-white transition duration-200 hover:shadow-2xl hover:shadow-white/10"
                        type="button"
                        onClick={() => {
                            if (tag.length === 0) return;
                            setFormData(prev => ({
                                ...prev,
                                tags: new Set([...Array.from(prev.tags), tag]),
                            }));
                            setTag(() => "");
                        }}
                    >
                        <div className="absolute inset-x-0 -top-px mx-auto h-px w-1/2 bg-linear-to-r from-transparent via-teal-500 to-transparent shadow-2xl" />
                        <span className="relative z-20">Add</span>
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {Array.from(formData.tags).map((tag, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="group relative inline-block rounded-full bg-slate-800 p-px text-xs font-semibold leading-6 text-white no-underline shadow-2xl shadow-zinc-900">
                                <span className="absolute inset-0 overflow-hidden rounded-full">
                                    <span className="absolute inset-0 rounded-full bg-[radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                </span>
                                <div className="relative z-10 flex items-center space-x-2 rounded-full bg-zinc-950 px-4 py-0.5 ring-1 ring-white/10">
                                    <span>{tag}</span>
                                    <button
                                        onClick={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                tags: new Set(
                                                    Array.from(prev.tags).filter(t => t !== tag)
                                                ),
                                            }));
                                        }}
                                        type="button"
                                    >
                                        <IconX size={12} />
                                    </button>
                                </div>
                                <span className="absolute bottom-0 left-4.5 h-px w-[calc(100%-2.25rem)] bg-linear-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                            </div>
                        </div>
                    ))}
                </div>
            </LabelInputContainer>
            <button
                className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-size-[200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                type="submit"
                disabled={loading}
            >
                {question ? "Update" : "Publish"}
            </button>
        </form>
    );
};

export default QuestionForm;