
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { AISource } from "@/types/ai";

export interface Recommendation {
  title: string;
  description?: string;
  slug?: string;
  category?: string;
  image?: string;
}

interface UseProductRecommendationsResult {
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function localRecommend(currentProduct: Product): Recommendation[] {
  // Fallback local: recommend 3 sản phẩm cùng categoryId
  // Sẽ trả mock, sau có thể fetch thực từ supabase
  return [
    { title: "Combo Hot Gmail", slug: "combo-hot-gmail", category: "Email", image: "/placeholder.svg" },
    { title: "Gmail SLL Giá Rẻ", slug: "gmail-sll-gia-re", category: "Email", image: "/placeholder.svg" },
    { title: "Hotmail Xịn 2024", slug: "hotmail-xin-2024", category: "Email", image: "/placeholder.svg" }
  ];
}

async function fetchAiRecommendations(product: Product, aiSource: AISource): Promise<Recommendation[]> {
  const prompt = `Hãy dựa trên sản phẩm: "${product.title}" thuộc danh mục "${typeof product.categories === 'object' ? product.categories?.name : product.categories}", hãy gợi ý 3-5 sản phẩm liên quan mà khách hàng MMO thường quan tâm. Trả về danh sách dưới dạng mảng JSON như: [{"title":"...","description":"..."}] với tên sản phẩm ngắn gọn và mô tả ngắn nếu có.`;

  let aiModel = "";
  if (aiSource === "openai") aiModel = "gpt-4o-mini";
  else if (aiSource === "claude") aiModel = "claude-3-haiku-20240307";
  else return localRecommend(product);

  // Gọi edge function "ai-recommendation" với prompt trên
  const { data, error } = await supabase.functions.invoke("ai-recommendation", {
    body: { prompt, aiModel }
  });
  if (error || !data?.recommendations) {
    throw new Error(data?.error || error?.message || "AI recommendation error");
  }
  return data.recommendations;
}

export function useProductRecommendations(product: Product | null, aiSource: AISource = "openai"): UseProductRecommendationsResult {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecs = async () => {
    if (!product) return;
    setLoading(true);
    setError(null);
    try {
      const recs = await fetchAiRecommendations(product, aiSource);
      setRecommendations(recs);
    } catch (err: any) {
      setError(err?.message || "Không thể lấy gợi ý.");
      setRecommendations(localRecommend(product));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (product) fetchRecs(); }, [product, aiSource]);

  return { recommendations, loading, error, refetch: fetchRecs };
}
