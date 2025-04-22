
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// SECURE: Get OpenAI key and Organization ID
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_ORG_ID = Deno.env.get('OPENAI_ORGANIZATION_ID') || ""; // fallback empty if not set

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, OpenAI-Organization",
};

async function getUserOrderInfo(userId: string) {
  if (!userId) return "";
  try {
    // Query user's recent orders (limit 5)
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
    
    // Map last 5 purchases as string
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
    // Static FAQ export - in production, consider loading from DB or some cache
    return `
1. Cách mua sản phẩm? Sau khi chọn sản phẩm, bấm Mua, thanh toán và nhận thông tin qua email.
2. Hướng dẫn nạp tiền: Chọn Nạp tiền trong menu, làm theo hướng dẫn, chọn phương thức mong muốn.
3. Sản phẩm có bảo hành? Đa số đều bảo hành ít nhất 24h. Nếu có vấn đề, vui lòng liên hệ hỗ trợ.
4. Thanh toán an toàn không? Digital Deals Hub sử dụng bảo mật SSL, không lưu thẻ ngân hàng.
5. Cách liên hệ hỗ trợ? Qua email support@digitaldealshub.com hoặc chat trực tuyến ở góc phải.
    `;
  } catch (err) {
    console.error("Error in getFaqContext:", err);
    return "";
  }
}

// Compose prompt for OpenAI
function buildPrompt({ question, userId, history, orderInfo, faq }: {question:string, userId:string | null, history:any[], orderInfo:string, faq:string}) {
  try {
    const conversation =
      history
        ?.map((msg: any) => (msg.sender === "user" ? `Khách: ${msg.message}` : `Bot: ${msg.message}`))
        .join("\n") || "";
    const faqSection = faq || "";
    const orderSection = orderInfo ? `\n${orderInfo}\n` : "";

    return `
Bạn là trợ lý AI thông minh của Digital Deals Hub (chuyên về sản phẩm số MMO). 
SYSTEM INSTRUCTIONS:
- Bạn là nhân viên hỗ trợ khách hàng của Digital Deals Hub.
- Trả lời câu hỏi một cách ngắn gọn, chính xác, lịch sự.
- Nếu không chắc chắn về thông tin, xin lỗi người dùng và đề xuất họ liên hệ với bộ phận hỗ trợ qua email support@digitaldealshub.com.
- Luôn giữ thái độ thân thiện, hữu ích.
- Tránh cung cấp thông tin sai lệch.
- Không bao giờ tiết lộ thông tin nhạy cảm của người dùng khác.
- Trong trường hợp người dùng yêu cầu chức năng nằm ngoài khả năng của bạn, giải thích lịch sự về giới hạn hiện tại và đề xuất giải pháp thay thế.

Chức năng chính: trả lời FAQ, giải thích sản phẩm, hướng dẫn nạp/mua hàng, kiểm tra trạng thái đơn (nếu user đăng nhập), hỗ trợ tự động.
Trong trả lời, ưu tiên dựa trên hướng dẫn phía dưới, văn phong thân thiện, ngắn gọn & đúng trọng tâm. 
Nếu có history hội thoại, tiếp tục mạch hội thoại.
Nếu người dùng hỏi về trạng thái đơn hàng, dùng dữ liệu đơn hàng gần đây nếu có bên dưới.

FAQ mẫu:
${faqSection}
${orderSection}

Bắt đầu hội thoại:

${conversation}
Khách: ${question}
Bot:
`.trim();
  } catch (err) {
    console.error("Error in buildPrompt:", err);
    return `
Bạn là trợ lý AI của Digital Deals Hub. Trả lời câu hỏi sau một cách ngắn gọn, lịch sự:

Khách: ${question}
Bot:
`.trim();
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { question, userId, history } = await req.json();

    // Log request thông tin
    console.log(`Request received. userId: ${userId || 'anonymous'}, question length: ${question?.length || 0}`);
    
    // Kiểm tra và ghi log các biến môi trường
    const hasApiKey = !!OPENAI_API_KEY;
    const hasOrgId = !!OPENAI_ORG_ID;
    
    console.log("Environment check - OPENAI_API_KEY exists:", hasApiKey);
    console.log("Environment check - OPENAI_ORG_ID exists:", hasOrgId);
    
    if (!hasApiKey) {
      console.error("Missing OpenAI API Key");
      return new Response(JSON.stringify({ 
        error: "OpenAI API Key is not configured.",
        answer: "Xin lỗi, hệ thống trợ lý AI chưa được cấu hình. Vui lòng liên hệ quản trị viên để được hỗ trợ."
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      console.error("Invalid question format");
      return new Response(JSON.stringify({ 
        error: "Question must be a non-empty string",
        answer: "Xin lỗi, tôi không hiểu được câu hỏi của bạn. Vui lòng thử lại với một câu hỏi cụ thể hơn."
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
      faq
    });

    // Log prompt cho debugging (che giấu thông tin nhạy cảm)
    console.log(`Prompt created, length: ${prompt.length} characters`);

    // Call OpenAI API (gpt-4o-mini)
    const headers: Record<string, string> = {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    };
    
    // Chỉ thêm Organization ID vào headers nếu nó tồn tại và không rỗng
    if (OPENAI_ORG_ID && OPENAI_ORG_ID.trim() !== "") {
      console.log("Adding OpenAI-Organization header");
      headers["OpenAI-Organization"] = OPENAI_ORG_ID;
    } else {
      console.log("No Organization ID provided, skipping header");
    }
    
    console.log("Calling OpenAI API...");
    const startTime = Date.now();
    
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Bạn là trợ lý AI của Digital Deals Hub, chuyên hỗ trợ khách mua sản phẩm số." },
          { role: "user", content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.6,
      })
    });
    
    const requestTime = Date.now() - startTime;
    console.log(`OpenAI API response received in ${requestTime}ms, status: ${aiRes.status}`);

    // Kiểm tra nếu response không thành công
    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      console.error(`OpenAI API error: status=${aiRes.status}, response=${errorText}`);
      
      // Phân tích lỗi cụ thể từ OpenAI nếu có thể
      let errorMessage = "Lỗi khi gọi dịch vụ AI.";
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          console.error("OpenAI error details:", errorData.error);
          
          // Xác định loại lỗi cụ thể và trả về thông báo phù hợp
          if (errorData.error.type === "invalid_request_error") {
            errorMessage = "Yêu cầu không hợp lệ đến dịch vụ AI.";
          } else if (errorData.error.type === "authentication_error") {
            errorMessage = "Lỗi xác thực với dịch vụ AI.";
          } else if (errorData.error.type === "rate_limit_error") {
            errorMessage = "Dịch vụ AI hiện đang quá tải. Vui lòng thử lại sau.";
          } else if (errorData.error.code === "invalid_api_key") {
            errorMessage = "Khóa API không hợp lệ.";
          } else if (errorData.error.code === "account_deactivated") {
            errorMessage = "Tài khoản AI đã bị vô hiệu hóa.";
          } else if (errorData.error.code === "insufficient_quota") {
            errorMessage = "Đã vượt quá giới hạn sử dụng dịch vụ AI.";
          } else if (errorData.error.message) {
            // Lấy thông điệp lỗi từ OpenAI nhưng không hiển thị toàn bộ cho người dùng
            errorMessage = "Lỗi từ dịch vụ AI: " + errorData.error.type;
          }
        }
      } catch (e) {
        console.error("Error parsing OpenAI error response:", e);
      }
      
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${aiRes.status}`,
        details: errorText.substring(0, 200),  // Chỉ lưu một phần nhỏ detail để logging
        answer: `Xin lỗi, tôi đang gặp vấn đề kết nối. ${errorMessage} Vui lòng thử lại sau ít phút hoặc liên hệ với bộ phận hỗ trợ qua email support@digitaldealshub.com.`
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    const aiData = await aiRes.json();
    console.log("OpenAI response structure:", JSON.stringify(Object.keys(aiData)));
    
    // Kiểm tra cấu trúc aiData để đảm bảo chúng ta có thể truy cập đúng dữ liệu
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error("Invalid OpenAI response structure:", JSON.stringify(aiData));
      return new Response(JSON.stringify({ 
        error: "Cấu trúc phản hồi không hợp lệ từ OpenAI API",
        answer: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ với bộ phận hỗ trợ qua email support@digitaldealshub.com."
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Kiểm tra nội dung phản hồi từ OpenAI trước khi gửi cho người dùng
    const rawAnswer = aiData.choices[0].message.content || "";
    
    // Xử lý phòng chống prompt injection
    const sanitizedAnswer = rawAnswer
      .replace(/\[.*?\]/g, "") // Loại bỏ các lệnh trong ngoặc vuông
      .replace(/\{.*?\}/g, "") // Loại bỏ các lệnh trong ngoặc nhọn
      .replace(/system:/gi, "") // Loại bỏ từ khóa system:
      .replace(/prompt:/gi, ""); // Loại bỏ từ khóa prompt:
    
    // Fallback nếu answer trống
    const answer = sanitizedAnswer.trim() || "Xin lỗi, tôi chưa có câu trả lời phù hợp. Vui lòng thử lại với câu hỏi khác hoặc liên hệ bộ phận hỗ trợ.";
    
    console.log("Successfully generated response, length:", answer.length);
    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    // Ghi log lỗi chi tiết
    console.error("Unhandled error in ai-assistant function:", err);
    
    // Cố gắng lấy thông tin thêm về lỗi
    let errorDetail = "Unknown error";
    if (err instanceof Error) {
      errorDetail = `${err.name}: ${err.message}`;
      console.error("Error stack:", err.stack);
    } else {
      errorDetail = String(err);
    }
    
    return new Response(JSON.stringify({ 
      error: errorDetail,
      answer: "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau hoặc liên hệ với bộ phận hỗ trợ qua email support@digitaldealshub.com." 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
