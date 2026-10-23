"use client";

import apiFetch, { readError } from "@/lib/apiFetch";
import { useAuthStore } from "@/store/Auth";
import { cn } from "@/lib/utils"
import convertDateToRelativeTime from "@/utils/relativeTime";
import slugify from "@/utils/slugify";
import { IconTrash } from "@tabler/icons-react";
import { Models } from "appwrite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Comments =({
    comments: _comments,
    type,
    typeId,
    className,
}:{
    comments: Models.DocumentList<Models.Document>,
    type: "question" | "answer",
    typeId: string,
    className?: string;
})=>{
    const [comment,setComment] = useState(_comments)
    // Take the server's copy whenever router.refresh() delivers a new one
    const [serverComments, setServerComments] = useState(_comments)
    if (_comments !== serverComments) {
        setServerComments(_comments)
        setComment(_comments)
    }
    const [newComment,setNewComment] = useState("")
    const { user } = useAuthStore();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        if (!user) return router.push("/login");
        if (!newComment.trim()) return;

        try {
            const response = await apiFetch("/api/comment", {
                method: "POST",
                body: JSON.stringify({ content: newComment, type, typeId }),
            })
            if (!response.ok) throw new Error(await readError(response, "Error creating comment"))
            const data = await response.json()

            setNewComment(()=>"")
            setComment(prev=>({
                total : prev.total +1,
                documents : [
                    {...data, author: {$id: user.$id, name: user.name, reputation: user.prefs?.reputation ?? 0}},
                    ...prev.documents,
                ],
            }));
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Error creating comment");
        }
    }

    const deleteComment = async(commentId: string)=>{
        try {
            const response = await apiFetch("/api/comment", {
                method: "DELETE",
                body: JSON.stringify({ commentId }),
            })
            if (!response.ok) throw new Error(await readError(response, "Error deleting comment"))

            setComment(prev=>({
                total: prev.total-1,
                documents: prev.documents.filter(comment=> comment.$id !== commentId)
            }))
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Error deleting comment");
        }
    }

    return (
        <div className={cn("flex flex-col gap-2 pl-4", className)}>
            {comment.documents.map(comment => (
                <React.Fragment key={comment.$id}>
                    <hr className="border-white/40" />
                    <div className="flex gap-2">
                        <p className="text-sm">
                            {comment.content} -{" "}
                            <Link
                                href={`/users/${comment.authorId}/${slugify(comment.author.name)}`}
                                className="text-orange-500 hover:text-orange-600"
                            >
                                {comment.author.name}
                            </Link>{" "}
                            <span className="opacity-60">
                                {convertDateToRelativeTime(new Date(comment.$createdAt))}
                            </span>
                        </p>
                        {user?.$id === comment.authorId ? (
                            <button
                                onClick={() => deleteComment(comment.$id)}
                                className="shrink-0 text-red-500 hover:text-red-600"
                            >
                                <IconTrash className="h-4 w-4" />
                            </button>
                        ) : null}
                    </div>
                </React.Fragment>
            ))}
            <hr className="border-white/40" />
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <textarea
                    className="w-full rounded-md border border-white/20 bg-white/10 p-2 outline-none"
                    rows={1}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={e => setNewComment(() => e.target.value)}
                />
                <button className="shrink-0 rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600">
                    Add Comment
                </button>
            </form>
        </div>
    )
}

export default Comments;