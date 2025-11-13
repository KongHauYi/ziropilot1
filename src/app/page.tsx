
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, Target, Users } from "lucide-react";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div
        className="bg-card/50 p-6 rounded-lg border border-border/50 shadow-md backdrop-blur-sm transition-all hover:border-accent/50 hover:bg-accent/10"
    >
        <div className="flex items-center gap-4 mb-3">
            <div className="bg-accent/20 p-2 rounded-md border border-accent/30">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
        </div>
        <p className="text-muted-foreground">{description}</p>
    </div>
);


export default function LandingPage() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 overflow-x-hidden">
        <div className="w-full max-w-5xl space-y-16 text-center">
            <header className="flex flex-col items-center text-center space-y-8 pt-12">
                 <div className="flex items-center gap-3">
                    <svg
                        width="56"
                        height="56"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-accent"
                    >
                        <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16v-5l-4 4-1.41-1.41L9.17 12 5.59 8.41 7 7l4 4V6h2v5l4-4 1.41 1.41L14.83 12l3.58 3.59L17 17l-4-4v5h-2z"
                        fill="currentColor"
                        />
                    </svg>
                    <h1 className="text-5xl sm:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                        Cadena 2.0
                    </h1>
                </div>
                <p className="text-muted-foreground max-w-2xl text-lg sm:text-xl">
                  The ultimate AI-powered chess tournament analysis tool. Unleash strategic insights, analyze performance, and predict your next opponent with unprecedented accuracy.
                </p>
            </header>

          <section className="space-y-12 bg-card/20 py-12 rounded-xl">
            <div className="text-center px-4">
                <h2 className="text-3xl sm:text-4xl font-bold">Next-Generation Features</h2>
                <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Cadena 2.0 introduces powerful new tools to elevate your game.</p>
            </div>
            <div
                className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left px-8"
            >
                <FeatureCard
                    icon={<Bot className="w-6 h-6 text-accent"/>}
                    title="Conversational AI"
                    description="Go beyond stats. Ask natural language questions about your performance, opponents, and tournament trajectory."
                />
                 <FeatureCard
                    icon={<Target className="w-6 h-6 text-accent"/>}
                    title="Player Deep Dives"
                    description="Generate a comprehensive report on any player, analyzing their strengths, weaknesses, and key tournament moments."
                />
                 <FeatureCard
                    icon={<Users className="w-6 h-6 text-accent"/>}
                    title="Battle Forecast"
                    description="Let our AI predict your top 3 most likely opponents for the next round based on Swiss-system pairing logic."
                />
                 <FeatureCard
                    icon={<Users className="w-6 h-6 text-accent"/>}
                    title="Loading Tournament Data"
                    description="Just paste a chess-results.com link and Cadena 2.0 will automatically fetch and process all relevant tournament data."
                />
            </div>
          </section>
        </div>
      </main>
      <section
        className="w-full bg-card/30 border-y border-dashed border-border/30 p-8 sm:p-12 mt-16 text-center"
      >
        <h2 className="text-3xl font-bold">
          Awaiting Cadena <Link href="/app">2.0</Link>
        </h2>
        <p className="text-muted-foreground mt-2 mb-6 max-w-xl mx-auto">
          Experience the future of chess analysis today, or visit the classic version.
        </p>
        <a href="https://cadenaai.netlify.app" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="lg">Visit Cadena 1.0</Button>
        </a>
      </section>
    </>
  );
}
