"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2, Users, Target } from "lucide-react";

interface ChatFeaturesProps {
  onDeepDive: (playerName: string) => void;
  onBattleForecast: () => void;
  isPending: boolean;
}

export function ChatFeatures({ onDeepDive, onBattleForecast, isPending }: ChatFeaturesProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");

  const handleDeepDiveClick = () => {
    setPopoverOpen(false);
    setModalOpen(true);
  };

  const handleBattleForecastClick = () => {
    setPopoverOpen(false);
    onBattleForecast();
  };

  const handleGenerateReport = () => {
    if (playerName.trim()) {
      onDeepDive(playerName.trim());
      setModalOpen(false);
      setPlayerName("");
    }
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" disabled={isPending} data-testid="features-button">
            <Wand2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" data-testid="features-popover">
          <div className="grid gap-2">
            <Button
              variant="ghost"
              className="justify-start"
              onClick={handleDeepDiveClick}
              data-testid="deep-dive-trigger"
            >
              <Target className="mr-2 h-4 w-4" />
              Deep Dive
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={handleBattleForecastClick}
              data-testid="battle-forecast-trigger"
            >
              <Users className="mr-2 h-4 w-4" />
              Battle Forecast
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[425px]" data-testid="deep-dive-modal">
          <DialogHeader>
            <DialogTitle>Player Deep Dive</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="player-name" className="text-right">
                Player Name
              </Label>
              <Input
                id="player-name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Magnus Carlsen"
                data-testid="deep-dive-player-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleGenerateReport} data-testid="deep-dive-generate-button">Generate Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
