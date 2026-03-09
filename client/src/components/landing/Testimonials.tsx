import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Testimonial } from "@shared/schema";

interface TestimonialsProps {
  testimonials: Testimonial[];
  isLoading?: boolean;
}

export function Testimonials({ testimonials, isLoading }: TestimonialsProps) {
  if (isLoading) {
    return (
      <section className="py-6 bg-[#F6F4EF]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 w-64 bg-stone-200 animate-pulse rounded mx-auto mb-4" />
            <div className="h-4 w-96 bg-stone-200 animate-pulse rounded mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-white/60 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-6 bg-[#F6F4EF]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-12 h-1 bg-gradient-to-r from-[#C5A059] to-[#EBD598] mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-display font-normal text-[#0F172A] mb-4">
            Loved by Wellness Seekers
          </h2>
          <p className="text-lg text-[#0F172A]/70 max-w-2xl mx-auto">
            Join thousands who have transformed their daily wellness journey with Sakred Health
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className="p-6 bg-white/60 backdrop-blur-sm border-stone-200/50 hover-elevate h-full"
                data-testid={`card-testimonial-${testimonial.id}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-2xl text-[#C5A059] opacity-60 font-serif">"</span>
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                      <span 
                        key={i} 
                        className="text-[#C5A059] text-sm"
                        data-testid={`icon-star-${testimonial.id}-${i}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-[#0F172A]/70 mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-3 mt-auto">
                  <Avatar className="w-10 h-10">
                    {testimonial.avatarUrl ? (
                      <img 
                        src={testimonial.avatarUrl} 
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-[#C5A059] to-[#EBD598] text-white text-sm">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium text-[#0F172A]" data-testid={`text-testimonial-name-${testimonial.id}`}>
                      {testimonial.name}
                    </p>
                    {testimonial.role && (
                      <p className="text-sm text-[#0F172A]/60" data-testid={`text-testimonial-role-${testimonial.id}`}>
                        {testimonial.role}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
