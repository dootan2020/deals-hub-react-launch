
interface CategorySectionErrorProps {
  error: string;
  onRetry: () => void;
}

const CategorySectionError = ({ error, onRetry }: CategorySectionErrorProps) => {
  return (
    <div className="text-center">
      <p className="text-destructive">{error}</p>
      <button 
        onClick={onRetry} 
        className="mt-4 px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
      >
        Retry
      </button>
    </div>
  );
};

export default CategorySectionError;
