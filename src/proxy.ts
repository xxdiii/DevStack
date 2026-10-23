import { NextResponse } from 'next/server'
import getOrCreateDB from './models/server/dbSetup'
import getOrCreateStorage from './models/server/storage.collection'

// Run the Appwrite setup once per server instance instead of on every request.
// On failure it's cleared so the next request retries.
let setup: Promise<void> | null = null

function ensureSetup() {
    if (!setup) {
        setup = Promise.all([getOrCreateDB(), getOrCreateStorage()])
            .then(() => {})
            .catch(error => {
                console.error("Appwrite setup failed", error)
                setup = null
            })
    }
    return setup
}

export async function proxy() {
    await ensureSetup()
    return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
