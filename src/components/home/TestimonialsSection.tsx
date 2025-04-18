
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarIcon } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: 'Michael S.',
    role: 'Marketing Specialist',
    content: 'Digital Deals Hub is fantastic! I needed some social media accounts for work, and their service was quick and reliable. The accounts I purchased were high quality and exactly as described.',
    avatar: '/testimonials/avatar1.jpg',
    rating: 5
  },
  {
    name: 'Jessica W.',
    role: 'Independent Publisher',
    content: 'I love how easy it is to find exactly what I need here. The email accounts I purchased have been working flawlessly for months. Great value for money and excellent customer support!',
    avatar: '/testimonials/avatar2.jpg',
    rating: 5
  },
  {
    name: 'Robert P.',
    role: 'Content Creator',
    content: 'By far the best digital marketplace I\'ve used. The software keys were delivered instantly and activation was seamless. Will definitely be a repeat customer!',
    avatar: '/testimonials/avatar3.jpg',
    rating: 4
  }
];

const TestimonialsSection = () => {
  return (
    <section className="bg-section-primary py-16">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-text-light max-w-3xl mx-auto">
            Don't just take our word for it - hear from some of our satisfied customers about their experience with Digital Deals Hub.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
                  />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-text-light">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              <p className="text-text-light">{testimonial.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
