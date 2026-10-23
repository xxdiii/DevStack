"use client";

import { databases } from "@/models/client/config";
import { db, voteCollection } from "@/models/name";
import { useAuthStore } from "@/store/Auth";
import { cn } from "@/lib/utils";
import { IconCaretUpFilled, IconCaretDownFilled } from "@tabler/icons-react";
import { Models, Query } from "appwrite";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import apiFetch, { readError } from "@/lib/apiFetch";

const VoteButtons =({
    type,
    id,
    upvotes,
    downvotes,
    className,
}:{
    type: "question" | "answer",
    id: string,
    upvotes: Models.DocumentList<Models.Document>,
    downvotes: Models.DocumentList<Models.Document>,
    className?: string,
})=>{
    const [votedDocument,setVotedDocument] = useState<Models.Document | null>()
    const [voteResult,setVoteResult] = useState<number>((upvotes?.total ?? 0) - (downvotes?.total ?? 0))

    const router = useRouter();
    const { user } = useAuthStore();

    useEffect(()=>{
        (
            async()=>{
                if (!user) return setVotedDocument(() => null);
                try {
                    const response = await databases.listDocuments(db,voteCollection, [
                        Query.equal("type",type),
                        Query.equal("typeId",id),
                        Query.equal("votedById",user.$id),
                    ])
                    setVotedDocument(()=>response.documents[0] || null );
                } catch {
                    // Still allow voting; the server works out the existing vote
                    setVotedDocument(() => null);
                }
            }
        )();
    },[user,id,type])

    const vote = async (voteStatus: "upvoted" | "downvoted")=>{
        if(!user) return router.push("/login");
        if(votedDocument === undefined) return;

        try {
            const response = await apiFetch("/api/vote",{
                method: "POST",
                body: JSON.stringify({
                    voteStatus,
                    type,
                    typeId: id,
                }),
            });
            if (!response.ok) throw new Error(await readError(response, "Something went wrong"));

            const data = await response.json();
            setVoteResult(()=>data.data.voteResult);
            setVotedDocument(()=>data.data.document)
            router.refresh();
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Something went wrong");
        }
    }

    return (
        <div className={cn("flex shrink-0 flex-col items-center justify-start gap-y-4", className)}>
            <button
                className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border p-1 duration-200 hover:bg-white/10",
                    votedDocument && votedDocument.voteStatus === "upvoted"
                        ? "border-orange-500 text-orange-500"
                        : "border-white/30"
                )}
                onClick={() => vote("upvoted")}
            >
                <IconCaretUpFilled />
            </button>
            <span>{voteResult}</span>
            <button
                className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border p-1 duration-200 hover:bg-white/10",
                    votedDocument && votedDocument.voteStatus === "downvoted"
                        ? "border-orange-500 text-orange-500"
                        : "border-white/30"
                )}
                onClick={() => vote("downvoted")}
            >
                <IconCaretDownFilled />
            </button>
        </div>
    );
}

export default VoteButtons;