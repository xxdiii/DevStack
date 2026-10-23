import env from "@/app/env";
import { Account, AppwriteException, Client } from "node-appwrite";
import { NextRequest, NextResponse } from "next/server";
import type { UserPrefs } from "@/store/Auth";

// Resolves the caller from the "Authorization: Bearer <jwt>" header.
// Never trust a user id sent in the request body.
export async function getAuthUser(request: NextRequest) {
    const header = request.headers.get("authorization");
    const jwt = header?.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!jwt) return null;

    try {
        const client = new Client()
            .setEndpoint(env.appwrite.endpoint)
            .setProject(env.appwrite.projectId)
            .setJWT(jwt);
        return await new Account(client).get<UserPrefs>();
    } catch {
        return null;
    }
}

export function unauthorized() {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
}

export function forbidden() {
    return NextResponse.json({ error: "You can only change your own content" }, { status: 403 });
}

export function errorResponse(error: unknown, fallback: string) {
    const code = error instanceof AppwriteException ? error.code : 500;
    const status = code >= 400 && code < 600 ? code : 500;
    const message = error instanceof Error && error.message ? error.message : fallback;
    return NextResponse.json({ error: message }, { status });
}
