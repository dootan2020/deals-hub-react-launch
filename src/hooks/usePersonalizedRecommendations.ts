
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { AISource } from "@/types/ai";
import { prepareQueryParam, safeCastArray, isSupabaseError } from "@/utils/supabaseTypeUtils";

export interface Recommendation {
  title: string;
  description?: string;
  slug?: string;
  category?: string;
  image?: string;
}

interface UsePersonalizedRecommendationsReturn {
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

async function fetchOrderHistory(userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(
        *,
        product:products(
          id, title, slug, category_id, categories:categories(name), image:images
        )
      )
    `)
    .eq("user_id", prepareQueryParam(userId))
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  // Filter out error objects and ensure we have valid data
  return safeCastArray<any>(data).filter(order => !isSupabaseError(order));
}

async function localRecommend(userId: string, currentProductSlug: string): Promise<Recommendation[]> {
  const history = await fetchOrderHistory(userId);
  const bought = [];
  let mostCat = null;
  const catCount: Record<string, number> = {};

  history.forEach(order => {
    if (order.order_items && Array.isArray(order.order_items)) {
      order.order_items.forEach(item => {
        if (item && item.product && item.product.slug !== currentProductSlug) {
          bought.push(item.product);
          const cid = item.product.category_id || "";
          if (cid) catCount[cid] = (catCount[cid] || 0) + 1;
        }
      });
    }
  });

  mostCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])?.[0]?.[0] || null;

  if (mostCat) {
    const { data, error } = await supabase
      .from("products")
      .select("id,title,slug,description,category_id,images")
      .eq("category_id", prepareQueryParam(mostCat))
      .neq("slug", prepareQueryParam(currentProductSlug))
      .limit(5);

    if (!error && data) {
      const boughtSlugs = bought.map((p: any) => p.slug);
      
      // Filter out any error objects
      const validProducts = safeCastArray<any>(data).filter(p => !isSupabaseError(p));
      
      const recs = validProducts.filter(p => !boughtSlugs.includes(p.slug)).map(p => ({
        title: p.title,
        slug: p.slug,
        description: p.description,
        image: Array.isArray(p.images) ? p.images[0] : undefined,
        category: p.category_id
      }));
      return recs.slice(0, 5);
    }
  }
  return [];
}

async function fetchAiRecommendations(
  userId: string, 
  currentProduct: Product, 
  currentProductSlug: string, 
  aiSource: AISource
): Promise<Recommendation[]> {
  const history = await fetchOrderHistory(userId);
  const productNames = [];
  const boughtSlugs = [];

  history.forEach(order => {
    if (order.order_items && Array.isArray(order.order_items)) {
      order.order_items.forEach(item => {
        if (item && item.product && item.product.slug !== currentProductSlug) {
          productNames.push(item.product.title);
          boughtSlugs.push(item.product.slug);
        }
      });
    }
  });

  if (productNames.length === 0 || aiSource === "local") {
    return localRecommend(userId, currentProductSlug);
  }

  let aiModel = "gpt-4o-mini";
  if (aiSource === "claude") {
    aiModel = "claude-3-haiku-20240307";
  }
  const prompt = `Dựa vào lịch sử mua các sản phẩm: ${productNames.map(t => `"${t}"`).join(", ")} của khách, hãy gợi ý 3-5 sản phẩm liên quan khách MMO thường sẽ quan tâm, tránh gợi ý các sản phẩm đã mua. Trả về JSON dạng [{"title":"...","description":"..."}], tên ngắn gọn, mô tả ngắn.`;

  const { data, error } = await supabase.functions.invoke("ai-recommendation", {
    body: {
      prompt,
      aiModel
    }
  });
  if (error || !data?.recommendations) throw new Error(data?.error || error?.message || "AI error");
  
  // Filter out recommendations that match the current product
  return (data.recommendations || [])
    .filter((rec: any) => rec && typeof rec === 'object' && rec.slug !== currentProductSlug)
    .slice(0, 5);
}

export function usePersonalizedRecommendations(
  userId: string | null,
  currentProduct: Product | null,
  aiSource: AISource = "openai"
): UsePersonalizedRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecs = async () => {
    if (!userId || !currentProduct) return;
    setLoading(true); setError(null);
    try {
      const recs = await fetchAiRecommendations(userId, currentProduct, currentProduct.slug, aiSource);
      setRecommendations(recs);
    } catch (err: any) {
      try {
        const localRecs = await localRecommend(userId, currentProduct.slug);
        setRecommendations(localRecs);
      } catch {
        setError("Không thể gợi ý sản phẩm cá nhân hóa.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (userId && currentProduct) fetchRecs();
    // eslint-disable-next-line
  }, [userId, currentProduct, aiSource]);

  return { recommendations, loading, error, refetch: fetchRecs };
}
