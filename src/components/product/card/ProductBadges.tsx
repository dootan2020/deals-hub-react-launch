
interface BadgeProps {
  badges?: string[];
  discountPercentage?: number;
}

const ProductBadges = ({ badges, discountPercentage }: BadgeProps) => {
  return (
    <>
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {badges && badges.length > 0 && (
          badges.map((badge, index) => {
            let badgeClass = "";
            
            if (badge.includes("OFF")) {
              badgeClass = "badge-discount";
            } else if (badge === "Featured") {
              badgeClass = "badge-featured";
            } else if (badge === "Hot") {
              badgeClass = "badge-hot";
            } else if (badge === "Best Seller") {
              badgeClass = "badge-bestseller";
            } else if (badge === "Limited") {
              badgeClass = "bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm";
            } else {
              badgeClass = "bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm";
            }
            
            return (
              <span key={index} className={badgeClass}>
                {badge}
              </span>
            );
          })
        )}
      </div>
      
      {discountPercentage > 0 && (
        <div className="absolute top-2 right-2">
          <span className="badge-discount">
            {discountPercentage}% OFF
          </span>
        </div>
      )}
    </>
  );
};

export default ProductBadges;
