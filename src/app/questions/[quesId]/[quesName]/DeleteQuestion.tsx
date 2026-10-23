"use client";

import apiFetch, { readError } from "@/lib/apiFetch";
import { useAuthStore } from "@/store/Auth";
import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import React from "react";

const DeleteQuestion = ({
    questionId,
    authorId
}:{
    questionId: string,
    authorId: string,
})=>{
    const {user} = useAuthStore();
    const router = useRouter();

    const deleteQuestion = async ()=>{
        if (!window.confirm("Delete this question and all of its answers and comments?")) return;

        try {
            const response = await apiFetch("/api/question", {
                method: "DELETE",
                body: JSON.stringify({ questionId }),
            })
            if (!response.ok) throw new Error(await readError(response, "Something went wrong"))
            router.push("/questions")
            router.refresh()
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Something went wrong");
        }
    }

    return user?.$id === authorId ? (
        <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-red-500 p-1 text-red-500 duration-200 hover:bg-red-500/10"
            onClick={deleteQuestion}
        >
            <IconTrash className="h-4 w-4" />
        </button>
    ) : null;
}

export default DeleteQuestion;