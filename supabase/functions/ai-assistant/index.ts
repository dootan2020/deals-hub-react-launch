
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// SECURE: Get OpenAI key and Organization ID
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_ORG_ID = Deno.env.get('OPENAI_ORGANIZATION_ID') || "";

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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, userId, history, assistantName } = await req.json();

    console.log(`Request received. userId: ${userId || 'anonymous'}, name: ${assistantName}, question length: ${question?.length || 0}`);
    const hasApiKey = !!OPENAI_API_KEY;
    const hasOrgId = !!OPENAI_ORG_ID;

    console.log("Environment check - OPENAI_API_KEY exists:", hasApiKey);
    console.log("Environment check - OPENAI_ORG_ID exists:", hasOrgId);

    if (!hasApiKey) {
      console.error("Missing OpenAI API Key");
      return new Response(JSON.stringify({
        error: "OpenAI API Key is not configured.",
        answer: `Xin lỗi, hệ thống trợ lý AI acczen.net chưa được cấu hình. Vui lòng liên hệ với bộ phận kỹ thuật acczen.net.`
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      console.error("Invalid question format");
      return new Response(JSON.stringify({
        error: "Question must be a non-empty string",
        answer: `Xin lỗi, tôi không hiểu được câu hỏi của bạn. ${assistantName} khuyên bạn thử lại với câu hỏi cụ thể hơn hoặc liên hệ hotro@acczen.net!`
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

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

    console.log(`Prompt created, length: ${prompt.length} characters, assistant: ${assistantName}`);

    // Gọi OpenAI API (gpt-4o-mini)
    const headers: Record<string, string> = {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    };

    if (OPENAI_ORG_ID && OPENAI_ORG_ID.trim() !== "") {
      console.log("Adding OpenAI-Organization header");
      headers["OpenAI-Organization"] = OPENAI_ORG_ID;
    }

    console.log("Calling OpenAI API...");
    const startTime = Date.now();

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `Bạn là trợ lý AI tên là ${assistantName}, luôn tự xưng tên mình và là hỗ trợ viên cho acczen.net.` },
          { role: "user", content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.6,
      })
    });

    const requestTime = Date.now() - startTime;
    console.log(`OpenAI API response received in ${requestTime}ms, status: ${aiRes.status}`);

    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      console.error(`OpenAI API error: status=${aiRes.status}, response=${errorText}`);

      let errorMessage = "Lỗi khi gọi dịch vụ AI.";
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.type) {
          switch (errorData.error.type) {
            case "invalid_request_error":
              errorMessage = "Yêu cầu không hợp lệ đến dịch vụ AI.";
              break;
            case "authentication_error":
              errorMessage = "Lỗi xác thực với dịch vụ AI.";
              break;
            case "rate_limit_error":
              errorMessage = "Dịch vụ AI đang quá tải. Vui lòng thử lại sau.";
              break;
            default:
              errorMessage = "Lỗi từ dịch vụ AI: " + errorData.error.type;
          }
        }
      } catch (e) {
        console.error("Error parsing OpenAI error response:", e);
      }
      return new Response(JSON.stringify({
        error: `OpenAI API error: ${aiRes.status}`,
        details: errorText.substring(0, 300),
        answer: `Xin lỗi, tôi là ${assistantName}. Tôi đang gặp sự cố kết nối AI (${errorMessage}). Bạn vui lòng thử lại hoặc liên hệ nhân viên hỗ trợ acczen.net qua email hotro@acczen.net nhé!`
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const aiData = await aiRes.json();
    console.log("OpenAI response structure:", JSON.stringify(Object.keys(aiData)));

    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error("Invalid OpenAI response structure:", JSON.stringify(aiData));
      return new Response(JSON.stringify({
        error: "Cấu trúc phản hồi không hợp lệ từ OpenAI API",
        answer: `Xin lỗi, tôi là ${assistantName}. Tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại hoặc liên hệ hotro@acczen.net nhé!`
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Chống prompt injection, tiền xử lý thêm nếu cần
    let rawAnswer = aiData.choices[0].message.content || "";
    // Đảm bảo tên trợ lý xuất hiện ở đầu trả lời
    if (rawAnswer && !rawAnswer.trim().startsWith(assistantName)) {
      rawAnswer = `${assistantName}: ${rawAnswer.trim()}`;
    }
    const sanitizedAnswer = rawAnswer
      .replace(/\[.*?\]/g, "")
      .replace(/\{.*?\}/g, "")
      .replace(/system:/gi, "")
      .replace(/prompt:/gi, "");

    const answer = sanitizedAnswer.trim() || `Xin lỗi, tôi là ${assistantName} của acczen.net. Hiện tôi chưa có câu trả lời phù hợp. Bạn thử lại hoặc liên hệ nhân viên nhé!`;

    console.log("Successfully generated response, length:", answer.length);
    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Unhandled error in ai-assistant function:", err);

    let errorDetail = "Unknown error";
    if (err instanceof Error) {
      errorDetail = `${err.name}: ${err.message}`;
      console.error("Error stack:", err.stack);
    } else {
      errorDetail = String(err);
    }

    return new Response(JSON.stringify({
      error: errorDetail,
      answer: `Xin lỗi, tôi là trợ lý AI acczen.net. Đã xảy ra lỗi khi xử lý yêu cầu, bạn có thể thử lại sau hoặc liên hệ nhân viên hỗ trợ tại hotro@acczen.net!`
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
