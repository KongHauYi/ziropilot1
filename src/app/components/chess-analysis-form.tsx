
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2 } from "lucide-react";
import { Chatbot } from "./chatbot";
import { continueChessConversation } from "@/ai/flows/analyze-chess-tournament";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  link: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .refine((url) => url.includes("chess-results.com"), {
      message: "URL must be from chess-results.com",
    }),
  question: z
    .string()
    .min(10, { message: "Starting message must be at least 10 characters." })
    .optional(),
});

export type TournamentDetails = z.infer<typeof formSchema>;

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export function ChessAnalysisForm() {
  const [tournamentDetails, setTournamentDetails] = useState<Omit<TournamentDetails, 'question'> | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[] | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const form = useForm<TournamentDetails>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      link: "",
      question: "",
    },
  });

  const startAnalysisWithQuestion = async (values: Omit<TournamentDetails, 'question'>, question: string) => {
    setIsPending(true);
    try {
      const result = await continueChessConversation({
        name: values.name,
        link: values.link,
        question: question,
        history: [],
      });
      
      setInitialMessages([
        { role: 'user', content: question },
        { role: 'bot', content: result.answer }
      ]);
      setTournamentDetails(values);
    } catch (error) {
       console.error(error);
       toast({
         variant: "destructive",
         title: "Error",
         description: "Failed to get analysis. Please try again.",
       });
    } finally {
      setIsPending(false);
    }
  };

  async function onSubmit(values: TournamentDetails) {
    if (values.question) {
      await startAnalysisWithQuestion(values, values.question);
    }
  }

  const handleAnalyzeWithoutMessage = async () => {
    const isNameValid = await form.trigger("name");
    const isLinkValid = await form.trigger("link");

    if (isNameValid && isLinkValid) {
        setIsPending(true);
        const { question, ...details } = form.getValues();
        setTournamentDetails(details);
        setInitialMessages([]);
        setIsPending(false);
    }
  };


  if (tournamentDetails && initialMessages) {
    return <Chatbot details={tournamentDetails} initialMessages={initialMessages} />;
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Tournament Details</CardTitle>
        <CardDescription>
          Fill in the details below to start a chat with an AI-powered chess analyst.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Magnus Carlsen"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chess-Results.com Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://chess-results.com/tnr..."
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starting Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., How was my performance in the last 3 rounds?"
                      className="resize-none"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" disabled={isPending || !form.watch('question')} className="w-full sm:w-auto">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Chat...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Start Chat Analysis
                </>
              )}
            </Button>
            <Button type="button" variant="secondary" onClick={handleAnalyzeWithoutMessage} disabled={isPending} className="w-full sm:w-auto">
              {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Start Analysis"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
