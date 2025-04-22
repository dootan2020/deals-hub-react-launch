
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { prompt, aiModel } = await req.json();
    let aiApiKey = "";
    let apiUrl = "";
    let model = "";
    let payload: any = {};
    if (aiModel?.startsWith("gpt") && OPENAI_API_KEY) {
      // OpenAI
      aiApiKey = OPENAI_API_KEY;
      model = aiModel;
      apiUrl = "https://api.openai.com/v1/chat/completions";
      payload = {
        model,
        messages: [
          {
            role: "system",
            content:
              "Bạn là chuyên gia MMO, hãy gợi ý 3-5 sản phẩm liên quan với tên và mô tả ngắn, chỉ trả về JSON mảng dạng [{\"title\":\"...\",\"description\":\"...\"}]"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 350,
        temperature: 0.7
      };
    } else if (aiModel?.startsWith("claude") && CLAUDE_API_KEY) {
      // Claude
      aiApiKey = CLAUDE_API_KEY;
      model = aiModel;
      apiUrl = "https://api.anthropic.com/v1/messages";
      payload = {
        model,
        messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
        max_tokens: 400,
        temperature: 0.7
      };
    } else {
      throw new Error("No valid AI key found, hoặc AI model không hợp lệ");
    }

    let response;
    if (aiModel.startsWith("gpt")) {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${aiApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      const content: string = data.choices?.[0]?.message?.content || "";
      // Extract JSON in AI output
      const arrMatch = content.match(/\[.*?\]/s);
      const recommendations = arrMatch ? JSON.parse(arrMatch[0]) : [];
      return new Response(JSON.stringify({ recommendations }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } else if (aiModel.startsWith("claude")) {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "x-api-key": aiApiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      // Claude: extract from the "content" in response
      let content = "";
      if (data?.content?.length) {
        content = (typeof data.content[0] === "string") ? data.content[0] : data.content[0]?.text || "";
      }
      const arrMatch = content.match(/\[.*?\]/s);
      const recommendations = arrMatch ? JSON.parse(arrMatch[0]) : [];
      return new Response(JSON.stringify({ recommendations }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    throw new Error("Không gọi được AI model");
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
