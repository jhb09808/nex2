import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import CompanyNav from "@/components/nex/company/CompanyNav";
import CompanyFooter from "@/components/nex/company/CompanyFooter";
import CompanyBackground from "@/components/nex/company/CompanyBackground";
import Logo from "@/components/nex/Logo";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const SECTION = (title, body) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="space-y-3"
  >
    <h2 className="text-lg font-cyber font-medium text-white tracking-wide">{title}</h2>
    {body}
  </motion.div>
);

export default function PrivacyPolicy() {
  const lastUpdated = "August 4, 2026";

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <CompanyBackground />
      <div className="relative z-10">
        <CompanyNav />

        <section className="pt-32 pb-24 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 blur-2xl bg-blue-500/20 rounded-full" style={{ transform: "scale(1.5)" }} />
                <Logo size="md" />
              </div>
            </motion.div>

            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 mb-6">
                <Shield size={12} className="text-blue-400" />
                <span className="text-xs font-cyber uppercase tracking-[0.25em] text-blue-300">Legal</span>
              </div>
              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="text-4xl md:text-5xl font-cyber font-bold tracking-tight"
              >
                Privacy Policy
              </motion.h1>
              <p className="mt-4 text-sm text-white/40">Last updated: {lastUpdated}</p>
            </div>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-white/60 leading-relaxed mb-12"
            >
              This Privacy Policy describes how NEX2, Inc. ("NEX2," "we," "us," or "our") collects,
              uses, and protects your information when you use our mobile application and related
              services (the "Service"). By accessing or using the Service, you agree to the practices
              described in this policy.
            </motion.p>

            <div className="space-y-12">
              {SECTION(
                "1. Information We Collect",
                <div className="space-y-3 text-white/60 leading-relaxed text-sm">
                  <p><span className="text-white/80 font-medium">Account Information:</span> Name, email address, phone number, and ZIP code when you register or join the waitlist.</p>
                  <p><span className="text-white/80 font-medium">Profile Information:</span> Username, bio, profile photo, age, gender, and selected interests that you choose to share.</p>
                  <p><span className="text-white/80 font-medium">Location Data:</span> Approximate location derived from your device to show nearby users. We do not store precise GPS coordinates permanently.</p>
                  <p><span className="text-white/80 font-medium">Usage Data:</span> How you interact with the app, including features used, connections made, and device information.</p>
                  <p><span className="text-white/80 font-medium">Communications:</span> Messages and interactions with other users, stored to provide the Service.</p>
                </div>
              )}

              {SECTION(
                "2. How We Use Your Information",
                <div className="space-y-3 text-white/60 leading-relaxed text-sm">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc list-inside space-y-1.5 pl-2">
                    <li>Create and manage your account and profile</li>
                    <li>Show you people nearby who share your interests</li>
                    <li>Facilitate connections, waves, and conversations</li>
                    <li>Verify age eligibility and enforce safety measures</li>
                    <li>Send notifications about nearby activity and messages</li>
                    <li>Improve, secure, and develop our features</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>
              )}

              {SECTION(
                "3. Location & Proximity",
                <p className="text-white/60 leading-relaxed text-sm">
                  NEX2 uses your device location to display nearby users on a proximity-based radar.
                  Location is used to determine proximity tiers and is not shared with other users
                  as precise coordinates. You can control your visibility settings and turn off
                  location services at any time through your device settings or the app.
                </p>
              )}

              {SECTION(
                "4. Sharing Your Information",
                <p className="text-white/60 leading-relaxed text-sm">
                  We do not sell your personal information. We may share data with service providers
                  who help operate the Service, in response to legal requests, to protect rights and
                  safety, or in connection with a merger or acquisition. Other users can see the
                  profile information you choose to display.
                </p>
              )}

              {SECTION(
                "5. Data Retention",
                <p className="text-white/60 leading-relaxed text-sm">
                  We retain your information for as long as your account is active or as needed to
                  provide the Service. You may request deletion of your account at any time, and we
                  will remove your data in accordance with applicable law.
                </p>
              )}

              {SECTION(
                "6. Your Rights",
                <p className="text-white/60 leading-relaxed text-sm">
                  Depending on your jurisdiction, you may have the right to access, correct, export,
                  or delete your personal information, and to opt out of certain data processing. To
                  exercise these rights, contact us at support@nex2.app.
                </p>
              )}

              {SECTION(
                "7. Children's Privacy",
                <p className="text-white/60 leading-relaxed text-sm">
                  NEX2 is not intended for users under 18 years of age. We do not knowingly collect
                  information from individuals under 18. If you believe a minor is using the Service,
                  please contact us.
                </p>
              )}

              {SECTION(
                "8. Security",
                <p className="text-white/60 leading-relaxed text-sm">
                  We use reasonable technical and organizational measures to protect your data.
                  However, no method of transmission over the internet is completely secure, and we
                  cannot guarantee absolute security.
                </p>
              )}

              {SECTION(
                "9. Changes to This Policy",
                <p className="text-white/60 leading-relaxed text-sm">
                  We may update this Privacy Policy from time to time. We will notify you of
                  material changes by posting the updated policy in the app or via email. Continued
                  use of the Service after changes constitutes acceptance of the updated policy.
                </p>
              )}

              {SECTION(
                "10. Contact Us",
                <p className="text-white/60 leading-relaxed text-sm">
                  If you have questions about this Privacy Policy, contact us at{" "}
                  <a href="mailto:support@nex2.app" className="text-blue-400 hover:text-blue-300">support@nex2.app</a>.
                </p>
              )}
            </div>
          </div>
        </section>

        <CompanyFooter />
      </div>
    </div>
  );
}