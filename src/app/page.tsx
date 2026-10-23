import HeroSection from "./components/HeroSection";
import LatestQuestions from "./components/LatestQuestion";
import TopContributers from "./components/Topcontributors";

// Questions and contributors change constantly; never prerender at build time
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <HeroSection />
      </section>

      {/* Content Section */}
      <section className="relative">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Latest Questions */}
            <div className="lg:col-span-2">
              <h2 className="mb-6 text-3xl font-bold text-white">
                Latest Questions
              </h2>
              <LatestQuestions />
            </div>

            {/* Top Contributors */}
            <div className="lg:col-span-1">
              <h2 className="mb-6 text-3xl font-bold text-white">
                Top Contributors
              </h2>
              <TopContributers />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}