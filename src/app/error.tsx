"use client";

import Link from "next/link";
import React, { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="container mx-auto flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
            <h1 className="text-3xl font-bold">Something went wrong</h1>
            <p className="max-w-md text-white/70">
                We couldn&apos;t load this page. The server may be temporarily unavailable. Please try again.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={reset}
                    className="rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600"
                >
                    Try again
                </button>
                <Link href="/" className="rounded border border-white/30 px-4 py-2 hover:bg-white/10">
                    Go home
                </Link>
            </div>
        </div>
    );
}
