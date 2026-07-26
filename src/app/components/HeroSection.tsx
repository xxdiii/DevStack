import React from "react";
import HeroSectionHeader from "./HeroSectionHeader";

export default async function HeroSection() {
    return (
        <div className="relative flex min-h-screen items-center justify-center">
            <HeroSectionHeader />
        </div>
    );
}