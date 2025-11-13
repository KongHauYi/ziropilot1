import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChessAnalysisForm } from "@/app/components/chess-analysis-form";
import { ArrowLeft } from "lucide-react";

export default function AppPage() {
  return (
    <>
      <main className="relative z-10 flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
        <div className="w-full max-w-2xl space-y-8">
          <header className="flex w-full justify-start">
            <Link href="/">
                <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Button>
            </Link>
          </header>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-3">
              <svg
                width="44"
                height="44"
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
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Cadena 2.0
              </h1>
            </div>
            <p className="text-muted-foreground max-w-md">
              Get AI-powered insights from your chess tournaments. Just provide the link and start chatting.
            </p>
          </div>

          <ChessAnalysisForm />
        </div>
      </main>
    </>
  );
}
