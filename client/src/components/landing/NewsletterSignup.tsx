import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      return apiRequest("POST", "/api/newsletter/subscribe", data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome to the community!",
        description: "You'll receive wellness tips and updates in your inbox.",
      });
      setEmail("");
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to subscribe. Please try again.";
      toast({
        title: "Subscription failed",
        description: message.includes("already") ? "This email is already subscribed." : message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribeMutation.mutate({ email: email.trim() });
  };

  return (
    <section className="py-6 bg-gradient-to-b from-[#F9F9F7] to-[#F6F4EF]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-[#C5A059]/10 text-[#C5A059]">
            <span className="text-sm font-medium">Free Wellness Tips</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-display font-normal text-[#0F172A] mb-4">
            Join Our Wellness Community
          </h2>
          <p className="text-lg text-[#0F172A]/70 mb-8">
            Get weekly insights on building better habits, improving sleep, and living mindfully. No spam, just valuable content.
          </p>

          {subscribeMutation.isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 py-6 px-8 bg-[#C5A059]/10 rounded-xl"
            >
              <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#C5A059] to-[#EBD598] flex items-center justify-center text-[#0F172A] text-sm font-bold">✓</span>
              <span className="text-[#0F172A] font-medium">
                You're in! Check your inbox for a welcome message.
              </span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-stone-200 focus:border-[#C5A059] focus:ring-[#C5A059] text-center"
                  data-testid="input-newsletter-email"
                />
              </div>
              <Button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="btn-gold-shine text-[#0F172A] border border-[#C5A059] px-8"
                data-testid="button-newsletter-subscribe"
              >
                {subscribeMutation.isPending ? "Subscribing..." : "Subscribe for Free"}
              </Button>
              <p className="text-sm text-[#0F172A]/60">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
