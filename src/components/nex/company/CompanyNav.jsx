import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "@/components/nex/Logo";

export default function CompanyNav() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: "Company", href: "/company" },
    { label: "Careers", href: "/company#careers" },
    { label: "Contact", href: "/company#contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div
        className={`transition-all duration-500 ${
          scrolled
            ? "glass-strong border-b border-white/5"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-cyber uppercase tracking-wider text-white/50 hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/welcome"
              className="text-sm font-cyber font-medium uppercase tracking-wider px-6 py-2.5 rounded-full neon-btn text-white"
            >
              Join Waitlist
            </Link>
          </nav>

          <button
            className="md:hidden text-white/80"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden glass-strong border-b border-white/5"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-cyber uppercase tracking-wider text-white/70 hover:text-white transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <Link
                to="/welcome"
                className="text-sm font-cyber font-medium uppercase tracking-wider px-5 py-2.5 rounded-full neon-btn text-white text-center"
              >
                Join Waitlist
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}