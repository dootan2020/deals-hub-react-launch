
import React from "react";
import { Bot, MessageCircle } from "lucide-react";

interface AssistantChatMessageProps {
  message: string;
  sender: "user" | "bot";
}

export const AssistantChatMessage: React.FC<AssistantChatMessageProps> = ({ message, sender }) => {
  return (
    <div className={`flex mb-3 ${sender === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`flex items-end max-w-[80%]`}>
        {sender === "bot" && (
          <span className="rounded-full bg-primary p-1 text-white mr-2">
            <Bot size={22} />
          </span>
        )}
        <div 
          className={`rounded-lg px-4 py-2 shadow-sm text-base leading-relaxed ${
            sender === "user"
              ? "bg-accent text-accent-foreground rounded-br-none"
              : "bg-background text-gray-900 rounded-bl-none border"
          }`}
        >
          {message}
        </div>
        {sender === "user" && (
          <span className="rounded-full bg-accent p-1 text-primary ml-2">
            <MessageCircle size={20} />
          </span>
        )}
      </div>
    </div>
  );
};
