import { motion } from "framer-motion";
import {
  Leaf,
  Flame,
  Award,
  Gift,
  Truck,
  Lock
} from "lucide-react";

const features = [
  {
    title: "100% Pure Ingredients",
    desc: "We use premium grade ghee and handpicked dry fruits.",
    icon: Leaf
  },
  {
    title: "Handcrafted Daily",
    desc: "Freshly prepared every day using traditional methods.",
    icon: Flame
  },
  {
    title: "Authentic Parampara",
    desc: "Recipes preserved through generations of craftsmanship.",
    icon: Award
  },
  {
    title: "Premium Packaging",
    desc: "Elegant, secure and gift-worthy presentation.",
    icon: Gift
  },
  {
    title: "Pan India Delivery",
    desc: "Safe and timely shipping across the country.",
    icon: Truck
  },
  {
    title: "Secure Payments",
    desc: "Encrypted and trusted checkout experience.",
    icon: Lock
  }
];

const Features = () => {
  const duplicatedFeatures = [...features, ...features];

  return (
    <section className="relative py-24 bg-[var(--bg-body)] overflow-hidden border-t border-amber-100">

      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto mb-16 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-main)] mb-4">
          Crafted With Tradition & Excellence
        </h2>
        <p className="text-[var(--text-muted)] text-base">
          Premium ingredients, authentic recipes and uncompromised quality.
        </p>
      </div>

      {/* Horizontal Slider */}
      <div className="relative overflow-hidden">

        <motion.div
          className="flex gap-8 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            duration: 25,
            ease: "linear"
          }}
        >
          {duplicatedFeatures.map((feature, idx) => (
            <div
              key={idx}
              className="
                min-w-[320px]
                p-8 rounded-3xl
                bg-white/70 backdrop-blur-md
                border border-amber-200/60
                shadow-lg
                flex items-start gap-5
              "
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                <feature.icon
                  size={28}
                  strokeWidth={1.5}
                  className="text-amber-600"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default Features;