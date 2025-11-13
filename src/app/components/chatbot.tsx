"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Send, User, Bot, Copy, Wand2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { continueChessConversation } from "@/ai/flows/analyze-chess-tournament";
import {
  deepDive,
  battleForecast,
} from "@/ai/flows/feature-flows";
import type { TournamentDetails } from "./chess-analysis-form";
import { useToast } from "@/hooks/use-toast";
import { ChatFeatures } from "./chat-features";

interface Message {
  role: "user" | "bot";
  content: string;
}

export function Chatbot({
  details,
  initialMessages,
}: {
  details: TournamentDetails;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    startTransition(async () => {
      try {
        const history = [...messages, userMessage].map((msg) => ({
          role: (msg.role === "user" ? "user" : "model") as "user" | "model",
          parts: [{ text: msg.content }],
        }));

        const result = await continueChessConversation({
          name: details.name,
          link: details.link,
          question: currentInput,
          history,
        });

        setMessages((prev) => [...prev, { role: "bot", content: result.answer }]);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to get analysis. Please try again.",
        });
        setMessages((prev) => prev.slice(0, -1));
      }
    });
  };

  const executeFeature = (
    featureFn: (args: any) => Promise<{ report: string }>,
    args: any,
    loadingMessage: string
  ) => {
    const newMessages: Message[] = [...messages, { role: 'user', content: loadingMessage }];
    setMessages(newMessages);

    startTransition(async () => {
      try {
        const result = await featureFn(args);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'bot', content: result.report };
          return updated;
        });
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to generate report. Please try again.',
        });
        setMessages(messages);
      }
    });
  };

  const handleDeepDive = (playerName: string) => {
    executeFeature(deepDive, { name: details.name, link: details.link, playerName }, `Generating deep dive for ${playerName}...`);
  };

  const handleBattleForecast = () => {
    executeFeature(battleForecast, { name: details.name, link: details.link }, "Generating battle forecast...");
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied to clipboard" });
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "div[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        (scrollContainer as HTMLDivElement).scrollTop = (scrollContainer as HTMLDivElement).scrollHeight;
      }
    }
  }, [messages]);

  return (
    <Card className="w-full h-[115vh] flex flex-col bg-card/80 backdrop-blur-sm" data-testid="chatbot-card">
      <CardHeader>
        <CardTitle data-testid="chatbot-title">Chess Analysis Chat</CardTitle>
        <CardDescription data-testid="chatbot-description">Ask me anything about the tournament.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef} data-testid="chatbot-scrollarea">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "justify-end" : ""
                }`}
                data-testid={`chat-message-${message.role}-${index}`}
              >
                {message.role === "bot" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`relative rounded-lg px-3 py-2 max-w-sm group ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm leading-6 whitespace-pre-wrap">{message.content}</p>
                  {message.role === "bot" && (
                    <Button
                      onClick={() => handleCopy(message.content)}
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Copy message"
                      data-testid={`copy-bot-message-${index}`}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {messages.length === 0 && !isPending && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground" data-testid="empty-state">
                <Wand2 className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">Ready for your first question.</p>
                <p className="text-sm">Use the input below or try a special feature like a Deep Dive or Battle Forecast.</p>
              </div>
            )}
            {isPending && (
              <div className="flex items-start gap-3" data-testid="loading-state">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-3 py-2 bg-muted flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2" data-testid="chat-input-form">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isPending}
            data-testid="chat-input"
          />
          <Button type="submit" disabled={isPending} data-testid="chat-submit-button">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
          <ChatFeatures
            onDeepDive={handleDeepDive}
            onBattleForecast={handleBattleForecast}
            isPending={isPending}
          />
        </form>
      </CardFooter>
    </Card>
  );
}
