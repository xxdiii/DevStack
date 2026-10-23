"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

const Pagination = ({
    className,
    limit,
    total,
}:{
    className?: string,
    limit: number,
    total: number,
})=>{
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const totalPages = Math.max(1, Math.ceil(total/limit));

    const goTo = (pageNumber: number)=>{
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("page",`${pageNumber}`)
        router.push(`${pathname}?${newSearchParams}`)
    }

    const prev =()=>{
        if (page <= 1) return;
        goTo(page - 1)
    }

    const next =()=>{
        if (page >= totalPages) return;
        goTo(page + 1)
    }

    return (
        <div className="flex items-center justify-center gap-4">
            <button
                className={`${className} rounded-lg bg-white/10 px-2 py-0.5 duration-200 hover:bg-white/20 disabled:opacity-50`}
                onClick={prev}
                disabled={page <= 1}
            >
                Previous
            </button>
            <span>
                {page} of {totalPages}
            </span>
            <button
                className={`${className} rounded-lg bg-white/10 px-2 py-0.5 duration-200 hover:bg-white/20 disabled:opacity-50`}
                onClick={next}
                disabled={page >= totalPages}
            >
                Next
            </button>
        </div>
    );
}

export default Pagination
