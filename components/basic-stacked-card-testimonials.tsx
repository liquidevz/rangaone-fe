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

interface StackedCardTestimonialsProps {
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

const BasicStackedCardTestimonials = ({ color = "#8193FF" }: StackedCardTestimonialsProps) => {
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
    <section className="py-24 px-4 lg:px-8 grid items-center grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 overflow-hidden bg-white">
      <div className="p-4">
        <h3 className="text-3xl font-semibold text-[#898EFF]">What our Basic Clients Say</h3>
        <p className="text-gray-600 my-5">
          Discover how RangaOne Wealth has helped beginners begin their investment journey successfully.
          {isMobile && (
            <span className="block mt-2 text-sm text-gray-500">
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
            className="h-1.5 w-full bg-gray-300 relative"
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
                  duration: 5,
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
  const background = position % 2 ? "#F8FAFC" : "#F1F5F9";
  const textColor = "black";

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
      onClick={() => setSelected(position)}
      className={`absolute top-0 left-0 w-full min-h-full p-8 lg:p-12 cursor-pointer flex flex-col justify-between rounded-xl border border-purple-200 ${
        isMobile ? 'select-none' : ''
      }`}
    >
      <Icon className="text-7xl mx-auto" style={{ color }} />
      <p className="text-lg lg:text-xl font-light italic my-8 text-gray-700">
        "{description}"
      </p>
      <div>
        <span className="block font-semibold text-lg text-black">{name}</span>
        <span className="block text-sm text-gray-600">{title}</span>
      </div>
    </motion.div>
  );
};

export default BasicStackedCardTestimonials;

const testimonials: Testimonial[] = [
  {
    Icon: SiNike,
    description:
      "RangaOne Basic helped me start my investment journey with confidence. The quality stocks and clear guidance made all the difference.",
    name: "Amit K.",
    title: "Beginner Investor, Nike",
  },
  {
    Icon: SiAtlassian,
    description:
      "Perfect for beginners! The market updates and timely alerts have helped me understand the market better and make informed decisions.",
    name: "Neha R.",
    title: "New Investor, Atlassian",
  },
  {
    Icon: SiDribbble,
    description:
      "The 10-15 quality stocks recommendation was exactly what I needed to start building my portfolio. Great value for money!",
    name: "Sanjay M.",
    title: "Small Business Owner, Dribbble",
  },
  {
    Icon: SiGrubhub,
    description:
      "As a beginner, I was overwhelmed by the stock market. RangaOne Basic simplified everything and gave me a clear path to start investing.",
    name: "Priya S.",
    title: "Software Engineer, GrubHub",
  },
  {
    Icon: SiKaggle,
    description:
      "The 5 swing trades each month are perfect for learning short-term trading. The risk management guidance is invaluable.",
    name: "Rahul D.",
    title: "Data Scientist, Kaggle",
  },
  {
    Icon: SiSlack,
    description:
      "Started with Basic and I'm already seeing good returns. The educational content and market insights are excellent for beginners.",
    name: "Anjali V.",
    title: "Product Manager, Slack",
  },
];
