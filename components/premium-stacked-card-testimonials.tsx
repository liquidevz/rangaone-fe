import { Dispatch, SetStateAction, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { IconType } from "react-icons";
import {
  SiAtlassian,
  SiDribbble,
  SiGrubhub,
  SiKaggle,
  SiSlack,
  SiNike,
} from "react-icons/si";

interface Testimonial {
  Icon: IconType;
  description: string;
  name: string;
  title: string;
}

interface PremiumStackedCardTestimonialsProps {
  color?: string;
}

// Custom hook for detecting mobile devices
const useIsMobile = (breakpoint: number = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, [breakpoint]);

  return isMobile;
};

// Custom hook for swipe detection
const useSwipe = (
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  minSwipeDistance: number = 50
) => {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchEndY.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current || !touchStartY.current || !touchEndY.current) return;
    
    const distanceX = touchStartX.current - touchEndX.current;
    const distanceY = touchStartY.current - touchEndY.current;
    
    // Only trigger swipe if horizontal movement is greater than vertical movement
    // This prevents accidental swipes when user is trying to scroll
    if (Math.abs(distanceX) <= Math.abs(distanceY)) return;
    
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    
    if (isLeftSwipe) {
      onSwipeLeft();
    } else if (isRightSwipe) {
      onSwipeRight();
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};

const PremiumStackedCardTestimonials = ({ color = "#FFD700" }: PremiumStackedCardTestimonialsProps) => {
  const [selected, setSelected] = useState(0);
  const isMobile = useIsMobile(768); // Consider mobile if screen width < 768px

  // Swipe handlers for mobile
  const handleSwipeLeft = () => {
    setSelected(prev => prev === testimonials.length - 1 ? 0 : prev + 1);
  };

  const handleSwipeRight = () => {
    setSelected(prev => prev === 0 ? testimonials.length - 1 : prev - 1);
  };

  const swipeHandlers = useSwipe(handleSwipeLeft, handleSwipeRight, 50);

  return (
    <section className="py-5 px-4 lg:px-8 grid items-center grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 overflow-hidden mb-4">
      <div className="p-4">
        <h3 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFC706]">
          What our Premium Clients Say
        </h3>
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFC706] my-4">
          Discover how RangaOne Wealth Premium has transformed the investment journey of our clients.
          {isMobile && (
            <span className="block mt-2 text-sm text-yellow-400">
              💡 Swipe left or right to see more testimonials
            </span>
          )}
        </p>
        <SelectBtns
          numTracks={testimonials.length}
          setSelected={setSelected}
          selected={selected}
          color={color}
        />
      </div>
      <Cards
        testimonials={testimonials}
        setSelected={setSelected}
        selected={selected}
        color={color}
        isMobile={isMobile}
        swipeHandlers={swipeHandlers}
      />
    </section>
  );
};

const SelectBtns = ({
  numTracks,
  setSelected,
  selected,
  color,
}: { 
  numTracks: number; 
  setSelected: Dispatch<SetStateAction<number>>; 
  selected: number; 
  color: string 
}) => {
  return (
    <div className="flex gap-1 mt-8">
      {Array.from(Array(numTracks).keys()).map((n) => {
        return (
          <button
            key={n}
            onClick={() => setSelected(n)}
            className="h-1.5 w-full bg-gray-700 relative"
          >
            {selected === n ? (
              <motion.span
                className="absolute top-0 left-0 bottom-0"
                style={{ backgroundColor: color }}
                initial={{
                  width: "0%",
                }}
                animate={{
                  width: "100%",
                }}
                transition={{
                  duration: 10,
                }}
                onAnimationComplete={() => {
                  setSelected(selected === numTracks - 1 ? 0 : selected + 1);
                }}
              />
            ) : (
              <span
                className="absolute top-0 left-0 bottom-0"
                style={{
                  width: selected > n ? "100%" : "0%",
                  backgroundColor: color,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

const Cards = ({
  testimonials,
  selected,
  setSelected,
  color,
  isMobile,
  swipeHandlers,
}: {
  testimonials: Testimonial[];
  selected: number;
  setSelected: Dispatch<SetStateAction<number>>;
  color: string;
  isMobile: boolean;
  swipeHandlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
}) => {
  return (
    <div 
      className="p-4 relative h-[450px] lg:h-[500px] shadow-xl"
      // Only add touch handlers on mobile
      {...(isMobile ? swipeHandlers : {})}
      style={{
        // Improve touch responsiveness on mobile
        ...(isMobile && {
          touchAction: 'pan-y', // Allow vertical scrolling but handle horizontal gestures
          userSelect: 'none', // Prevent text selection during swipe
        })
      }}
    >
      {testimonials.map((t: Testimonial, i: number) => {
        return (
          <Card
            {...t}
            key={i}
            position={i}
            selected={selected}
            setSelected={setSelected}
            color={color}
            isMobile={isMobile}
          />
        );
      })}
    </div>
  );
};

const Card = ({
  Icon,
  description,
  name,
  title,
  position,
  selected,
  setSelected,
  color,
  isMobile,
}: Testimonial & {
  position: number;
  selected: number;
  setSelected: Dispatch<SetStateAction<number>>;
  color: string;
  isMobile: boolean;
}) => {
  const scale = position <= selected ? 1 : 1 + 0.015 * (position - selected);
  const offset = position <= selected ? 0 : 95 + (position - selected) * 3;
  const background = position % 2 ? "#2a2a2a" : "#3a3a3a"; // Adjusted for dark theme
  const textColor = "white"; // All text white for readability on dark backgrounds

  const handleCardClick = () => {
    // Advance to next testimonial instead of jumping to clicked position
    setSelected(selected === testimonials.length - 1 ? 0 : selected + 1);
  };

  return (
    <motion.div
      initial={false}
      style={{
        zIndex: position,
        transformOrigin: "left bottom",
        background,
        color: textColor,
      }}
      animate={{
        x: `${offset}%`,
        scale,
      }}
      whileHover={{
        translateX: position === selected ? 0 : -3,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      onClick={handleCardClick}
      className={`absolute top-0 left-0 w-full min-h-full p-8 lg:p-12 cursor-pointer flex flex-col justify-between rounded-xl border border-[#7a8c3b]/10 ${
        isMobile ? 'select-none' : ''
      }`}
    >
      <Icon className="text-7xl mx-auto" style={{ color }} />
      <p className="text-lg lg:text-xl font-light italic my-8 text-gray-300">
        "{description}"
      </p>
      <div>
        <span className="block font-semibold text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFC706]">
          {name}
        </span>
        <span className="block text-sm text-gray-400">{title}</span>
      </div>
    </motion.div>
  );
};

export default PremiumStackedCardTestimonials;

const testimonials: Testimonial[] = [
  {
    Icon: SiNike,
    description:
      "The exclusive model portfolios have been a game-changer for my long-term investment strategy. The returns have been exceptional.",
    name: "Amit K.",
    title: "Investment Banker, Nike",
  },
  {
    Icon: SiAtlassian,
    description:
      "The IPO recommendations have helped me get in on the ground floor of some incredible companies. The analysis is thorough and spot-on.",
    name: "Neha R.",
    title: "Financial Advisor, Atlassian",
  },
  {
    Icon: SiDribbble,
    description:
      "The direct access to analysts has been invaluable during market volatility. Their guidance has helped me navigate uncertain times with confidence.",
    name: "Sanjay M.",
    title: "Business Owner, Dribbble",
  },
  {
    Icon: SiGrubhub,
    description:
      "RangaOne Wealth has truly transformed my investment approach. Their insights are unparalleled, and I've seen remarkable growth in my portfolio since joining.",
    name: "Priya S.",
    title: "Software Engineer, GrubHub",
  },
  {
    Icon: SiKaggle,
    description:
      "I appreciate the clear, actionable recommendations. It's like having a personal financial advisor guiding me every step of the way.",
    name: "Rahul D.",
    title: "Data Scientist, Kaggle",
  },
  {
    Icon: SiSlack,
    description:
      "The live webinars are fantastic! It's an incredible opportunity to learn directly from experts and get real-time answers to my questions.",
    name: "Anjali V.",
    title: "Product Manager, Slack",
  },
];
