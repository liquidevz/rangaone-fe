// components/navbar.tsx
"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FiMenu, FiUser, FiLogOut, FiSettings, FiShoppingCart } from "react-icons/fi";
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { cartItemCount } = useCart();
  
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

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDashboard = () => {
    router.push("/dashboard");
    setUserMenuOpen(false);
  };

  const handleSettings = () => {
    router.push("/settings");
    setUserMenuOpen(false);
  };

  const handleCartClick = () => {
    router.push("/cart");
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
                onMouseEnter={() => setHovered(link.title)}
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
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className={`${buttonBg} ${buttonText} px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 hover:scale-105`}
                    >
                      <FiUser className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        Hi, {user.username}
                      </span>
                      <span className="sm:hidden">Menu</span>
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
                    className={`${buttonBg} ${buttonText} px-6 py-2 rounded-full font-medium transition-all hover:scale-105`}
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
              <FiMenu size={24} />
            </button>
          </div>
        </div>

        {/* Sublinks */}
        <AnimatePresence>
          {activeSublinks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/20"
            >
              <div className="flex flex-wrap gap-4">
                {activeSublinks.map((sublink, index) => (
                  <Link
                    key={index}
                    href={sublink.href}
                    className={`${textColor} text-sm hover:opacity-75 transition-opacity`}
                  >
                    {sublink.title}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden ${bodyBackground} border-t`}
          >
            <div className="px-6 py-4 space-y-4">
              {links.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="block text-gray-800 hover:text-blue-600 transition-colors"
                >
                  {link.title}
                </Link>
              ))}
              
              {/* Mobile Cart Link */}
              {isAuthenticated && (
                <Link
                  href="/cart"
                  onClick={() => setMobileNavOpen(false)}
                  className="block text-gray-800 hover:text-blue-600 transition-colors flex items-center gap-2"
                >
                  <FiShoppingCart className="w-4 h-4" />
                  Cart ({cartItemCount})
                </Link>
              )}
              
              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      Hi, {user.username}
                    </div>
                    <button
                      onClick={handleDashboard}
                      className="block w-full text-left py-2 text-gray-800 hover:text-blue-600 transition-colors"
                    >
                      View Dashboard
                    </button>
                    <button
                      onClick={handleSettings}
                      className="block w-full text-left py-2 text-gray-800 hover:text-blue-600 transition-colors"
                    >
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left py-2 text-red-600 hover:text-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="block w-full text-left py-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </>
  );
};