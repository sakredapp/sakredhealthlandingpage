import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Mail, Sparkles, Check } from "lucide-react";
import { useDownloadDialog } from "@/components/landing/DownloadDialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const STORAGE_KEY = "sakred_food_chart_subscribed";

type PHLevel = 3 | 2 | 1 | 0 | -1 | -2 | -3;

interface FoodItem {
  name: string;
  level: PHLevel;
}

interface FoodCategory {
  category: string;
  description: string;
  items: FoodItem[];
}

const levelConfig: Record<PHLevel, { label: string; color: string; bgColor: string; position: number }> = {
  3: { label: "High Alkaline", color: "#059669", bgColor: "#D1FAE5", position: 1 },
  2: { label: "Medium Alkaline", color: "#10B981", bgColor: "#ECFDF5", position: 2 },
  1: { label: "Low Alkaline", color: "#34D399", bgColor: "#F0FDF4", position: 3 },
  0: { label: "Neutral", color: "#C5A059", bgColor: "#FEF3C7", position: 4 },
  [-1]: { label: "Low Acid", color: "#F59E0B", bgColor: "#FEF3C7", position: 5 },
  [-2]: { label: "Medium Acid", color: "#F97316", bgColor: "#FED7AA", position: 6 },
  [-3]: { label: "High Acid", color: "#DC2626", bgColor: "#FEE2E2", position: 7 },
};

const foodData: FoodCategory[] = [
  {
    category: "Fruits",
    description: "Fresh and dried fruits across the pH spectrum",
    items: [
      { name: "Lemons", level: 3 },
      { name: "Limes", level: 3 },
      { name: "Watermelons", level: 3 },
      { name: "Grapefruit", level: 3 },
      { name: "Raspberry", level: 3 },
      { name: "Dates", level: 2 },
      { name: "Figs", level: 2 },
      { name: "Melons", level: 2 },
      { name: "Grapes", level: 2 },
      { name: "Kiwi", level: 2 },
      { name: "Apples", level: 2 },
      { name: "Pears", level: 2 },
      { name: "Mango", level: 2 },
      { name: "Oranges", level: 1 },
      { name: "Cherries", level: 1 },
      { name: "Pineapples", level: 1 },
      { name: "Peaches", level: 1 },
      { name: "Most Berries", level: 1 },
      { name: "Apricots", level: 1 },
      { name: "Bananas", level: -1 },
      { name: "Prunes", level: -1 },
      { name: "Natural fruit juice", level: -1 },
      { name: "Unsweetened jams", level: -1 },
      { name: "Cranberry", level: -2 },
      { name: "Pomegranate", level: -2 },
      { name: "Sweetened Fruit Juices", level: -3 },
      { name: "Jams", level: -3 },
      { name: "Dried fruits (Sulphured)", level: -3 },
    ],
  },
  {
    category: "Vegetables & Legumes",
    description: "Plant-based foods and protein sources",
    items: [
      { name: "Broccoli", level: 3 },
      { name: "Cucumber", level: 3 },
      { name: "Collard Greens", level: 3 },
      { name: "Kale", level: 3 },
      { name: "Chard", level: 3 },
      { name: "Spinach (Raw)", level: 3 },
      { name: "Onion", level: 3 },
      { name: "Garlic", level: 3 },
      { name: "Parsley", level: 3 },
      { name: "Sea vegetables", level: 3 },
      { name: "Bell Pepper", level: 2 },
      { name: "Cauliflower", level: 2 },
      { name: "Okra", level: 2 },
      { name: "Ginger", level: 2 },
      { name: "Sweet Potato", level: 2 },
      { name: "Cabbage", level: 2 },
      { name: "Celery", level: 2 },
      { name: "Carrots", level: 2 },
      { name: "Asparagus", level: 2 },
      { name: "Potato Skins", level: 1 },
      { name: "Beets", level: 1 },
      { name: "Lettuce", level: 1 },
      { name: "Mushrooms", level: 1 },
      { name: "Brussels Sprouts", level: 1 },
      { name: "Pumpkin", level: 1 },
      { name: "Squash", level: 1 },
      { name: "Tempeh", level: 1 },
      { name: "Tomatoes", level: 1 },
      { name: "Cooked Spinach", level: -1 },
      { name: "Soy Protein Powder", level: -1 },
      { name: "Lentils", level: -1 },
      { name: "Chick + Split Peas", level: -1 },
      { name: "Tofu", level: -1 },
      { name: "Edamame", level: -1 },
      { name: "Potatoes w/o skin", level: -2 },
      { name: "Beans (Pinto, Kidney, Lima)", level: -2 },
      { name: "Processed Soy beans", level: -3 },
      { name: "Salted Peanut Butter", level: -3 },
    ],
  },
  {
    category: "Grains & Cereals",
    description: "Whole grains, breads, and processed grain products",
    items: [
      { name: "Whole Oats", level: 1 },
      { name: "Quinoa", level: 1 },
      { name: "Millet + Spelt", level: 1 },
      { name: "Hemp Protein", level: 1 },
      { name: "Sprouted Grain Bread", level: 1 },
      { name: "Wild Rice", level: 1 },
      { name: "Basmati + Brown Rice", level: -1 },
      { name: "Wheat", level: -1 },
      { name: "Buckwheat", level: -1 },
      { name: "Amaranth", level: -1 },
      { name: "Whole Wheat Bread + Pasta", level: -1 },
      { name: "Rice Protein Powder", level: -2 },
      { name: "Oats + Bran", level: -2 },
      { name: "Rye", level: -2 },
      { name: "White Bread + Pasta", level: -2 },
      { name: "White Rice", level: -2 },
      { name: "Chocolate", level: -3 },
      { name: "Pastries", level: -3 },
      { name: "Cookies", level: -3 },
      { name: "Cakes", level: -3 },
    ],
  },
  {
    category: "Meat & Animal Products",
    description: "Animal proteins and dairy products",
    items: [
      { name: "Dairy Probiotic Cultures", level: 1 },
      { name: "Human Breast Milk", level: 1 },
      { name: "Whey Protein", level: -1 },
      { name: "Fish", level: -1 },
      { name: "Venison", level: -1 },
      { name: "Duck", level: -1 },
      { name: "Turkey", level: -1 },
      { name: "Cottage Cheese", level: -1 },
      { name: "Goat + Sheep Milk", level: -1 },
      { name: "Chicken (White meat)", level: -2 },
      { name: "Lamb", level: -2 },
      { name: "Veal", level: -2 },
      { name: "Shellfish", level: -2 },
      { name: "Casein (milk protein)", level: -2 },
      { name: "Beef", level: -3 },
      { name: "Pork", level: -3 },
      { name: "Hard Cheeses", level: -3 },
      { name: "Eggs", level: -3 },
      { name: "Processed Meats", level: -3 },
      { name: "Ice Cream", level: -3 },
    ],
  },
  {
    category: "Oils, Plants & Seeds",
    description: "Healthy fats, nuts, and seed products",
    items: [
      { name: "All Sprouts", level: 3 },
      { name: "Sprouted/Soaked Nuts + Seeds", level: 3 },
      { name: "Wheat Grass", level: 3 },
      { name: "Pumpkin Seeds", level: 2 },
      { name: "Almonds", level: 2 },
      { name: "Chia Seeds", level: 2 },
      { name: "Raw Almond Butter", level: 2 },
      { name: "Olive Oil", level: 2 },
      { name: "Macadamia Nut Oil", level: 2 },
      { name: "Avocados", level: 1 },
      { name: "Most Raw Nuts And Seeds", level: 1 },
      { name: "Coconut, Hemp, Flax Oils", level: 1 },
      { name: "Almond, Corn, Safflower Oils", level: -1 },
      { name: "Sesame, Canola Oil", level: -1 },
      { name: "Pine Nuts", level: -1 },
      { name: "Lard", level: -2 },
      { name: "Chestnut + Palm Kernel Oils", level: -2 },
      { name: "Peanuts", level: -2 },
      { name: "Roasted Nuts & Seeds", level: -2 },
      { name: "Margarine", level: -3 },
      { name: "Hydrogenated Oils", level: -3 },
      { name: "Cottonseed Oil", level: -3 },
      { name: "Heated Oils", level: -3 },
    ],
  },
  {
    category: "Seasoning, Spices & Sweeteners",
    description: "Flavor enhancers and natural sweeteners",
    items: [
      { name: "Celtic Sea Salt", level: 3 },
      { name: "Himalayan Pink Salt", level: 3 },
      { name: "Miso", level: 3 },
      { name: "Cayenne", level: 3 },
      { name: "Baking Soda", level: 3 },
      { name: "Cinnamon", level: 2 },
      { name: "Ginger", level: 2 },
      { name: "Dill", level: 2 },
      { name: "Mint", level: 2 },
      { name: "Turmeric", level: 2 },
      { name: "Basil", level: 2 },
      { name: "Oregano", level: 2 },
      { name: "Stevia", level: 2 },
      { name: "Most Herbs", level: 1 },
      { name: "Curry", level: 1 },
      { name: "Tamari", level: 1 },
      { name: "Raw Honey", level: 1 },
      { name: "Maple Syrup", level: 1 },
      { name: "Carob", level: -1 },
      { name: "Tahini", level: -1 },
      { name: "Processed Honey", level: -1 },
      { name: "Molasses", level: -1 },
      { name: "Agave", level: -1 },
      { name: "Vanilla", level: -2 },
      { name: "Nutmeg", level: -2 },
      { name: "Mayonnaise", level: -2 },
      { name: "Ketchup", level: -2 },
      { name: "Table Salt", level: -2 },
      { name: "Brown Sugar", level: -2 },
      { name: "Soy Sauce", level: -3 },
      { name: "Nutritional Yeast", level: -3 },
      { name: "Black Pepper", level: -3 },
      { name: "Aspartame", level: -3 },
      { name: "MSG", level: -3 },
    ],
  },
  {
    category: "Beverages",
    description: "Drinks and liquid refreshments",
    items: [
      { name: "Lemon Water", level: 3 },
      { name: "Herbal Tea", level: 3 },
      { name: "Ginger Tea", level: 2 },
      { name: "Kombucha", level: 2 },
      { name: "Apple Cider Vinegar", level: 2 },
      { name: "Green Tea", level: 1 },
      { name: "Mineral Water", level: 1 },
      { name: "Ionized Water", level: 1 },
      { name: "Pure Water", level: 0 },
      { name: "Kona Coffee", level: -1 },
      { name: "Rice Vinegar", level: -1 },
      { name: "Coffee", level: -2 },
      { name: "Black Tea", level: -2 },
      { name: "Red Wine Vinegar", level: -2 },
      { name: "Balsamic Vinegar", level: -2 },
      { name: "Caffeine Drinks", level: -3 },
      { name: "Alcoholic Drinks", level: -3 },
      { name: "Soda", level: -3 },
      { name: "White Vinegar", level: -3 },
    ],
  },
  {
    category: "Activities & Lifestyle",
    description: "Behaviors that affect your body's pH balance",
    items: [
      { name: "Deep Sleep", level: 3 },
      { name: "Cold Bath/Shower", level: 3 },
      { name: "Massage", level: 3 },
      { name: "Deep Breathing", level: 2 },
      { name: "Tai Chi", level: 2 },
      { name: "Meditation", level: 2 },
      { name: "Yin Yoga", level: 1 },
      { name: "Slow Synchronized Movement", level: 1 },
      { name: "Walking", level: -1 },
      { name: "Weight Lifting", level: -2 },
      { name: "Shallow Breathing", level: -2 },
      { name: "Most High-Intensity Exercise", level: -2 },
      { name: "Lack of Sleep", level: -3 },
      { name: "Excess Stress", level: -3 },
      { name: "Hot Bath (prolonged)", level: -3 },
    ],
  },
];

function PHLevelIndicator({ level }: { level: PHLevel }) {
  const config = levelConfig[level];
  const segments = 7;
  const activeSegment = config.position;

  return (
    <div className="flex items-center gap-1.5" data-testid={`ph-indicator-${level}`}>
      <div className="flex gap-0.5">
        {Array.from({ length: segments }).map((_, i) => {
          const segmentLevel = (3 - i) as PHLevel;
          const segmentConfig = levelConfig[segmentLevel];
          const isActive = i + 1 === activeSegment;
          
          return (
            <div
              key={i}
              className={`w-2 h-4 rounded-sm transition-all ${
                isActive 
                  ? "ring-1 ring-offset-1 ring-[#0F172A]/20" 
                  : "opacity-30"
              }`}
              style={{ 
                backgroundColor: isActive ? segmentConfig.color : segmentConfig.color,
              }}
            />
          );
        })}
      </div>
      <span 
        className="text-xs font-medium px-2 py-0.5 rounded-full"
        style={{ 
          backgroundColor: config.bgColor,
          color: config.color,
        }}
      >
        {config.label}
      </span>
    </div>
  );
}

function PHScaleLegend() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-[#E8E6E3] mb-8">
      <h3 className="font-display text-lg font-medium text-[#0F172A] mb-4 text-center">pH Level Scale</h3>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 flex-wrap">
        {([3, 2, 1, 0, -1, -2, -3] as PHLevel[]).map((level) => {
          const config = levelConfig[level];
          return (
            <div 
              key={level} 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: config.bgColor }}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-xs font-medium" style={{ color: config.color }}>
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-center text-sm text-[#0F172A]/60 mt-4">
        Items at the top are more alkaline (cooling, balancing). Items at the bottom are more acidic (warming, stimulating).
      </p>
    </div>
  );
}

function CategoryAccordionContent({ category }: { category: FoodCategory }) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const sortedItems = [...category.items].sort((a, b) => b.level - a.level);
  const filteredItems = sortedItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F172A]/40" />
        <Input
          type="text"
          placeholder={`Search ${category.category.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 bg-[#F9F9F7] border-[#E8E6E3] focus:border-[#C5A059] focus:ring-[#C5A059]/20"
          data-testid={`search-${category.category.toLowerCase().replace(/\s+/g, '-')}`}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F172A]/40 hover:text-[#0F172A]/60 transition-colors"
            data-testid={`clear-search-${category.category.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="flex gap-4">
        <div className="hidden sm:flex flex-col items-center py-2">
          <div className="w-3 h-full rounded-full bg-gradient-to-b from-[#059669] via-[#C5A059] to-[#DC2626] opacity-60" />
        </div>
        <div className="flex-1 space-y-2">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-[#0F172A]/50 text-sm">
              No items found matching "{searchTerm}"
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center justify-between gap-4 py-2 px-3 rounded-lg hover:bg-[#F9F9F7]/80 transition-colors"
                data-testid={`food-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span className="text-[#0F172A]/80 text-sm">
                  {item.name}
                </span>
                <PHLevelIndicator level={item.level} />
              </div>
            ))
          )}
        </div>
      </div>
      
      {searchTerm && filteredItems.length > 0 && (
        <p className="text-xs text-[#0F172A]/50 text-center">
          Showing {filteredItems.length} of {category.items.length} items
        </p>
      )}
    </div>
  );
}

function EmailGateModal({ onSubscribe, onSkip }: { onSubscribe: (email: string) => void; onSkip: () => void }) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      onSubscribe(email);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div 
        className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm"
        data-testid="email-gate-backdrop"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-[#E8E6E3]"
        data-testid="email-gate-modal"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#C5A059] to-[#EBD598] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <Badge className="mb-3 bg-[#059669]/10 text-[#059669] border-0 font-medium">
            100% Free Access
          </Badge>
          <h2 className="font-display text-2xl font-normal text-[#0F172A] mb-2">
            Unlock the Full Food Chart
          </h2>
          <p className="text-[#0F172A]/70 text-sm leading-relaxed">
            Enter your email to get instant free access to our complete alkaline and acidic food guide.
            No credit card required, no hidden costs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0F172A]/40" />
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 h-12 bg-[#F9F9F7] border-[#E8E6E3] focus:border-[#C5A059] focus:ring-[#C5A059]/20"
              data-testid="email-gate-input"
              disabled={isSubmitting}
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-[#C5A059] to-[#EBD598] hover:from-[#B8954F] hover:to-[#D4C588] text-[#0F172A] font-medium border-0"
            data-testid="email-gate-submit"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Unlocking...
              </span>
            ) : (
              "Get Free Access"
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-[#0F172A]/50 mt-4">
          We respect your privacy. Unsubscribe anytime.
        </p>
        
        <button
          type="button"
          onClick={onSkip}
          className="w-full mt-3 text-center text-xs text-[#0F172A]/40 hover:text-[#0F172A]/60 transition-colors"
          data-testid="email-gate-skip"
        >
          Skip for now
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function FoodChart() {
  const { openDialog, DialogComponent } = useDownloadDialog();
  const [showGate, setShowGate] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) === "true";
    }
    return false;
  });

  useEffect(() => {
    if (isSubscribed) return;
    
    const timer = setTimeout(() => {
      setShowGate(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, [isSubscribed]);

  const handleSubscribe = async (email: string) => {
    try {
      const response = await fetch('/api/email-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'food_chart' })
      });
      
      if (!response.ok) {
        console.error('Failed to save email');
      }
    } catch (error) {
      console.error('Error saving email:', error);
    }
    
    localStorage.setItem(STORAGE_KEY, "true");
    setIsSubscribed(true);
    setShowGate(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      <Navigation />
      
      <AnimatePresence>
        {showGate && !isSubscribed && (
          <EmailGateModal 
            onSubscribe={handleSubscribe} 
            onSkip={() => setShowGate(false)}
          />
        )}
      </AnimatePresence>
      
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-gradient-to-r from-[#C5A059] to-[#EBD598] text-[#0F172A] border-0 font-medium">
              Foundational Nutrition
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-normal text-[#0F172A] mb-6">
              Alkaline vs. Acidic Food Chart
            </h1>
            <p className="text-lg text-[#0F172A]/70 max-w-3xl mx-auto leading-relaxed">
              Understanding the pH balance of foods helps support your body's internal balance. 
              This isn't about strict rules—it's about awareness. Both acidic and alkaline foods 
              have their place in a balanced approach to nourishment.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <PHScaleLegend />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Accordion type="multiple" className="space-y-3" defaultValue={["Fruits"]}>
              {foodData.map((category) => (
                <AccordionItem
                  key={category.category}
                  value={category.category}
                  className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-[#E8E6E3] overflow-hidden"
                >
                  <AccordionTrigger 
                    className="px-6 py-4 hover:no-underline hover:bg-[#F9F9F7]/50 transition-colors"
                    data-testid={`accordion-${category.category.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="font-display text-lg font-medium text-[#0F172A]">
                        {category.category}
                      </span>
                      <span className="text-sm text-[#0F172A]/60 mt-0.5">
                        {category.description} ({category.items.length} items)
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <CategoryAccordionContent category={category} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid md:grid-cols-2 gap-6 mt-12 mb-12"
          >
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-[#E8E6E3]">
              <h3 className="font-display text-xl font-medium text-[#0F172A] mb-4">Understanding the Balance</h3>
              <p className="text-[#0F172A]/70 leading-relaxed mb-4">
                Your body naturally maintains a slightly alkaline blood pH (7.35-7.45). The foods you eat 
                don't directly change blood pH, but they can influence how hard your body works to maintain 
                that balance.
              </p>
              <p className="text-[#0F172A]/70 leading-relaxed">
                Eating more alkaline-forming foods may reduce the burden on your body's buffering systems, 
                supporting overall vitality and energy levels.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-[#E8E6E3]">
              <h3 className="font-display text-xl font-medium text-[#0F172A] mb-4">A Flexible Approach</h3>
              <p className="text-[#0F172A]/70 leading-relaxed mb-4">
                This chart is a guide, not a strict rulebook. Acidic foods aren't "bad"—many provide 
                essential nutrients. The goal is awareness and gradual shifts toward more 
                alkaline-forming choices when possible.
              </p>
              <p className="text-[#0F172A]/70 leading-relaxed">
                Listen to your body. Notice how different foods make you feel. Use this knowledge 
                to make informed choices that support your unique wellness journey.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-br from-[#C5A059]/10 to-[#EBD598]/20 rounded-2xl p-8 text-center"
          >
            <h3 className="font-display text-2xl font-medium text-[#0F172A] mb-4">
              Ready to Transform Your Wellness?
            </h3>
            <p className="text-[#0F172A]/70 mb-6 max-w-xl mx-auto">
              Sakred Health guides you through personalized routines that support your body's natural 
              balance—including nutrition, hydration, and digestive wellness.
            </p>
            <button 
              onClick={openDialog}
              className="inline-flex items-center justify-center rounded-full px-8 py-3 btn-gold-shine text-[#0F172A] border border-[#C5A059] shadow-lg shadow-[#C5A059]/20 font-medium cursor-pointer"
              data-testid="button-start-journey"
            >
              Download the App
            </button>
          </motion.div>
        </div>
      </main>

      <Footer />
      {DialogComponent}
    </div>
  );
}
