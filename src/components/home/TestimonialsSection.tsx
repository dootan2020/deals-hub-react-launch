
import { Star, StarHalf } from 'lucide-react';
import { testimonials } from '@/data/mockData';

const TestimonialsSection = () => {
  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    }

    // Add empty stars to reach 5
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-yellow-400" />);
    }

    return stars;
  };

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-text-light max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our customers have to say about their experience shopping with us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-text-light">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mb-3">
                {renderStars(testimonial.rating)}
              </div>
              
              <p className="text-text-light italic">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
