import { Permission, Role } from "node-appwrite";

// Anyone can read. Every write goes through the /api routes, which use the
// server API key after checking who the caller is and that they own the document.
export const publicReadOnly = [Permission.read(Role.any())];

export function samePermissions(a: string[], b: string[]) {
    return a.length === b.length && [...a].sort().join() === [...b].sort().join();
}
