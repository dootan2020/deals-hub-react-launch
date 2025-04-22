
import React from "react";
import { Recommendation } from "@/hooks/useProductRecommendations";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductRecommendationsProps {
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
  label?: string;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  recommendations,
  loading,
  error,
  label = "Sản phẩm liên quan bạn có thể quan tâm"
}) => {
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8">
        <Loader2 className="animate-spin h-5 w-5 text-primary" />
        <span>Đang gợi ý sản phẩm...</span>
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500 py-6">{error}</div>;
  }
  if (!recommendations || recommendations.length === 0) return null;
  return (
    <div className="mt-12">
      <h4 className="font-semibold text-lg mb-5 text-primary">{label}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {recommendations.map((rec, idx) => (
          <Card key={rec.slug || idx} className="p-4 rounded-lg border shadow-sm">
            {rec.image && <img src={rec.image} alt={rec.title} className="w-full h-32 object-cover rounded mb-3" />}
            <div className="font-medium text-base mb-1">{rec.title}</div>
            {rec.description && <div className="text-sm text-muted-foreground mb-2">{rec.description}</div>}
            {rec.slug && (
              <Link to={`/product/${rec.slug}`} className="text-blue-600 hover:underline text-sm font-medium">
                Xem chi tiết
              </Link>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
