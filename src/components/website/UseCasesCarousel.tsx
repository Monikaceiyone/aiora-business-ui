"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingCart, UtensilsCrossed, Scissors, Stethoscope, Store, Wrench } from "lucide-react";

const useCases = [
  { name: "Grocery Stores",    category: "Retail",          tagline: "Automate orders, manage inventory, and serve customers 24/7 with AI.",        icon: ShoppingCart,    image: "/images/homepage/smart.png" },
  { name: "Restaurants",       category: "Food & Beverage", tagline: "Take reservations, handle menu queries, and process orders hands-free.",       icon: UtensilsCrossed, image: "/images/homepage/cctv.png" },
  { name: "Salons & Spas",     category: "Beauty",          tagline: "Book appointments, send reminders, and delight clients with smart AI.",         icon: Scissors,        image: "/images/homepage/RetailShops.png" },
  { name: "Clinics",           category: "Healthcare",      tagline: "Manage patient calls, schedule visits, and answer FAQs automatically.",         icon: Stethoscope,     image: "/images/homepage/businessi.png" },
  { name: "Retail Shops",      category: "Commerce",        tagline: "Showcase your catalog, process WhatsApp orders, and grow sales effortlessly.",  icon: Store,           image: "/images/agents/ecommerce-agent.png" },
  { name: "Service Providers", category: "Services",        tagline: "Dispatch jobs, follow up with clients, and never miss a lead again.",           icon: Wrench,          image: "/images/agents/repair-agent.png" },
];

export default function UseCasesCarousel() {
  const [active, setActive] = useState<number | null>(null);
  const isTouchDevice = useRef(false);

  // Detect touch capability once on mount
  useEffect(() => {
    isTouchDevice.current = window.matchMedia("(hover: none)").matches;
  }, []);

  const handleMouseEnter = (i: number) => {
    if (!isTouchDevice.current) setActive(i);
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice.current) setActive(null);
  };

  const handleClick = (i: number) => {
    if (isTouchDevice.current) {
      setActive((prev) => (prev === i ? null : i));
    }
  };

  const isAnyActive = active !== null;

  return (
    <section className="w-full bg-[#111] py-14 overflow-hidden">
      {/* Heading */}
      {/* <div className="text-center mb-10 px-4">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">built for</p>
        <h2 className="text-2xl md:text-4xl font-black text-white">
          businesses like <span className="text-gray-400">yours.</span>
        </h2>
      </div> */}

      {/* Track */}
      <div className="w-full overflow-hidden">
        <div
          className="flex h-[440px] px-4"
          style={{ gap: "8px" }}
          onMouseLeave={handleMouseLeave}
        >
          {useCases.map((uc, i) => {
            const isExpanded = active === i;
            const isHidden = isAnyActive && !isExpanded;

            return (
              <div
                key={uc.name}
                onMouseEnter={() => handleMouseEnter(i)}
                onClick={() => handleClick(i)}
                className="relative h-full cursor-pointer overflow-hidden rounded-xl"
                style={{
                  flex: isHidden ? "0" : "1",
                  width: isHidden ? "0px" : undefined,
                  minWidth: isHidden ? "0px" : undefined,
                  opacity: isHidden ? 0 : 1,
                  // Keep pointer events on all cards so mobile taps register
                  pointerEvents: "auto",
                  transition:
                    "flex 0.55s cubic-bezier(0.4,0,0.2,1), width 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease",
                  animation: `slideInCard 0.55s cubic-bezier(0.4,0,0.2,1) ${0.05 + i * 0.08}s both`,
                }}
              >
                {/* Background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                  backgroundImage: `url(${uc.image})`,
                    transform: isExpanded ? "scale(1.04)" : "scale(1)",
                    transition: "transform 0.55s ease",
                  }}
                />

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: isExpanded
                      ? "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.22) 60%, rgba(0,0,0,0.06) 100%)"
                      : "linear-gradient(to top, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.12) 100%)",
                    transition: "background 0.4s ease",
                  }}
                />

                {/* Category pill */}
                <div
                  className="absolute top-[18px] left-[18px] whitespace-nowrap"
                  style={{
                    opacity: isExpanded ? 1 : 0,
                    transform: isExpanded ? "translateY(0)" : "translateY(-8px)",
                    transition: "opacity 0.3s ease 0.25s, transform 0.3s ease 0.25s",
                    pointerEvents: "none",
                  }}
                >
                  <span className="text-[11px] uppercase tracking-widest text-white/85 bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                    {uc.category}
                  </span>
                </div>

                {/* Collapsed: vertical label */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    opacity: isAnyActive ? 0 : 1,
                    transition: "opacity 0.2s ease",
                    pointerEvents: "none",
                  }}
                >
                  <span
                    className="text-white font-semibold text-[11px] tracking-[0.18em] uppercase whitespace-nowrap select-none"
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  >
                    {uc.name}
                  </span>
                </div>

                {/* Expanded: title + tagline */}
                <div
                  className="absolute bottom-7 left-7 right-7"
                  style={{
                    opacity: isExpanded ? 1 : 0,
                    transform: isExpanded ? "translateY(0)" : "translateY(18px)",
                    transition: "opacity 0.35s ease 0.28s, transform 0.35s ease 0.28s",
                    pointerEvents: isExpanded ? "auto" : "none",
                  }}
                >
                  <h3 className="text-white font-black text-4xl mb-2">{uc.name}</h3>
                  <p className="text-white/70 text-[15px] leading-relaxed max-w-lg">{uc.tagline}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes slideInCard {
          from { opacity: 0; transform: translateX(-36px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}