
interface ShowMoreButtonProps {
  onClick: () => void;
}

const ShowMoreButton = ({ onClick }: ShowMoreButtonProps) => {
  return (
    <div className="mt-10 text-center">
      <button 
        onClick={onClick}
        className="px-8 py-3 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-md font-medium transition-colors"
      >
        Show More Categories
      </button>
    </div>
  );
};

export default ShowMoreButton;
