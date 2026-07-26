"use client";

import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { IconLogout } from "@tabler/icons-react";

const LogoutButton = () => {
    const router = useRouter();
    
    // Extract your perfectly built logout method from the store
    const { logout } = useAuthStore(); 
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoading(true);
            
            // 1. Call your store's logout method (Handles Appwrite + Zustand state)
            await logout();
            
            // 2. Redirect to login page
            router.push("/login");
            
            // 3. Force Next.js to clear the client cache and re-fetch server components
            router.refresh(); 
        } catch (error: any) {
            console.error("Logout failed:", error?.message || error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
            <IconLogout size={18} />
            {isLoading ? "Logging out..." : "Logout"}
        </button>
    );
};

export default LogoutButton;