import { Dispatch, SetStateAction, useState, useEffect } from "react";
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

const PremiumStackedCardTestimonials = ({ color = "#FFD700" }: PremiumStackedCardTestimonialsProps ) => {
  const [selected, setSelected] = useState(0);

  return (
    <section className="py-5 px-4 lg:px-8 grid items-center grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 overflow-hidden mb-4">
      <div className="p-4">
        <h3 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFC706]">What our Premium Clients Say</h3>
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFC706] my-4">
          Discover how RangaOne Wealth Premium has transformed the investment journey of our clients.
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
      />
    </section>
  );
};

const SelectBtns = ({
  numTracks,
  setSelected,
  selected,
  color,
}: { numTracks: number; setSelected: Dispatch<SetStateAction<number>>; selected: number; color: string }) => {
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
}: {
  testimonials: Testimonial[];
  selected: number;
  setSelected: Dispatch<SetStateAction<number>>;
  color: string;
}) => {
  return (
    <div className="p-4 relative h-[450px] lg:h-[500px] shadow-xl">
      {testimonials.map((t: Testimonial, i: number) => {
        return (
          <Card
            {...t}
            key={i}
            position={i}
            selected={selected}
            setSelected={setSelected}
            color={color}
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
}: Testimonial & {
  position: number;
  selected: number;
  setSelected: Dispatch<SetStateAction<number>>;
  color: string;
}) => {
  const scale = position <= selected ? 1 : 1 + 0.015 * (position - selected);
  const offset = position <= selected ? 0 : 95 + (position - selected) * 3;
  const background = position % 2 ? "#2a2a2a" : "#3a3a3a"; // Adjusted for dark theme
  const textColor = "white"; // All text white for readability on dark backgrounds

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
      className="absolute top-0 left-0 w-full min-h-full p-8 lg:p-12 cursor-pointer flex flex-col justify-between rounded-xl border border-[#7a8c3b]/10"
    >
      <Icon className="text-7xl mx-auto" style={{ color }} />
      <p className="text-lg lg:text-xl font-light italic my-8 text-gray-300">
        "{description}"
      </p>
      <div>
        <span className="block font-semibold text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFC706]">{name}</span>
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