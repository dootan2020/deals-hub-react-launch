
interface ProductFeaturesProps {
  features: string[];
}

const ProductFeatures = ({ features }: ProductFeaturesProps) => {
  if (!features?.length) return null;
  
  return (
    <ul className="text-sm text-gray-600 mb-3 space-y-1 hidden md:block">
      {features.slice(0, 2).map((feature, index) => (
        <li key={index} className="flex items-center">
          <span className="h-1 w-1 bg-gray-500 rounded-full mr-2"></span>
          {feature}
        </li>
      ))}
    </ul>
  );
};

export default ProductFeatures;
