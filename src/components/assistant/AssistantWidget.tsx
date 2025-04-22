
import React, { useState, useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import { AssistantChatMessage } from "./AssistantChatMessage";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Message {
  sender: "user" | "bot";
  message: string;
}

export const AssistantWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", message: "Xin chào! Tôi là trợ lý AI của bạn. Bạn cần trợ giúp gì?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Scroll to latest message
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: "user", message: userMsg }]);
    setInput("");
    setLoading(true);

    // Compose payload: include userId, recent messages (max 8), and what page user is on if needed
    try {
      console.log("Sending request to AI assistant with userId:", user?.id || "anonymous");
      const res = await fetch("/functions/v1/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || null,
          question: userMsg,
          history: messages.slice(-8), // include only last 8 messages
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("AI assistant error response:", res.status, errorText);
        throw new Error(`Server responded with ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      
      // Kiểm tra nếu có lỗi rõ ràng trong response
      if (data.error) {
        console.error("AI assistant returned error:", data.error);
        // Nếu API đã trả về thông báo lỗi thân thiện, sử dụng nó
        const errorMessage = data.answer || "Đã xảy ra lỗi. Vui lòng thử lại sau!";
        setMessages(prev => [...prev, { sender: "bot", message: errorMessage }]);
        // Hiển thị toast thông báo lỗi cho user biết
        toast.error("Lỗi trợ lý AI", {
          description: "Đã xảy ra lỗi khi kết nối với trợ lý AI"
        });
      } else {
        // Xử lý phản hồi thành công
        setMessages(prev =>
          [...prev, { sender: "bot", message: data.answer || "Xin lỗi, tôi chưa có câu trả lời phù hợp." }]
        );
        // Reset retry counter khi thành công
        if (retryCount > 0) setRetryCount(0);
      }
    } catch (error) {
      console.error("Error calling AI assistant:", error);
      
      // Kiểm tra và tăng số lần retry
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      
      // Hiển thị thông báo lỗi khác nhau tùy theo số lần retry
      let errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại sau!";
      
      if (newRetryCount >= 3) {
        errorMessage = "Trợ lý AI đang gặp sự cố kết nối. Vui lòng thử lại sau ít phút.";
        toast.error("Lỗi kết nối", {
          description: "Hệ thống trợ lý AI đang gặp sự cố. Vui lòng thử lại sau."
        });
      }
      
      setMessages(prev =>
        [...prev, { sender: "bot", message: errorMessage }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick Replies (optional)
  const quickReplies = [
    "Cách mua sản phẩm?",
    "Hướng dẫn nạp tiền",
    "Kiểm tra trạng thái đơn hàng",
    "FAQ về sản phẩm"
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        aria-label="Trợ lý AI"
        className="fixed z-50 bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary-dark transition-all focus:outline-none"
        onClick={() => setOpen(true)}
        style={{ boxShadow: "0 8px 24px 0 #27ae60aa" }}
      >
        <Bot size={28} />
      </button>

      {/* Chat Box (Drawer style) */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none">
          <div
            className="bg-black/30 absolute inset-0 pointer-events-auto"
            onClick={() => setOpen(false)}
            aria-label="Đóng chat AI"
          />
          <div className="relative w-full max-w-sm mx-4 mb-7 bg-white rounded-xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col"
            style={{ minHeight: 430, maxHeight: "80vh" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-white">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <Bot size={22} />
                Trợ lý AI
              </div>
              <button onClick={() => setOpen(false)}
                className="rounded-full px-2 py-1 hover:bg-primary-dark/30 focus:outline-none">
                &#10005;
              </button>
            </div>

            {/* Body */}
            <div ref={chatBodyRef}
              className="flex-1 overflow-y-auto px-4 py-2 bg-gray-50 scrollbar-thin"
              style={{ minHeight: 220, maxHeight: 350 }}>
              {messages.map((msg, idx) => (
                <AssistantChatMessage key={idx + msg.sender + (msg.message.substring(0, 10))} {...msg} />
              ))}
              {loading && (
                <AssistantChatMessage sender="bot" message="Đang trả lời..." />
              )}
            </div>
            {/* Quick Replies */}
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {quickReplies.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  className="bg-accent hover:bg-accent/70 rounded-md px-3 py-1 text-sm text-accent-foreground cursor-pointer"
                  onClick={() => setInput(q)}
                  tabIndex={0}
                >
                  {q}
                </button>
              ))}
            </div>
            {/* Footer - input box */}
            <form
              className="flex items-center p-3 border-t bg-white"
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            >
              <input
                aria-label="Nhập câu hỏi cho trợ lý AI"
                className="flex-1 px-3 py-2 rounded-md border focus:ring-2 focus:ring-primary outline-none"
                placeholder="Nhập câu hỏi hoặc yêu cầu hỗ trợ..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                autoFocus
                maxLength={400}
              />
              <Button type="submit" variant="default" className="ml-2 px-3 py-2" disabled={loading || !input.trim()}>
                Gửi
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
