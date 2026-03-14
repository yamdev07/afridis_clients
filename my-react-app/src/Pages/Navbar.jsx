import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Zap } from "lucide-react";
import Button from "../components/ui/Button";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (path, hash = "") => {
    setMobileMenuOpen(false);
    if (location.pathname === path) {
      if (hash) {
        const id = hash.replace("#", "");
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(path);
      if (hash) {
        setTimeout(() => {
          const id = hash.replace("#", "");
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  };

  const navLinks = [
    { name: "Accueil", path: "/", hash: "" },
    { name: "Fonctionnalités", path: "/", hash: "#features" },
    { name: "Tarifs", path: "/", hash: "#cta" },
    { name: "FAQ", path: "/faq", hash: "" },
    { name: "Contact", path: "/contact", hash: "" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 font-inter ${isScrolled ? "py-4" : "py-8"
      }`}>
      <div className="container mx-auto px-6">
        <div className={`
          flex items-center justify-between px-8 py-4 rounded-[22px] transition-all duration-700
          ${isScrolled
            ? "bg-white/80 shadow-premium backdrop-blur-xl border border-white/20"
            : "bg-transparent border-transparent"
          }
        `}>
          {/* Logo */}
          <div
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => handleNavClick("/")}
          >
            <div className="h-12 w-12 rounded-radius-card bg-primary flex items-center justify-center text-white font-black shadow-xl shadow-primary/20 group-hover:rotate-6 transition-all duration-500">
              <Zap size={24} fill="currentColor" />
            </div>
            <span className="text-2xl font-black tracking-tight text-text-main-light">
              ClientFlow
            </span>
          </div>

          {/* Desktop Links */}
          <ul className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <li key={link.name}>
                <button
                  onClick={() => handleNavClick(link.path, link.hash)}
                  className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted-light hover:text-primary transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-1 bg-primary rounded-full transition-all duration-500 group-hover:w-full" />
                </button>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => navigate("/login")}
              className="text-[11px] font-black uppercase tracking-widest text-text-muted-light hover:text-primary transition-colors"
            >
              Se Connecter
            </button>
            <Button
              onClick={() => navigate("/login")}
              variant="primary"
              className="!py-3 !px-8 shadow-primary/30"
              icon={ArrowRight}
            >
              Démarrer
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-3 bg-slate-900/5 rounded-xl text-text-main-light transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 right-0 mx-6 mt-4 bg-white rounded-[32px] shadow-2xl border border-white/10 overflow-hidden z-[110]"
          >
            <div className="p-10 space-y-8 text-center">
              <ul className="space-y-6">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => handleNavClick(link.path, link.hash)}
                      className="text-lg font-black uppercase tracking-widest text-text-main-light hover:text-primary transition-colors"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="pt-8 border-t border-border-light flex flex-col gap-4">
                <Button onClick={() => navigate("/login")} variant="secondary" className="w-full !py-5">
                  Se Connecter
                </Button>
                <Button onClick={() => navigate("/login")} variant="primary" className="w-full !py-5">
                  Essai Gratuit
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

