import Link from "next/link";
import React from "react";

export default function NotFound() {
    return (
        <div className="container mx-auto flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
            <h1 className="text-3xl font-bold">Page not found</h1>
            <p className="max-w-md text-white/70">
                This question or user doesn&apos;t exist, or it was deleted.
            </p>
            <Link
                href="/questions"
                className="rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600"
            >
                Browse questions
            </Link>
        </div>
    );
}
