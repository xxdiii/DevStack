import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { AppwriteException, Models, ID } from "appwrite";
import { account } from "@/models/client/config";

export interface UserPrefs {
    reputation: number
}

interface IAuthStore {
    session: Models.Session | null;
    jwt: string | null;
    jwtIssuedAt: number | null;
    user: Models.User<UserPrefs> | null;
    hydrated: boolean

    setHydrated(): void,
    verifySession(): Promise<void>;
    getJWT(): Promise<string | null>;
    login(
        email: string,
        password: string
    ): Promise<{
        success: boolean,
        error?: AppwriteException | null
    }>;
    createAccount(
        name: string,
        email: string,
        password: string
    ): Promise<{
        success: boolean,
        error?: AppwriteException | null
    }>;
    logout(): Promise<void>;

}

export const useAuthStore = create<IAuthStore>()(
    persist(
        immer((set, get) =>({
            session: null,
            jwt: null,
            jwtIssuedAt: null,
            user: null,
            hydrated: false,

            setHydrated(){
                set({hydrated: true})
            },

            async verifySession(){
                // Nothing to verify when logged out
                if (!get().session) return

                try {
                    const [session, user, { jwt }] = await Promise.all([
                        account.getSession("current"),
                        account.get<UserPrefs>(),
                        account.createJWT(),
                    ])

                    if (user.prefs?.reputation === undefined) {
                        user.prefs = await account.updatePrefs<UserPrefs>({
                            ...user.prefs,
                            reputation: 0,
                        }).then(updated => updated.prefs)
                    }

                    set({ session, user, jwt, jwtIssuedAt: Date.now() })
                } catch (error) {
                    console.log(error);
                    // Session expired or was revoked: drop the stale persisted user
                    if (error instanceof AppwriteException && error.code === 401) {
                        set({ session: null, jwt: null, jwtIssuedAt: null, user: null })
                    }
                }
            },

            async getJWT(){
                const { session, jwt, jwtIssuedAt } = get()
                if (!session) return null
                // Appwrite JWTs live 15 minutes; refresh a little early
                if (jwt && jwtIssuedAt && Date.now() - jwtIssuedAt < 10 * 60 * 1000) return jwt

                try {
                    const { jwt: freshJwt } = await account.createJWT()
                    set({ jwt: freshJwt, jwtIssuedAt: Date.now() })
                    return freshJwt
                } catch (error) {
                    console.log(error);
                    if (error instanceof AppwriteException && error.code === 401) {
                        set({ session: null, jwt: null, jwtIssuedAt: null, user: null })
                    }
                    return null
                }
            },

            async login(email: string, password: string){
                try {
                    const session = await account.createEmailSession(email, password)
                    const [user, {jwt}] = await Promise.all([
                        account.get<UserPrefs>(),
                        account.createJWT()
                    ])
                    if (user.prefs?.reputation === undefined) {
                        user.prefs = await account.updatePrefs<UserPrefs>({
                            ...user.prefs,
                            reputation: 0,
                        }).then(updated => updated.prefs)
                    }

                    set({session,user,jwt,jwtIssuedAt: Date.now()})
                    return {success: true}

                } catch (error) {
                    console.log(error);
                    return {
                        success: false,
                        error: error instanceof AppwriteException ? error: null,
                    }
                    
                }
            },
            async createAccount(name: string, email:string, password: string){
                try {
                    await account.create(ID.unique(), email, password, name)
                    return { success: true}
                } catch (error) {
                    console.log(error);
                    return {
                        success: false,
                        error: error instanceof AppwriteException ? error: null,
                    }
                    
                }
            },

            async logout(){
                try {
                    await account.deleteSessions()
                } catch (error) {
                    console.log(error);
                }
                // Clear local state even if the server session was already gone
                set({session: null, jwt: null, jwtIssuedAt: null, user: null})
            }

        })),{
            name: "auth",
            onRehydrateStorage(){
                return (state,error)=>{
                    if (!error) state?.setHydrated()
                }
            }
        }
    )
)