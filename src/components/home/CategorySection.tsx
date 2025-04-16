
import { Link } from 'react-router-dom';
import { categories } from '@/data/mockData';

const CategorySection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Browse Categories</h2>
          <p className="text-text-light max-w-2xl mx-auto">
            Explore our wide range of digital products across various categories.
            We have everything you need for your digital lifestyle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/category/${category.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-transform duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                <div className="h-48 bg-gray-100 flex items-center justify-center p-6">
                  <img
                    src={category.image.startsWith('/') ? `https://placehold.co/400x300?text=${category.name}` : category.image}
                    alt={category.name}
                    className="h-full w-auto object-contain"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {category.name} <span className="text-text-light text-sm">({category.count})</span>
                  </h3>
                  <p className="text-text-light mb-4">{category.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary font-medium">
                      Browse Category
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
