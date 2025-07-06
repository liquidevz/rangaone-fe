// components/navbar.tsx
"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FiMenu, FiUser, FiLogOut, FiSettings, FiShoppingCart, FiX } from "react-icons/fi";
import { useAuth } from "./auth/auth-context";
import { useCart } from "./cart/cart-context";

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

interface NavLink {
  title: string;
  href: string;
  sublinks: never[];
}

interface NavbarProps {
  variant?: 'default' | 'premium';
}

interface RoundedDrawerNavProps {
  navBackground?: string;
  bodyBackground?: string;
  links?: NavLink[];
  variant?: 'default' | 'premium';
}

export const Navbar = ({ variant = "default" }: NavbarProps) => {
  const bgColor = variant === "premium" ? "bg-[#FFB800]" : "bg-[#001633]";

  return (
    <div className="fixed w-full z-50 px-4 py-4">
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
  navBackground,
  bodyBackground,
  links = NavLinks,
  variant = "default",
}: RoundedDrawerNavProps) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { cartItemCount } = useCart();
  
  const textColor = variant === "premium" ? "text-[#333333]" : "text-white";
  const buttonBg = variant === "premium" ? "bg-[#333333]" : "bg-white";
  const buttonText = variant === "premium" ? "text-white" : "text-[#001633]";
  const mobileMenuBg = variant === "premium" ? "bg-[#FFB800]" : "bg-[#001633]";

  const handleLogin = () => {
    router.push("/login");
    setMobileNavOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      setMobileNavOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDashboard = () => {
    router.push("/dashboard");
    setUserMenuOpen(false);
    setMobileNavOpen(false);
  };

  const handleSettings = () => {
    router.push("/settings");
    setUserMenuOpen(false);
    setMobileNavOpen(false);
  };

  const handleCartClick = () => {
    router.push("/cart");
    setMobileNavOpen(false);
  };

  return (
    <>
      <nav className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
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
            <Link href="/" className={`${textColor} font-serif text-xl font-bold tracking-wide`}>
              RANGAONE <br /> FINWALA
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className={`${textColor} hover:opacity-75 transition-opacity cursor-pointer`}
              >
                {link.title}
              </Link>
            ))}
          </div>

          {/* Authentication & Cart Section */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            {isAuthenticated && (
              <button
                onClick={handleCartClick}
                className={`relative ${buttonBg} ${buttonText} p-2 rounded-full transition-all hover:scale-105`}
              >
                <FiShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  /* Authenticated User Menu */
                  <div className="relative hidden md:block">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className={`${buttonBg} ${buttonText} px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 hover:scale-105`}
                    >
                      <FiUser className="w-4 h-4" />
                      <span>Hi, {user.username}</span>
                    </button>

                    {/* User Dropdown Menu */}
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className={`absolute right-0 mt-2 w-48 ${
                            variant === "premium" ? "bg-white" : "bg-[#001633]"
                          } rounded-lg shadow-lg border ${
                            variant === "premium" 
                              ? "border-gray-200 text-gray-800" 
                              : "border-gray-700 text-white"
                          } overflow-hidden`}
                        >
                          <div className="py-2">
                            <div className={`px-4 py-2 text-sm border-b ${
                              variant === "premium" 
                                ? "border-gray-200 text-gray-600" 
                                : "border-gray-700 text-gray-300"
                            }`}>
                              {user.email}
                            </div>
                            
                            <button
                              onClick={handleDashboard}
                              className={`w-full px-4 py-2 text-left text-sm hover:${
                                variant === "premium" ? "bg-gray-100" : "bg-gray-700"
                              } transition-colors flex items-center gap-2`}
                            >
                              <FiUser className="w-4 h-4" />
                              View Dashboard
                            </button>
                            
                            <button
                              onClick={handleSettings}
                              className={`w-full px-4 py-2 text-left text-sm hover:${
                                variant === "premium" ? "bg-gray-100" : "bg-gray-700"
                              } transition-colors flex items-center gap-2`}
                            >
                              <FiSettings className="w-4 h-4" />
                              Settings
                            </button>
                            
                            <button
                              onClick={handleLogout}
                              className={`w-full px-4 py-2 text-left text-sm hover:${
                                variant === "premium" ? "bg-red-50 text-red-600" : "bg-red-900 text-red-400"
                              } transition-colors flex items-center gap-2`}
                            >
                              <FiLogOut className="w-4 h-4" />
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  /* Login Button for Non-authenticated Users */
                  <button
                    onClick={handleLogin}
                    className={`hidden md:block ${buttonBg} ${buttonText} px-6 py-2 rounded-full font-medium transition-all hover:scale-105`}
                  >
                    Login
                  </button>
                )}
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className={`md:hidden ${textColor} hover:opacity-75 transition-opacity`}
            >
              {mobileNavOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden ${mobileMenuBg} rounded-b-[40px] overflow-hidden`}
          >
            <div className="px-6 py-4 space-y-4">
              {/* Mobile Navigation Links */}
              {links.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`block ${textColor} text-lg font-medium hover:opacity-75 transition-opacity`}
                >
                  {link.title}
                </Link>
              ))}

              {/* Mobile User Menu */}
              {isAuthenticated && user ? (
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className={`${textColor} text-sm`}>
                    Hi, {user.username}
                  </div>
                  <button
                    onClick={handleDashboard}
                    className={`block w-full text-left ${textColor} hover:opacity-75 transition-opacity`}
                  >
                    View Dashboard
                  </button>
                  <button
                    onClick={handleSettings}
                    className={`block w-full text-left ${textColor} hover:opacity-75 transition-opacity`}
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-red-400 hover:text-red-300 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className={`block w-full ${buttonBg} ${buttonText} text-center px-6 py-2 rounded-full font-medium transition-all hover:opacity-90`}
                >
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};