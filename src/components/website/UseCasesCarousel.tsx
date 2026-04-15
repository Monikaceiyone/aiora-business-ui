"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingCart, UtensilsCrossed, Scissors, Stethoscope, Store, Wrench, X } from "lucide-react";

const useCases = [
  { name: "Grocery Stores",    category: "Retail",          tagline: "Automate orders, manage inventory, and serve customers 24/7 with AI.",        icon: ShoppingCart,    image: "/images/homepage/smart.png" },
  { name: "Restaurants",       category: "Food & Beverage", tagline: "Take reservations, handle menu queries, and process orders hands-free.",       icon: UtensilsCrossed, image: "/images/homepage/cctv.png" },
  { name: "Salons & Spas",     category: "Beauty",          tagline: "Book appointments, send reminders, and delight clients with smart AI.",         icon: Scissors,        image: "/images/homepage/RetailShops.png" },
  { name: "Clinics",           category: "Healthcare",      tagline: "Manage patient calls, schedule visits, and answer FAQs automatically.",         icon: Stethoscope,     image: "/images/homepage/businessi.png" },
  { name: "Retail Shops",      category: "Commerce",        tagline: "Showcase your catalog, process WhatsApp orders, and grow sales effortlessly.",  icon: Store,           image: "/images/agents/ecommerce-agent.png" },
  { name: "Service Providers", category: "Services",        tagline: "Dispatch jobs, follow up with clients, and never miss a lead again.",           icon: Wrench,          image: "/images/agents/repair-agent.png" },
];

export default function UseCasesCarousel() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    // isTouchDevice.current = window.matchMedia("(hover: none)").matches;

     const hasHover = window.matchMedia("(hover: hover)").matches;
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

  // Only treat as touch-only if NO hover + NO fine pointer
  isTouchDevice.current = !(hasHover && hasFinePointer);
  }, []);

  const isAnyActive = selectedCard !== null;

  // Desktop: hover expands/collapses
  // const handleMouseEnter = (i: number) => {
  //   if (!isTouchDevice.current) setSelectedCard(i);
  // };
  // const handleMouseLeave = () => {
  //   if (!isTouchDevice.current) setSelectedCard(null);
  // };

  // // Mobile: tap toggles; also works as fallback click on desktop
  // const handleCardClick = (i: number) => {
  //   if (isTouchDevice.current) {
  //     setSelectedCard((prev) => (prev === i ? null : i));
  //   }
  // };

  const handleMouseEnter = (i: number) => {
  if (!isTouchDevice.current) setSelectedCard(i);
};

const handleMouseLeave = () => {
  if (!isTouchDevice.current) setSelectedCard(null);
};

const handleCardClick = (i: number) => {
  if (isTouchDevice.current) {
    setSelectedCard((prev) => (prev === i ? null : i));
  }
};

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCard(null);
  };

  return (
    <section className="w-full bg-[#111] py-14 overflow-hidden">
      {/* Grid layout */}
      <div className="w-full px-4">
        <div
          className="flex h-[440px]"
          style={{ gap: "8px" }}
          onMouseLeave={handleMouseLeave}
        >
          {useCases.map((uc, i) => {
            const isExpanded = selectedCard === i;
            const isHidden = isAnyActive && !isExpanded;

            return (
              <div
                key={uc.name}
                onMouseEnter={() => handleMouseEnter(i)}
                onClick={() => handleCardClick(i)}
                className="relative h-full overflow-hidden rounded-xl"
                style={{
                  flex: isHidden ? "0 0 0px" : isExpanded ? "1 1 100%" : "1 1 0%",
                  minWidth: isHidden ? "0px" : undefined,
                  opacity: isHidden ? 0 : 1,
                  cursor: "pointer",
                  zIndex: isExpanded ? 10 : 1,
                  transition:
                    "flex 0.55s cubic-bezier(0.4,0,0.2,1), min-width 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease",
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

                {/* Close button — only visible when expanded */}
                {isExpanded && (
                  <button
                    onClick={handleClose}
                    aria-label="Close expanded card"
                    className="absolute top-4 right-4 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-white/15 border border-white/25 text-white hover:bg-white/25 transition-colors"
                    style={{
                      opacity: isExpanded ? 1 : 0,
                      transition: "opacity 0.3s ease 0.3s",
                    }}
                  >
                    <X size={16} />
                  </button>
                )}

                {/* Category pill — visible when expanded */}
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
