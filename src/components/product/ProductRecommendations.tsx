
import React from 'react';

interface ProductRecommendationsProps {
  productId: string;
  strategy?: 'similar' | 'popular' | 'trending' | 'local' | 'openai' | 'claude';
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ productId, strategy = 'similar' }) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">You might also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Empty recommendations for now */}
        <div className="text-gray-500">Recommendations temporarily disabled</div>
      </div>
    </div>
  );
};

export default ProductRecommendations;
