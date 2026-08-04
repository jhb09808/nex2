import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MapPin, Users, Sparkles, Heart, Mail, Globe, Instagram, Linkedin,
  ArrowRight, Zap,
} from "lucide-react";
import CompanyNav from "@/components/nex/company/CompanyNav";
import CompanyFooter from "@/components/nex/company/CompanyFooter";
import CompanyBackground from "@/components/nex/company/CompanyBackground";
import Logo from "@/components/nex/Logo";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const FEATURES = [
  {
    icon: MapPin,
    title: "Real-World Discovery",
    desc: "Meet people based on who is actually nearby.",
    color: "#60A5FA",
  },
  {
    icon: Users,
    title: "Privacy Focused",
    desc: "Built with privacy and intentional interactions at its core.",
    color: "#A78BFA",
  },
  {
    icon: Sparkles,
    title: "Meaningful Connections",
    desc: "Designed to create authentic conversations rather than endless content consumption.",
    color: "#22D3EE",
  },
  {
    icon: Heart,
    title: "Community First",
    desc: "Helping strengthen local communities through genuine human connection.",
    color: "#34D399",
  },
];

const COMPANY_INFO = [
  { label: "Company Name", value: "NEX2" },
  { label: "Industry", value: "Technology" },
  { label: "Category", value: "Social Networking Platform" },
  { label: "Company Type", value: "Private" },
  { label: "Stage", value: "Waitlist" },
  { label: "Headquarters", value: "Miami, Florida" },
  { label: "Website", value: "nex2.app" },
  { label: "Business Email", value: "support@nex2.app" },
];

const OPENINGS = [
  "Web Developer Intern",
  "UI/UX Design Intern",
  "Marketing Intern",
];

function SectionLabel({ children }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 mb-6"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 ai-dot" />
      <span className="text-xs font-cyber uppercase tracking-[0.25em] text-blue-300">
        {children}
      </span>
    </motion.div>
  );
}

export default function Company() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <CompanyBackground />
      <div className="relative z-10">
        <CompanyNav />

        {/* Hero */}
        <section className="relative min-h-screen flex items-center justify-center pt-16 px-6">
          {/* Animated radar ring behind hero */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute rounded-full border border-blue-500/10"
                style={{
                  width: `${200 + i * 180}px`,
                  height: `${200 + i * 180}px`,
                  left: `${-(100 + i * 90)}px`,
                  top: `${-(100 + i * 90)}px`,
                  animation: `nex-center-pulse ${4 + i * 0.5}s ease-out ${i * 0.5}s infinite`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center mb-10"
            >
              <div className="relative">
                <div className="absolute inset-0 blur-2xl bg-blue-500/20 rounded-full" style={{ transform: "scale(1.5)" }} />
                <Logo size="lg" />
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-8"
            >
              <Zap size={12} className="text-blue-400" />
              <span className="text-xs font-cyber uppercase tracking-[0.2em] text-white/60">
                Now in Development
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              initial="hidden"
              animate="visible"
              className="text-4xl md:text-6xl lg:text-7xl font-cyber font-bold tracking-tight leading-[1.1]"
            >
              Building the future of<br />
              <span className="holo-text">real-world networking.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              initial="hidden"
              animate="visible"
              className="mt-8 text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto font-light"
            >
              NEX2 is building a new way for people to discover meaningful connections
              nearby through intentional, real-world interactions.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              initial="hidden"
              animate="visible"
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full neon-btn font-cyber font-medium text-sm uppercase tracking-wider text-white"
              >
                Join the Waitlist
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/15 text-white font-cyber font-medium text-sm uppercase tracking-wider hover:border-blue-400/40 hover:bg-blue-500/5 transition-all"
              >
                Contact Us
              </a>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-1.5">
              <div className="w-1 h-2 rounded-full bg-blue-400" style={{ animation: "float-y 2s ease-in-out infinite" }} />
            </div>
          </motion.div>
        </section>

        {/* About */}
        <section className="py-24 md:py-40 px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <SectionLabel>About NEX2</SectionLabel>
            <motion.p
              variants={fadeUp}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-2xl md:text-4xl font-cyber font-light leading-[1.4] text-white/90"
            >
              NEX2 is a technology company focused on improving how people connect in
              the real world.
            </motion.p>
            <motion.p
              variants={fadeUp}
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-10 text-lg text-white/50 leading-relaxed"
            >
              While today's social platforms are built around feeds, endless scrolling,
              and digital engagement, NEX2 is designed to encourage authentic, in-person
              interactions through proximity and shared interests.
            </motion.p>
            <motion.p
              variants={fadeUp}
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-6 text-lg text-white/50 leading-relaxed"
            >
              Our goal is to create technology that strengthens real communities
              instead of replacing them.
            </motion.p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-24 md:py-40 px-6 relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.06) 0%, transparent 70%)",
            }}
          />
          <div className="relative max-w-4xl mx-auto text-center">
            <SectionLabel>Our Mission</SectionLabel>
            <motion.p
              variants={fadeUp}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-3xl md:text-6xl font-cyber font-bold tracking-tight leading-[1.15]"
            >
              Helping people reconnect with<br />
              <span className="gradient-text">the world around them.</span>
            </motion.p>
            <motion.p
              variants={fadeUp}
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-10 text-lg text-white/50 leading-relaxed max-w-2xl mx-auto"
            >
              We believe technology should encourage genuine human interaction,
              meaningful relationships, and stronger local communities.
            </motion.p>
          </div>
        </section>

        {/* What Makes NEX2 Different */}
        <section className="py-24 md:py-40 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <SectionLabel>Differentiators</SectionLabel>
              <motion.h2
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-cyber font-bold tracking-tight"
              >
                What Makes NEX2 Different
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="ai-card ai-border rounded-2xl p-8 group relative"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all group-hover:scale-110"
                    style={{
                      background: `${f.color}15`,
                      boxShadow: `0 0 20px ${f.color}20`,
                    }}
                  >
                    <f.icon size={24} style={{ color: f.color }} />
                  </div>
                  <h3 className="text-lg font-cyber font-medium mb-3 tracking-wide">{f.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className="py-24 md:py-40 px-6 relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.05) 0%, transparent 70%)",
            }}
          />
          <div className="relative max-w-3xl mx-auto text-center">
            <SectionLabel>Our Vision</SectionLabel>
            <motion.h3
              variants={fadeUp}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-3xl md:text-6xl font-cyber font-bold tracking-tight leading-[1.15] mb-10"
            >
              The Future of <span className="holo-text">Networking</span>
            </motion.h3>
            <motion.p
              variants={fadeUp}
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-lg text-white/50 leading-relaxed"
            >
              We envision a world where discovering new friendships, collaborators,
              business relationships, and communities happens naturally through
              thoughtful technology that brings people together instead of pulling
              them apart.
            </motion.p>
          </div>
        </section>

        {/* Company Information */}
        <section className="py-24 md:py-40 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-20">
              <SectionLabel>Company</SectionLabel>
              <motion.h2
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-cyber font-bold tracking-tight"
              >
                Company Information
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COMPANY_INFO.map((item, i) => (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="ai-card rounded-xl p-6 group hover:border-blue-400/20 transition-all"
                >
                  <p className="text-xs font-cyber uppercase tracking-[0.15em] text-blue-400/70 mb-2">
                    {item.label}
                  </p>
                  <p className="text-lg font-medium text-white/90">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Careers */}
        <section id="careers" className="py-24 md:py-40 px-6 relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 70%)",
            }}
          />
          <div className="relative max-w-3xl mx-auto text-center">
            <SectionLabel>Careers</SectionLabel>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-cyber font-bold tracking-tight mb-6"
            >
              Join Our Team
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-lg text-white/50 leading-relaxed mb-14"
            >
              As we continue building NEX2, we're looking for talented individuals who
              are excited about shaping the future of real-world networking.
            </motion.p>

            <div className="space-y-3 mb-14 text-left max-w-md mx-auto">
              {OPENINGS.map((role, i) => (
                <motion.a
                  href="mailto:support@nex2.app"
                  key={role}
                  variants={fadeUp}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  whileHover={{ x: 8 }}
                  className="flex items-center justify-between p-5 rounded-xl ai-card group cursor-pointer"
                >
                  <span className="text-sm text-white/80 font-medium">{role}</span>
                  <ArrowRight size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
                </motion.a>
              ))}
            </div>

            <a
              href="mailto:support@nex2.app"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full neon-btn font-cyber font-medium text-sm uppercase tracking-wider text-white"
            >
              View Open Positions
            </a>
          </div>
        </section>

        {/* Press & Media */}
        <section className="py-24 md:py-40 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <SectionLabel>Press</SectionLabel>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-cyber font-bold tracking-tight mb-6"
            >
              Media &amp; Partnerships
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-lg text-white/50 leading-relaxed mb-10"
            >
              For media inquiries, partnership opportunities, business development, or
              general questions, please contact us.
            </motion.p>
            <a
              href="mailto:support@nex2.app"
              className="inline-flex items-center gap-2 text-xl font-cyber font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Mail size={20} />
              support@nex2.app
            </a>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-24 md:py-40 px-6 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <SectionLabel>Contact</SectionLabel>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-cyber font-bold tracking-tight mb-14"
            >
              Get in Touch
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              <a
                href="mailto:support@nex2.app"
                className="flex flex-col items-center gap-3 p-8 rounded-2xl ai-card group hover:border-blue-400/20 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail size={20} className="text-blue-400" />
                </div>
                <span className="text-xs font-cyber uppercase tracking-[0.15em] text-white/40">Email</span>
                <span className="text-sm text-white/80">support@nex2.app</span>
              </a>
              <a
                href="https://nex2.app"
                className="flex flex-col items-center gap-3 p-8 rounded-2xl ai-card group hover:border-blue-400/20 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe size={20} className="text-blue-400" />
                </div>
                <span className="text-xs font-cyber uppercase tracking-[0.15em] text-white/40">Website</span>
                <span className="text-sm text-white/80">nex2.app</span>
              </a>
              <a
                href="https://instagram.com/nex2inc"
                className="flex flex-col items-center gap-3 p-8 rounded-2xl ai-card group hover:border-blue-400/20 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Instagram size={20} className="text-blue-400" />
                </div>
                <span className="text-xs font-cyber uppercase tracking-[0.15em] text-white/40">Instagram</span>
                <span className="text-sm text-white/80">@nex2inc</span>
              </a>
              <div className="flex flex-col items-center gap-3 p-8 rounded-2xl border border-white/5 bg-white/[0.01]">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <Linkedin size={20} className="text-white/30" />
                </div>
                <span className="text-xs font-cyber uppercase tracking-[0.15em] text-white/40">LinkedIn</span>
                <span className="text-sm text-white/30">Coming soon</span>
              </div>
            </div>
          </div>
        </section>

        <CompanyFooter />
      </div>
    </div>
  );
}