import { useAuthStore } from "@/store/Auth";

// fetch() for our /api routes, with the caller's Appwrite JWT attached
export default async function apiFetch(input: string, init: RequestInit = {}) {
    const jwt = await useAuthStore.getState().getJWT();
    const headers = new Headers(init.headers);
    if (jwt) headers.set("Authorization", `Bearer ${jwt}`);
    if (typeof init.body === "string") headers.set("Content-Type", "application/json");

    return fetch(input, { ...init, headers });
}

export async function readError(response: Response, fallback: string) {
    try {
        const data = await response.json();
        return data?.error || fallback;
    } catch {
        return fallback;
    }
}
