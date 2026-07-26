"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconHome, IconMessage, IconWorldQuestion } from "@tabler/icons-react";
import { useAuthStore } from "@/store/Auth";
import slugify from "@/utils/slugify";

export default function Header() {
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const hydrated = useAuthStore((state) => state.hydrated);
    const verifySession = useAuthStore((state) => state.verifySession);
    const isProfileRoute = pathname.startsWith("/users/");
    const showSignupCta = !(hydrated && user);

    React.useEffect(() => {
        if (!hydrated) return;

        void verifySession();
    }, [hydrated, verifySession]);

    if (pathname === "/login" || pathname === "/register") {
        return null;
    }

    const navItems = [
        {
            name: "Home",
            link: "/",
            icon: <IconHome className="h-4 w-4 text-white/90" />,
        },
        {
            name: "Questions",
            link: "/questions",
            icon: <IconWorldQuestion className="h-4 w-4 text-white/90" />,
        },
    ];

    if (hydrated && user)
        navItems.push({
            name: "Profile",
            link: `/users/${user.$id}/${slugify(user.name)}`,
            icon: <IconMessage className="h-4 w-4 text-white/90" />,
        });

    return (
        <div className="relative w-full">
            <FloatingNav
                navItems={navItems}
                alwaysVisible={isProfileRoute}
                showCta={showSignupCta}
            />
        </div>
    );
}