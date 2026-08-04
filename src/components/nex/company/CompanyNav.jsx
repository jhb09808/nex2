import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "@/components/nex/Logo";

export default function CompanyNav() {
  const [open, setOpen] = React.useState(false);

  const links = [
    { label: "Company", href: "/company" },
    { label: "Careers", href: "/company#careers" },
    { label: "Contact", href: "/company#contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-strong border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/"
              className="text-sm font-medium px-5 py-2 rounded-full bg-white text-black hover:bg-white/90 transition-colors"
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

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass-strong border-b border-white/5"
        >
          <div className="px-6 py-4 flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/"
              className="text-sm font-medium px-5 py-2.5 rounded-full bg-white text-black text-center"
            >
              Join Waitlist
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}