import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MapPin, Users, Sparkles, Heart, Mail, Globe, Instagram, Linkedin,
  ArrowRight,
} from "lucide-react";
import CompanyNav from "@/components/nex/company/CompanyNav";
import CompanyFooter from "@/components/nex/company/CompanyFooter";
import Logo from "@/components/nex/Logo";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const FEATURES = [
  {
    icon: MapPin,
    title: "Real-World Discovery",
    desc: "Meet people based on who is actually nearby.",
  },
  {
    icon: Users,
    title: "Privacy Focused",
    desc: "Built with privacy and intentional interactions at its core.",
  },
  {
    icon: Sparkles,
    title: "Meaningful Connections",
    desc: "Designed to create authentic conversations rather than endless content consumption.",
  },
  {
    icon: Heart,
    title: "Community First",
    desc: "Helping strengthen local communities through genuine human connection.",
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

export default function Company() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <CompanyNav />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, rgba(59,130,246,0.08) 0%, transparent 60%)",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center mb-8"
          >
            <Logo size="lg" />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-4xl md:text-6xl font-heading font-semibold tracking-tight leading-tight"
          >
            Building the future of<br />real-world networking.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="visible"
            className="mt-6 text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto"
          >
            NEX2 is building a new way for people to discover meaningful connections
            nearby through intentional, real-world interactions.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="visible"
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90 transition-all"
            >
              Join the Waitlist
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/15 text-white font-medium text-sm hover:border-white/30 transition-colors"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-sm font-cyber uppercase tracking-[0.2em] text-blue-400 mb-4"
          >
            About NEX2
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-heading font-light leading-relaxed text-white/80"
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
            className="mt-8 text-lg text-white/50 leading-relaxed"
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
      <section className="py-24 md:py-32 px-6 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.05) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-sm font-cyber uppercase tracking-[0.2em] text-blue-400 mb-6"
          >
            Our Mission
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-heading font-semibold tracking-tight leading-tight"
          >
            Helping people reconnect with<br />the world around them.
          </motion.p>
          <motion.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-8 text-lg text-white/50 leading-relaxed max-w-2xl mx-auto"
          >
            We believe technology should encourage genuine human interaction,
            meaningful relationships, and stronger local communities.
          </motion.p>
        </div>
      </section>

      {/* What Makes NEX2 Different */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center text-3xl md:text-4xl font-heading font-semibold mb-16"
          >
            What Makes NEX2 Different
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="neon-card rounded-2xl p-8"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5">
                  <f.icon size={22} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-heading font-medium mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-24 md:py-32 px-6 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-sm font-cyber uppercase tracking-[0.2em] text-blue-400 mb-6"
          >
            Our Vision
          </motion.h2>
          <motion.h3
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-heading font-semibold tracking-tight leading-tight mb-8"
          >
            The Future of Networking
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
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center text-3xl md:text-4xl font-heading font-semibold mb-16"
          >
            Company Information
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
            {COMPANY_INFO.map((item, i) => (
              <motion.div
                key={item.label}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-black p-6"
              >
                <p className="text-xs uppercase tracking-wider text-white/40 mb-1">
                  {item.label}
                </p>
                <p className="text-base font-medium text-white/90">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Careers */}
      <section id="careers" className="py-24 md:py-32 px-6 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading font-semibold mb-6"
          >
            Join Our Team
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-lg text-white/50 leading-relaxed mb-12"
          >
            As we continue building NEX2, we're looking for talented individuals who
            are excited about shaping the future of real-world networking.
          </motion.p>

          <div className="space-y-3 mb-12 text-left max-w-md mx-auto">
            {OPENINGS.map((role, i) => (
              <motion.div
                key={role}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-colors"
              >
                <span className="text-sm text-white/80">{role}</span>
                <ArrowRight size={16} className="text-white/30" />
              </motion.div>
            ))}
          </div>

          <a
            href="mailto:support@nex2.app"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90 transition-all"
          >
            View Open Positions
          </a>
        </div>
      </section>

      {/* Press & Media */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading font-semibold mb-6"
          >
            Media &amp; Partnerships
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-lg text-white/50 leading-relaxed mb-8"
          >
            For media inquiries, partnership opportunities, business development, or
            general questions, please contact us.
          </motion.p>
          <a
            href="mailto:support@nex2.app"
            className="inline-flex items-center gap-2 text-lg font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Mail size={18} />
            support@nex2.app
          </a>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 md:py-32 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading font-semibold mb-12"
          >
            Contact
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
            <a
              href="mailto:support@nex2.app"
              className="flex flex-col items-center gap-2 p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-colors"
            >
              <Mail size={20} className="text-blue-400" />
              <span className="text-xs uppercase tracking-wider text-white/40">Email</span>
              <span className="text-sm text-white/80">support@nex2.app</span>
            </a>
            <a
              href="https://nex2.app"
              className="flex flex-col items-center gap-2 p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-colors"
            >
              <Globe size={20} className="text-blue-400" />
              <span className="text-xs uppercase tracking-wider text-white/40">Website</span>
              <span className="text-sm text-white/80">nex2.app</span>
            </a>
            <a
              href="https://instagram.com/nex2.app"
              className="flex flex-col items-center gap-2 p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-colors"
            >
              <Instagram size={20} className="text-blue-400" />
              <span className="text-xs uppercase tracking-wider text-white/40">Instagram</span>
              <span className="text-sm text-white/80">@nex2.app</span>
            </a>
            <div className="flex flex-col items-center gap-2 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <Linkedin size={20} className="text-white/30" />
              <span className="text-xs uppercase tracking-wider text-white/40">LinkedIn</span>
              <span className="text-sm text-white/30">Coming soon</span>
            </div>
          </div>
        </div>
      </section>

      <CompanyFooter />
    </div>
  );
}