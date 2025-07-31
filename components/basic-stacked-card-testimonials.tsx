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

interface StackedCardTestimonialsProps {
  color?: string;
}

const BasicStackedCardTestimonials = ({ color = "#8193FF" }: StackedCardTestimonialsProps) => {
  const [selected, setSelected] = useState(0);

  return (
    <section className="py-24 px-4 lg:px-8 grid items-center grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 overflow-hidden bg-white">
      <div className="p-4">
        <h3 className="text-3xl font-semibold text-[#898EFF]">What our Basic Clients Say</h3>
        <p className="text-gray-600 my-5">
          Discover how RangaOne Wealth has helped beginners begin their investment journey successfully.
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
  const background = position % 2 ? "#F8FAFC" : "#F1F5F9"; // Light backgrounds for basic theme
  const textColor = "black"; // Black text for readability on light backgrounds

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
      className="absolute top-0 left-0 w-full min-h-full p-8 lg:p-12 cursor-pointer flex flex-col justify-between rounded-xl border border-purple-200"
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