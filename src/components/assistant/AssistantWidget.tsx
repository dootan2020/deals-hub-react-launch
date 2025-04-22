
import React, { useState, useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import { AssistantChatMessage } from "./AssistantChatMessage";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AIAssistantResponse, AIMessagePayload } from "@/types/ai";

// Danh sách tên trợ lý
const aiNames = ["Lisa", "Rose", "Helen", "Mia", "Sophie"];

interface Message {
  sender: "user" | "bot";
  message: string;
}

export const AssistantWidget: React.FC = () => {
  // Lấy tên trợ lý từ sessionStorage hoặc chọn random
  const [assistantName] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("acczen_ai_name");
      if (saved) return saved;
      const name = aiNames[Math.floor(Math.random() * aiNames.length)];
      sessionStorage.setItem("acczen_ai_name", name);
      return name;
    }
    return aiNames[0];
  });

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", message: `Xin chào! Tôi là ${assistantName} – trợ lý AI của acczen.net. Tôi có thể giúp gì cho bạn?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastRequestId, setLastRequestId] = useState<string | null>(null);
  const { user } = useAuth();
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Scroll tự động xuống cuối
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Fallback message nếu lỗi nhiều lần
  const getFallbackMessage = (retryCount: number): string => {
    if (retryCount >= 3) {
      return `Xin lỗi, hiện tại tôi không thể kết nối với máy chủ. Bạn có thể thử lại sau vài phút hoặc nhấn vào đây để liên hệ với nhân viên hỗ trợ.`;
    }
    return "Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!";
  };

  // Chuyển đổi lỗi kỹ thuật sang lỗi thân thiện với người dùng
  const getUserFriendlyErrorMessage = (error: AIAssistantResponse): string => {
    // Nếu có error detail và không phải là lỗi unknown, hiển thị lỗi chi tiết
    if (error.error && !error.error.includes("Unknown error") && error.errorSource) {
      switch (error.errorSource) {
        case "configuration":
          return "Lỗi cấu hình hệ thống AI. Vui lòng thông báo cho nhân viên kỹ thuật.";
        case "validation":
          return "Câu hỏi không hợp lệ. Vui lòng nhập câu hỏi cụ thể.";
        case "edge_function":
          if (error.errorType === "timeout") {
            return `Máy chủ AI đang phản hồi chậm, vui lòng thử lại sau (Mã: TIMEOUT-${error.requestId?.substring(0, 4) || 'ERR'})`;
          } else if (error.errorType === "network") {
            return "Lỗi kết nối mạng đến máy chủ AI. Kiểm tra kết nối internet của bạn.";
          } else if (error.errorType === "quota") {
            return "Hệ thống AI đang quá tải. Vui lòng thử lại sau ít phút.";
          }
          break;
      }
    }

    // Lỗi mặc định
    return `Lỗi kết nối với ${assistantName} (${error.code || "Lỗi kết nối"})`;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: "user", message: userMsg }]);
    setInput("");
    setLoading(true);

    // Thêm loading indicator
    setMessages(prev => [...prev, { sender: "bot", message: "Đang trả lời..." }]);

    try {
      // Chuẩn bị payload truyền cả tên trợ lý
      const payload: AIMessagePayload & { assistantName: string } = {
        userId: user?.id || null,
        question: userMsg,
        history: messages.slice(-8),
        assistantName,
      };

      console.log("Sending request to AI assistant with userId:", user?.id || "anonymous", " - Name:", assistantName);

      // Gọi edge function, truyền assistantName
      const res = await fetch("/functions/v1/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        // Thêm timeout ngăn chặn treo quá lâu
        signal: AbortSignal.timeout(25000), // 25 giây timeout (tăng lên để tránh timeout quá sớm)
      });

      setMessages(prev => prev.filter(msg => msg.message !== "Đang trả lời..."));

      if (!res.ok) {
        const errorText = await res.text();
        console.error("AI assistant error response:", res.status, errorText);

        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        
        let errorResponse: AIAssistantResponse = { 
          answer: "Đã xảy ra lỗi kết nối", 
          error: `HTTP Error ${res.status}` 
        };
        
        try {
          // Cố gắng parse lỗi chi tiết từ server
          errorResponse = JSON.parse(errorText);
          if (errorResponse.requestId) {
            setLastRequestId(errorResponse.requestId);
          }
        } catch (e) {
          // Nếu không parse được thì giữ nguyên lỗi ban đầu
          console.error("Error parsing error response:", e);
        }
        
        // Hiển thị thông báo lỗi thân thiện với người dùng
        const userFriendlyError = getUserFriendlyErrorMessage(errorResponse);
        
        setMessages(prev => [...prev, {
          sender: "bot",
          message: userFriendlyError
        }]);
        
        // Hiển thị toast thông báo lỗi
        toast.error(`Lỗi trợ lý AI acczen.net`, {
          description: userFriendlyError,
          duration: 6000,
        });
        
        throw new Error(`Server responded with ${res.status}: ${errorResponse.error || errorText}`);
      }

      const data: AIAssistantResponse = await res.json();
      
      // Lưu request ID nếu có
      if (data.requestId) {
        setLastRequestId(data.requestId);
      }

      if (data.error) {
        console.error("AI assistant returned error:", data.error);
        const errorMessage = getUserFriendlyErrorMessage(data) || data.answer || "Đã xảy ra lỗi. Vui lòng thử lại sau!";
        
        setMessages(prev => [...prev, { sender: "bot", message: errorMessage }]);
        
        toast.error("Lỗi trợ lý AI acczen.net", {
          description: errorMessage,
          duration: 6000,
        });
        
        setRetryCount(prev => prev + 1);
      } else {
        setMessages(prev =>
          [...prev, {
            sender: "bot",
            message: data.answer || `Xin lỗi, tôi chưa có câu trả lời phù hợp. Vui lòng thử lại với câu hỏi khác.`
          }]
        );
        if (retryCount > 0) setRetryCount(0);
      }
    } catch (error) {
      console.error("Error calling AI assistant:", error);
      setMessages(prev => prev.filter(msg => msg.message !== "Đang trả lời..."));
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);

      let errorMessage = "Đã xảy ra lỗi khi kết nối với trợ lý AI acczen.net.";
      
      // Xác định lỗi mạng
      if (error instanceof Error) {
        if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch") || error.message.includes("network")) {
          errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn và thử lại.";
        } else if (error.message.includes("timeout") || error.message.includes("Timeout") || error.message.includes("TimeoutError") || error.message.includes("AbortError")) {
          errorMessage = `${assistantName} đã không phản hồi sau 25 giây. Máy chủ có thể đang quá tải, vui lòng thử lại sau.`;
        } else if (error.message.includes("quota") || error.message.includes("rate limit")) {
          errorMessage = "Hệ thống AI đã đạt giới hạn truy cập. Vui lòng thử lại sau ít phút.";
        }
        
        // Log RequestID nếu có
        if (lastRequestId) {
          console.error(`Lỗi chi tiết (RequestID: ${lastRequestId}):`, error.message);
        } else {
          console.error("Chi tiết lỗi:", error.message);
        }
      }
      
      if (newRetryCount >= 3) {
        errorMessage = getFallbackMessage(newRetryCount);
        toast.error("Lỗi kết nối acczen.net", {
          description: errorMessage,
          duration: 6000,
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

  // Quick Replies (tuỳ chỉnh brand và ngữ cảnh acczen.net)
  const quickReplies = [
    "Cách mua sản phẩm trên acczen.net?",
    "Hướng dẫn nạp tiền",
    "Kiểm tra trạng thái đơn hàng",
    "Sản phẩm trên acczen.net có bảo hành không?"
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        aria-label={`Trợ lý AI ${assistantName}`}
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
                {assistantName} (acczen AI)
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
                aria-label={`Nhập câu hỏi cho trợ lý AI ${assistantName}`}
                className="flex-1 px-3 py-2 rounded-md border focus:ring-2 focus:ring-primary outline-none"
                placeholder={`Nhập câu hỏi cho trợ lý ${assistantName} hoặc yêu cầu hỗ trợ…`}
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
