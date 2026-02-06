import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, BadgeCheck } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  verified?: boolean;
  company?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Priya Sharma",
    role: "Software Engineer",
    company: "Google",
    avatar: "PS",
    content: "Was drowning in spreadsheets tracking 40+ apps. Kibo saved my sanity. The streak guilt is real though.",
    rating: 5,
    verified: true,
  },
  {
    name: "Jake Morrison",
    role: "Backend Developer",
    company: "Stripe",
    avatar: "JM",
    content: "Quit my accounting job to learn to code. Kibo made the grind actually bearable. 127 day streak and counting.",
    rating: 5,
    verified: true,
  },
  {
    name: "Mei Lin",
    role: "New Grad SWE",
    company: "Meta",
    avatar: "ML",
    content: "My friends thought I was crazy checking my XP every morning. Who's laughing now with 3 offers?",
    rating: 5,
    verified: true,
  },
  {
    name: "Carlos Rivera",
    role: "Full Stack Developer",
    avatar: "CR",
    content: "No CS degree, just me and Kibo's CS Arena grinding at 6am. Finally broke into tech after 8 months.",
    rating: 5,
  },
  {
    name: "Aiden O'Connor",
    role: "Software Engineer",
    company: "Amazon",
    avatar: "AO",
    content: "Bootcamp taught me to code. Kibo taught me to stay consistent. That consistency got me into FAANG.",
    rating: 5,
    verified: true,
  },
  {
    name: "Nina Patel",
    role: "Senior Developer",
    avatar: "NP",
    content: "Returning after a 5-year break was terrifying. Kibo's small daily goals made it feel achievable again.",
    rating: 5,
  },
  {
    name: "Tyler Washington",
    role: "Software Engineer",
    company: "Microsoft",
    avatar: "TW",
    content: "Used Kibo to prep for my return offer interview. 89 problems later, got the yes! The garden heatmap is oddly satisfying.",
    rating: 5,
    verified: true,
  },
  {
    name: "Sofia Andersson",
    role: "Remote Engineer",
    avatar: "SA",
    content: "Applied to 73 remote positions. Kibo kept me organized when everything felt chaotic. Worth every minute.",
    rating: 5,
  },
  {
    name: "David Chen",
    role: "ML Engineer",
    company: "OpenAI",
    avatar: "DC",
    content: "The CS Arena problems are genuinely good. Helped me nail system design questions I struggled with before.",
    rating: 5,
    verified: true,
  },
  {
    name: "Rachel Kim",
    role: "iOS Developer",
    company: "Apple",
    avatar: "RK",
    content: "Tracking 50+ applications without Kibo would have been impossible. The Kanban view is a game changer.",
    rating: 5,
    verified: true,
  },
  {
    name: "Marcus Johnson",
    role: "DevOps Engineer",
    avatar: "MJ",
    content: "The daily focus feature keeps me accountable. Small wins every day add up to big results.",
    rating: 5,
  },
  {
    name: "Elena Rodriguez",
    role: "Frontend Developer",
    company: "Airbnb",
    avatar: "ER",
    content: "From coding bootcamp to Airbnb in 10 months. Kibo's structure made all the difference.",
    rating: 5,
    verified: true,
  },
  {
    name: "Alex Thompson",
    role: "Software Engineer",
    avatar: "AT",
    content: "The community here is amazing. Found my current referral through the network feature.",
    rating: 5,
  },
  {
    name: "Sarah Mitchell",
    role: "Data Engineer",
    company: "Netflix",
    avatar: "SM",
    content: "Level 24 and still going strong. The gamification actually works - I'm addicted to maintaining my streak.",
    rating: 5,
    verified: true,
  },
];

// Split into two different sets for variety
const row1Testimonials = testimonials.slice(0, 7);
const row2Testimonials = testimonials.slice(7, 14);

// Duplicate for seamless loop
const duplicatedRow1 = [...row1Testimonials, ...row1Testimonials, ...row1Testimonials];
const duplicatedRow2 = [...row2Testimonials, ...row2Testimonials, ...row2Testimonials];

interface TestimonialsSectionProps {
  className?: string;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ className }) => {
  return (
    <section className={`py-24 overflow-hidden ${className || ""}`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full">
            Real Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Don't take our word for it
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from engineers who went from stressed to hired.
          </p>
        </div>
      </div>

      {/* Scrolling testimonials - Row 1 (left to right) - Using CSS animation instead of framer-motion */}
      <div className="relative mb-6">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        
        <div className="flex gap-6 animate-testimonial-scroll">
          {duplicatedRow1.map((testimonial, index) => (
            <TestimonialCard key={`row1-${index}`} testimonial={testimonial} />
          ))}
        </div>
      </div>

      {/* Scrolling testimonials - Row 2 (right to left) - Using CSS animation */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        
        <div className="flex gap-6 animate-testimonial-scroll-reverse">
          {duplicatedRow2.map((testimonial, index) => (
            <TestimonialCard key={`row2-${index}`} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="flex-shrink-0 w-[350px] p-6 bg-white/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm">
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-warning text-warning" />
        ))}
      </div>
      <p className="text-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
            {testimonial.avatar}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-foreground text-sm truncate">{testimonial.name}</p>
            {testimonial.verified && (
              <BadgeCheck className="h-4 w-4 text-primary fill-primary/20 flex-shrink-0" />
            )}
          </div>
          <p className="text-muted-foreground text-xs truncate">
            {testimonial.role}
            {testimonial.company && <span className="text-primary"> @ {testimonial.company}</span>}
          </p>
        </div>
      </div>
    </div>
  );
};
