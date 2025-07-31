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

const StackedCardTestimonials = () => {
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
    <section className="bg-[#FEFCEA] py-24 px-4 lg:px-8 grid items-center grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 overflow-hidden">
      <div className="p-4">
        <h3 className="text-5xl font-semibold">What our customers think</h3>
        <p className="text-slate-500 my-4">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Minus
          commodi sint, similique cupiditate possimus suscipit delectus illum
          eos iure magnam!
          {isMobile && (
            <span className="block mt-2 text-sm text-slate-600">
              💡 Swipe left or right to see more testimonials
            </span>
          )}
        </p>
        <SelectBtns
          numTracks={testimonials.length}
          setSelected={setSelected}
          selected={selected}
        />
      </div>
      <Cards
        testimonials={testimonials}
        setSelected={setSelected}
        selected={selected}
        isMobile={isMobile}
        swipeHandlers={swipeHandlers}
      />
    </section>
  );
};

const SelectBtns = ({ 
  numTracks, 
  setSelected, 
  selected 
}: { 
  numTracks: number; 
  setSelected: Dispatch<SetStateAction<number>>; 
  selected: number 
}) => {
  return (
    <div className="flex gap-1 mt-8">
      {Array.from(Array(numTracks).keys()).map((n) => {
        return (
          <button
            key={n}
            onClick={() => setSelected(n)}
            className="h-1.5 w-full bg-slate-300 relative"
          >
            {selected === n ? (
              <motion.span
                className="absolute top-0 left-0 bottom-0 bg-slate-950"
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
                className="absolute top-0 left-0 bottom-0 bg-slate-950"
                style={{
                  width: selected > n ? "100%" : "0%",
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
  isMobile,
  swipeHandlers
}: { 
  testimonials: any[]; 
  selected: number; 
  setSelected: Dispatch<SetStateAction<number>>;
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
      {testimonials.map((t, i) => {
        return (
          <Card
            {...t}
            key={i}
            position={i}
            selected={selected}
            setSelected={setSelected}
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
  isMobile,
}: { 
  Icon: IconType; 
  description: string; 
  name: string; 
  title: string; 
  position: number; 
  selected: number; 
  setSelected: Dispatch<SetStateAction<number>>;
  isMobile: boolean;
}) => {
  const scale = position <= selected ? 1 : 1 + 0.015 * (position - selected);
  const offset = position <= selected ? 0 : 95 + (position - selected) * 3;
  const background = position % 2 ? "#001633" : "#fefcea";
  const color = position % 2 ? "#fefcea" : "#001633";

  return (
    <motion.div
      initial={false}
      style={{
        zIndex: position,
        transformOrigin: "left bottom",
        background,
        color,
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
      className={`absolute top-0 left-0 w-full min-h-full p-8 lg:p-12 cursor-pointer flex flex-col justify-between ${
        isMobile ? 'select-none' : ''
      }`}
    >
      <Icon className="text-7xl mx-auto" />
      <p className="text-lg lg:text-xl font-light italic my-8">
        "{description}"
      </p>
      <div>
        <span className="block font-semibold text-lg">{name}</span>
        <span className="block text-sm">{title}</span>
      </div>
    </motion.div>
  );
};

export default StackedCardTestimonials;

const testimonials = [
  {
    Icon: SiNike,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita sequi cupiditate harum repellendus ipsum dignissimos? Officiis ipsam dolorum magnam assumenda.",
    name: "Jane Dodson",
    title: "Marketing Director, Nike",
  },
  {
    Icon: SiAtlassian,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita sequi cupiditate harum repellendus ipsum dignissimos? Officiis ipsam dolorum magnam assumenda.",
    name: "Johnathan Rodriguez",
    title: "UX Research, Atlassian",
  },
  {
    Icon: SiDribbble,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita sequi cupiditate harum repellendus ipsum dignissimos? Officiis ipsam dolorum magnam assumenda.",
    name: "Phil Heath",
    title: "Staff Engineer, Dribbble",
  },
  {
    Icon: SiGrubhub,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita sequi cupiditate harum repellendus ipsum dignissimos? Officiis ipsam dolorum magnam assumenda.",
    name: "Andrea Beck",
    title: "Marketing Manager, GrubHub",
  },
  {
    Icon: SiKaggle,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita sequi cupiditate harum repellendus ipsum dignissimos? Officiis ipsam dolorum magnam assumenda.",
    name: "Daniel Henderson",
    title: "Engineering Manager, Kaggle",
  },
  {
    Icon: SiSlack,
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita sequi cupiditate harum repellendus ipsum dignissimos? Officiis ipsam dolorum magnam assumenda.",
    name: "Anderson Lima",
    title: "Product Manager, Slack",
  },
];
