
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
  // Query user's recent orders (limit 5)
  // NOTE: This DB query is for context. Edit as needed for your schema
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

  if (!data) return "";
  // Map last 3 purchases as string
  const ordersStr = data
    .map((order: any) =>
      `• Đơn #${order.id} (${order.status}, ${order.created_at}): Sản phẩm: ${
        order.order_items?.map((item: any) => item.product?.title).join(", ") || "n/a"
      }`
    )
    .join("\n");
  return ordersStr ? `Lịch sử đơn gần đây:\n${ordersStr}` : "";
}

async function getFaqContext() {
  // Static FAQ export - in production, consider loading from DB or some cache
  return `
1. Cách mua sản phẩm? Sau khi chọn sản phẩm, bấm Mua, thanh toán và nhận thông tin qua email.
2. Hướng dẫn nạp tiền: Chọn Nạp tiền trong menu, làm theo hướng dẫn, chọn phương thức mong muốn.
3. Sản phẩm có bảo hành? Đa số đều bảo hành ít nhất 24h. Nếu có vấn đề, vui lòng liên hệ hỗ trợ.
4. Thanh toán an toàn không? Digital Deals Hub sử dụng bảo mật SSL, không lưu thẻ ngân hàng.
5. Cách liên hệ hỗ trợ? Qua email support@digitaldealshub.com hoặc chat trực tuyến ở góc phải.
  `;
}

// Compose prompt for OpenAI
function buildPrompt({ question, userId, history, orderInfo, faq }: {question:string, userId:string | null, history:any[], orderInfo:string, faq:string}) {
  const conversation =
    history
      ?.map((msg: any) => (msg.sender === "user" ? `Khách: ${msg.message}` : `Bot: ${msg.message}`))
      .join("\n") || "";
  const faqSection = faq || "";
  const orderSection = orderInfo ? `\n${orderInfo}\n` : "";

  return `
Bạn là trợ lý AI thông minh của Digital Deals Hub (chuyên về sản phẩm số MMO). 
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
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { question, userId, history } = await req.json();

    // Kiểm tra và ghi log các biến môi trường để debug
    console.log("OPENAI_API_KEY exists:", !!OPENAI_API_KEY);
    console.log("OPENAI_ORG_ID exists:", !!OPENAI_ORG_ID);
    console.log("OPENAI_ORG_ID value (first 4 chars):", OPENAI_ORG_ID ? OPENAI_ORG_ID.substring(0, 4) : "not set");

    if (!OPENAI_API_KEY) {
      console.error("Missing OpenAI API Key");
      return new Response(JSON.stringify({ error: "OpenAI API Key is not configured." }), {
        status: 500,
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

    // Call OpenAI API (gpt-4o-mini)
    const headers: Record<string, string> = {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    };
    
    // Chỉ thêm Organization ID vào headers nếu nó tồn tại và không rỗng
    if (OPENAI_ORG_ID && OPENAI_ORG_ID.trim() !== "") {
      console.log("Adding OpenAI-Organization header");
      headers["OpenAI-Organization"] = OPENAI_ORG_ID;
    }

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

    // Kiểm tra nếu response không thành công
    if (!aiRes.ok) {
      const errorData = await aiRes.text();
      console.error("OpenAI API error:", aiRes.status, errorData);
      return new Response(JSON.stringify({ 
        error: "Lỗi khi gọi OpenAI API", 
        details: `Status: ${aiRes.status}`,
        answer: "Xin lỗi, tôi đang gặp vấn đề kết nối. Vui lòng thử lại sau ít phút."
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    const aiData = await aiRes.json();
    
    // Kiểm tra cấu trúc aiData để đảm bảo chúng ta có thể truy cập đúng dữ liệu
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error("Invalid OpenAI response structure:", JSON.stringify(aiData));
      return new Response(JSON.stringify({ 
        error: "Cấu trúc phản hồi không hợp lệ từ OpenAI API",
        answer: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau."
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    const answer = aiData.choices[0].message.content || "Xin lỗi, tôi chưa có câu trả lời phù hợp.";
    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Error in ai-assistant function:", err);
    return new Response(JSON.stringify({ 
      error: (err instanceof Error ? err.message : "Unknown error"),
      answer: "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại." 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
