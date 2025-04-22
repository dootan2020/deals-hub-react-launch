
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// SECURE: Get OpenAI key and Organization ID
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_ORG_ID = Deno.env.get('OPENAI_ORGANIZATION_ID') || "";
const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, OpenAI-Organization",
};

async function getUserOrderInfo(userId: string) {
  if (!userId) return "";
  try {
    const { data, error } = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/rest/v1/orders?user_id=eq.${userId}&select=id,created_at,status,product:products(title),order_items(*,product:products(title))&order=created_at.desc&limit=5`,
      {
        headers: {
          apikey: Deno.env.get("SUPABASE_ANON_KEY") || "",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY") || ""}`,
        },
      }
    ).then(r => r.json())
     .then(d => ({ data: d, error: null }))
     .catch(e => ({ data: null, error: e }));

    if (!data) {
      console.log("Error fetching user orders:", error);
      return "";
    }

    const ordersStr = data
      .map((order: any) =>
        `• Đơn #${order.id} (${order.status}, ${order.created_at}): Sản phẩm: ${
          order.order_items?.map((item: any) => item.product?.title).join(", ") || "n/a"
        }`
      )
      .join("\n");
    return ordersStr ? `Lịch sử đơn gần đây:\n${ordersStr}` : "";
  } catch (err) {
    console.error("Error in getUserOrderInfo:", err);
    return "";
  }
}

async function getFaqContext() {
  try {
    return `
1. Cách mua sản phẩm? Sau khi chọn sản phẩm tại acczen.net, bấm Mua, thanh toán và nhận thông tin qua email.
2. Hướng dẫn nạp tiền: Chọn Nạp tiền trong menu acczen.net, làm theo hướng dẫn, chọn phương thức mong muốn.
3. Sản phẩm có bảo hành? Đa số đều bảo hành ít nhất 24h. Nếu có vấn đề, vui lòng liên hệ hỗ trợ acczen.net.
4. Thanh toán an toàn không? acczen.net sử dụng bảo mật SSL, không lưu thẻ ngân hàng.
5. Cách liên hệ hỗ trợ? Qua email hotro@acczen.net hoặc chat trực tuyến.
    `;
  } catch (err) {
    console.error("Error in getFaqContext:", err);
    return "";
  }
}

// Compose prompt for OpenAI, cho phép truyền assistantName động, và tự xưng tên trong mỗi câu trả lời
function buildPrompt({ question, userId, history, orderInfo, faq, assistantName }: {
  question: string,
  userId: string | null,
  history: any[],
  orderInfo: string,
  faq: string,
  assistantName: string
}) {
  try {
    const conversation =
      history
        ?.map((msg: any) => (msg.sender === "user" ? `Khách: ${msg.message}` : `Bot (${assistantName}): ${msg.message}`))
        .join("\n") || "";
    const faqSection = faq || "";
    const orderSection = orderInfo ? `\n${orderInfo}\n` : "";

    // System prompt cá nhân hoá cho acczen.net, yêu cầu AI luôn tự xưng tên cụ thể
    return `
Bạn là trợ lý AI tên là ${assistantName} của acczen.net (chuyên về sản phẩm số MMO).

SYSTEM INSTRUCTIONS:
- Bạn là nhân viên hỗ trợ khách hàng acczen.net.
- Tên bạn là ${assistantName}, luôn tự xưng tên của mình đầu câu trả lời (ví dụ: "Helen ở đây nè!..." hoặc "Tôi là Rose...").
- Trả lời ngắn gọn, chính xác, lịch sự bằng tiếng Việt.
- Nếu không chắc chắn về thông tin, hãy chủ động xin lỗi người dùng và gợi ý liên hệ support acczen.net (email: hotro@acczen.net).
- Luôn thân thiện, hữu ích, dùng đại từ nhân xưng cá nhân với tên của bạn.
- Luôn nhấn mạnh acczen.net an toàn, uy tín khi gặp câu hỏi liên quan.
- Không tiết lộ thông tin nhạy cảm.

Các câu hỏi thường gặp (FAQ):
${faqSection}
${orderSection}

Bắt đầu hội thoại (luôn tự xưng tên mỗi lượt trả lời):

${conversation}
Khách: ${question}
Bot (${assistantName}):
`.trim();
  } catch (err) {
    console.error("Error in buildPrompt:", err);
    return `
Bạn là trợ lý AI tên là ${assistantName} của acczen.net. Trả lời câu hỏi sau một cách ngắn gọn, lịch sự, tự xưng tên mình nhé:

Khách: ${question}
Bot (${assistantName}):
`.trim();
  }
}

serve(async (req) => {
  // Generate request ID for tracking
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, userId, history, assistantName = "Trợ lý" } = await req.json();

    console.log(`[${requestId}] Request received. userId: ${userId || 'anonymous'}, name: ${assistantName}, question length: ${question?.length || 0}`);
    
    // Validate API keys
    const hasOpenAIKey = !!OPENAI_API_KEY;
    const hasClaudeKey = !!CLAUDE_API_KEY;
    const hasOrgId = !!OPENAI_ORG_ID;
    const apiSource = hasClaudeKey ? "claude" : hasOpenAIKey ? "openai" : null;

    console.log(`[${requestId}] API Configuration - OpenAI: ${hasOpenAIKey}, Claude: ${hasClaudeKey}, OrgID: ${hasOrgId}`);

    if (!apiSource) {
      console.error(`[${requestId}] No AI API keys configured`);
      return new Response(JSON.stringify({
        error: "AI service has not been configured",
        answer: `Xin lỗi, hệ thống trợ lý AI acczen.net chưa được cấu hình. Vui lòng liên hệ với bộ phận kỹ thuật acczen.net.`,
        errorSource: "configuration",
        requestId,
        duration: Date.now() - startTime
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      console.error(`[${requestId}] Invalid question format`);
      return new Response(JSON.stringify({
        error: "Question must be a non-empty string",
        answer: `Xin lỗi, tôi không hiểu được câu hỏi của bạn. ${assistantName} khuyên bạn thử lại với câu hỏi cụ thể hơn hoặc liên hệ hotro@acczen.net!`,
        errorSource: "validation",
        requestId,
        duration: Date.now() - startTime
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Fetch contextual data
    const [faq, orderInfo] = await Promise.all([
      getFaqContext(),
      userId ? getUserOrderInfo(userId) : ""
    ]);

    const prompt = buildPrompt({
      question,
      userId,
      history,
      orderInfo,
      faq,
      assistantName: assistantName || "acczen AI"
    });

    console.log(`[${requestId}] Prompt created, length: ${prompt.length} characters, assistant: ${assistantName}`);

    try {
      if (apiSource === "openai") {
        // OpenAI API call
        const headers: Record<string, string> = {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        };

        if (OPENAI_ORG_ID && OPENAI_ORG_ID.trim() !== "") {
          console.log(`[${requestId}] Using OpenAI Organization: ${OPENAI_ORG_ID.substring(0, 5)}...`);
          headers["OpenAI-Organization"] = OPENAI_ORG_ID;
        }

        console.log(`[${requestId}] Calling OpenAI API with gpt-4o-mini model...`);

        // Set timeout to prevent long-running requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 18000); // 18 seconds timeout
        
        try {
          const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers,
            signal: controller.signal,
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: `Bạn là trợ lý AI tên là ${assistantName}, luôn tự xưng tên mình và là hỗ trợ viên cho acczen.net.` },
                { role: "user", content: prompt }
              ],
              max_tokens: 500,
              temperature: 0.6,
            })
          });

          clearTimeout(timeoutId);

          const requestTime = Date.now() - startTime;
          console.log(`[${requestId}] OpenAI API response received in ${requestTime}ms, status: ${aiRes.status}`);

          if (!aiRes.ok) {
            const errorText = await aiRes.text();
            console.error(`[${requestId}] OpenAI API error: status=${aiRes.status}, response=${errorText}`);

            let errorMessage = "Lỗi khi gọi dịch vụ AI.";
            let errorType = "api_error";
            
            try {
              const errorData = JSON.parse(errorText);
              if (errorData.error) {
                errorType = errorData.error.type || "api_error";
                
                switch (errorType) {
                  case "invalid_request_error":
                    errorMessage = "Yêu cầu không hợp lệ đến OpenAI.";
                    break;
                  case "authentication_error":
                    errorMessage = "Lỗi xác thực với OpenAI API.";
                    break;
                  case "permission_error":
                    errorMessage = "Không có quyền truy cập model này.";
                    break;
                  case "rate_limit_error":
                    errorMessage = "OpenAI API đang quá tải. Vui lòng thử lại sau.";
                    break;
                  case "quota_error":
                    errorMessage = "Hết quota OpenAI API.";
                    break;
                  case "server_error":
                    errorMessage = "OpenAI đang gặp sự cố.";
                    break;
                  default:
                    errorMessage = `Lỗi OpenAI: ${errorData.error.message || errorType}`;
                }
              }
            } catch (e) {
              console.error(`[${requestId}] Error parsing OpenAI error:`, e);
              errorType = "parse_error";
            }
            
            throw new Error(`OpenAI API error (${aiRes.status}): ${errorMessage}`);
          }

          const aiData = await aiRes.json();
          console.log(`[${requestId}] OpenAI response received, processing answer`);

          if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
            console.error(`[${requestId}] Invalid OpenAI response structure:`, JSON.stringify(aiData).substring(0, 200));
            throw new Error("Cấu trúc phản hồi không hợp lệ từ OpenAI API");
          }

          // Process the response
          let rawAnswer = aiData.choices[0].message.content || "";
          
          // Ensure assistant name appears at the beginning of the response
          if (rawAnswer && !rawAnswer.trim().toLowerCase().includes(assistantName.toLowerCase())) {
            rawAnswer = `${assistantName}: ${rawAnswer.trim()}`;
          }
          
          const sanitizedAnswer = rawAnswer
            .replace(/\[.*?\]/g, "")
            .replace(/\{.*?\}/g, "")
            .replace(/system:/gi, "")
            .replace(/prompt:/gi, "");

          const answer = sanitizedAnswer.trim() || `Xin lỗi, tôi là ${assistantName} của acczen.net. Hiện tôi chưa có câu trả lời phù hợp. Bạn thử lại hoặc liên hệ nhân viên nhé!`;

          const totalDuration = Date.now() - startTime;
          console.log(`[${requestId}] Successfully generated response, length: ${answer.length}, time: ${totalDuration}ms`);
          
          return new Response(JSON.stringify({ 
            answer,
            requestId,
            duration: totalDuration
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
          
        } catch (fetchError) {
          // Clean up the timeout if fetch throws
          clearTimeout(timeoutId);
          
          // Handle fetch errors specifically
          if (fetchError.name === "AbortError") {
            console.error(`[${requestId}] OpenAI request timed out after ${Date.now() - startTime}ms`);
            throw new Error("Kết nối với OpenAI API đã hết thời gian chờ");
          }
          
          throw fetchError; // Re-throw for the outer catch block
        }
      } else if (apiSource === "claude") {
        // Claude API call - sample implementation, adjust based on your actual Claude API usage
        console.log(`[${requestId}] Claude API not fully implemented yet, refer to Claude documentation`);
        throw new Error("Claude API integration not fully implemented");
      }
    } catch (apiError) {
      console.error(`[${requestId}] API call error:`, apiError);
      throw apiError; // Re-throw để xử lý trong catch bên ngoài
    }
  } catch (err) {
    const totalDuration = Date.now() - startTime;
    console.error(`[${requestId}] Unhandled error:`, err);

    // Create a detailed error response
    let errorDetail = "Unknown error";
    let errorType = "unknown";
    let errorStack = "";
    
    if (err instanceof Error) {
      errorDetail = `${err.name}: ${err.message}`;
      errorStack = err.stack || "";
      
      // Categorize common errors
      if (err.message.includes("NetworkError") || err.message.includes("Failed to fetch")) {
        errorType = "network";
      } else if (err.message.includes("timeout") || err.message.includes("TimeoutError") || err.message.includes("AbortError")) {
        errorType = "timeout";
      } else if (err.message.includes("authentication") || err.message.includes("auth") || err.message.includes("401")) {
        errorType = "auth";
      } else if (err.message.includes("quota") || err.message.includes("rate limit") || err.message.includes("429")) {
        errorType = "quota";
      }
    } else {
      errorDetail = String(err);
    }

    // Create user-friendly error messages based on error type
    let userMessage = `Xin lỗi, tôi là trợ lý AI acczen.net. `;
    
    switch (errorType) {
      case "network":
        userMessage += "Đã xảy ra lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn và thử lại.";
        break;
      case "timeout": 
        userMessage += "Yêu cầu đã hết thời gian chờ. Hệ thống đang bận, vui lòng thử lại sau.";
        break;
      case "auth":
        userMessage += "Lỗi xác thực API. Vui lòng liên hệ nhân viên kỹ thuật acczen.net.";
        break;
      case "quota":
        userMessage += "Hệ thống AI đang quá tải. Vui lòng thử lại sau ít phút.";
        break;
      default:
        userMessage += "Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Bạn có thể thử lại hoặc liên hệ hỗ trợ tại hotro@acczen.net.";
    }

    return new Response(JSON.stringify({
      error: errorDetail,
      answer: userMessage,
      errorType,
      errorSource: "edge_function",
      stackTrace: errorStack.substring(0, 500),
      requestId,
      duration: totalDuration
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
