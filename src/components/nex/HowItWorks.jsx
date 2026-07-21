import React from "react";
import { motion } from "framer-motion";
import { UserPlus, BellRing, Radar } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Join the list",
    desc: "Enter your email + ZIP to claim your spot",
  },
  {
    icon: BellRing,
    title: "Get approved",
    desc: "We text you when NEX2 launches nearby",
  },
  {
    icon: Radar,
    title: "Start meeting",
    desc: "Discover people nearby who share your interests",
  },
];

export default function HowItWorks() {
  return (
    <div className="space-y-3">
      <p className="text-center text-[10px] font-cyber text-blue-400/40 tracking-widest uppercase">
        How it works
      </p>
      <div className="space-y-2.5">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.12, duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl cyber-frame flex items-center justify-center">
                <step.icon className="w-4 h-4 text-blue-300" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full gradient-blue text-white text-[9px] font-bold flex items-center justify-center">
                {i + 1}
              </span>
            </div>
            <div>
              <p className="text-white text-sm font-medium leading-tight">{step.title}</p>
              <p className="text-blue-200/40 text-xs leading-tight mt-0.5">{step.desc}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="ml-auto w-px h-6 bg-blue-500/10 hidden" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}