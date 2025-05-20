"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FiMenu } from "react-icons/fi";

const NavLinks = [
  {
    title: "Home",
    href: "/",
    sublinks: [],
  },
  {
    title: "Services",
    href: "/#services",
    sublinks: [],
  },
  {
    title: "About Us",
    href: "#",
    sublinks: [],
  },
  {
    title: "Contact Us",
    href: "/#contact",
    sublinks: [],
  },
];

export const Navbar = ({ variant = "default" }) => {
  const bgColor = variant === "premium" ? "bg-[#FFB800]" : "bg-[#001633]";

  return (
    <div className="fixed w-full z-[999999] px-4 py-4">
      <div className={`${bgColor} rounded-[40px] shadow-lg`}>
        <RoundedDrawerNav
          navBackground="bg-transparent"
          bodyBackground="bg-white"
          links={NavLinks}
          variant={variant}
        />
      </div>
    </div>
  );
};

export const RoundedDrawerNav = ({
  children,
  navBackground,
  bodyBackground,
  links = NavLinks,
  variant,
}) => {
  const [hovered, setHovered] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const router = useRouter();
  const textColor = variant === "premium" ? "text-[#333333]" : "text-white";
  const buttonBg = variant === "premium" ? "bg-[#333333]" : "bg-white";
  const buttonText = variant === "premium" ? "text-white" : "text-[#001633]";

  const activeSublinks = useMemo(() => {
    if (!hovered) return [];
    const link = links.find((l) => l.title === hovered);
    return link ? link.sublinks : [];
  }, [hovered, links]);

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <>
      <nav onMouseLeave={() => setHovered(null)} className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 ${
                variant === "premium" ? "bg-[#333333]" : "bg-white"
              } rounded-full flex items-center justify-center`}
            >
              <span
                className={`${
                  variant === "premium" ? "text-white" : "text-[#001633]"
                } text-2xl font-bold`}
              >
                R
              </span>
            </div>
            <div
              className={`${textColor} font-serif text-xl font-bold tracking-wide`}
            >
              RANGAONE
              <br />
              FINWALA
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {links.map((l) => (
              <TopLink
                key={l.title}
                setHovered={setHovered}
                title={l.title}
                sublinks={l.sublinks}
              >
                <Link
                  href={l.href || "#"}
                  className={`${textColor} text-lg font-medium hover:opacity-80 transition-colors`}
                >
                  {l.title}
                </Link>
              </TopLink>
            ))}
            <button
              onClick={handleLogin}
              className={`${buttonBg} ${buttonText} text-lg font-semibold px-8 py-2 rounded-full hover:opacity-90 transition-all`}
            >
              LOGIN
            </button>
          </div>

          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className={`block text-2xl ${textColor} lg:hidden`}
          >
            <FiMenu />
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 px-6 py-4"
            >
              <div className="space-y-4">
                {activeSublinks?.map((l) => (
                  <Link
                    className={`block text-lg font-medium ${textColor} opacity-80 hover:opacity-100 transition-colors`}
                    href={l.href}
                    key={l.title}
                  >
                    {l.title}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {mobileNavOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`px-6 py-4 border-t ${
            variant === "premium" ? "border-[#333333]/10" : "border-white/10"
          } lg:hidden`}
        >
          {links.map((l) => (
            <div key={l.title} className="py-3">
              <Link
                href={l.href || "#"}
                className={`text-lg block font-medium ${textColor} hover:opacity-80`}
              >
                {l.title}
              </Link>
              {l.sublinks.map((sl) => (
                <Link
                  className={`text-md block py-2 ${textColor} opacity-70 hover:opacity-100`}
                  href={sl.href}
                  key={sl.title}
                >
                  {sl.title}
                </Link>
              ))}
            </div>
          ))}
          <button
            onClick={handleLogin}
            className={`w-full ${buttonBg} ${buttonText} text-lg font-semibold px-8 py-2 rounded-full hover:opacity-90 transition-all mt-4`}
          >
            LOGIN
          </button>
        </motion.div>
      )}
    </>
  );
};

const TopLink = ({ children, setHovered, title, sublinks }) => (
  <span
    onMouseEnter={() => {
      setHovered(sublinks.length > 0 ? title : null);
    }}
    className="cursor-pointer"
  >
    {children}
  </span>
);
