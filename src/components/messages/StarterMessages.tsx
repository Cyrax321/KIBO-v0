import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StarterMessagesProps {
  userName: string;
  onSelect: (message: string) => void;
}

const STARTER_TEMPLATES = [
  "Hey {name}! Great to connect with you. How's your job search going?",
  "Hi {name}! I noticed we're both in tech. Would love to learn more about your background!",
  "Hello {name}! Excited to be connected. What are you currently working on?",
  "Hey {name}! Thanks for connecting. What companies are you targeting?",
  "Hi {name}! Always great to meet fellow engineers. Any interview tips you'd like to share?",
];

export const StarterMessages: React.FC<StarterMessagesProps> = ({
  userName,
  onSelect,
}) => {
  const messages = STARTER_TEMPLATES.map((template) =>
    template.replace("{name}", userName.split(" ")[0] || "there")
  );

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        <span>Start the conversation with a quick message</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {messages.map((message, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-xs h-auto py-2 px-3 whitespace-normal text-left"
            onClick={() => onSelect(message)}
          >
            {message}
          </Button>
        ))}
      </div>
    </div>
  );
};
