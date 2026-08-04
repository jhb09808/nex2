import React from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
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

export default function TermsOfService() {
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
                <FileText size={12} className="text-blue-400" />
                <span className="text-xs font-cyber uppercase tracking-[0.25em] text-blue-300">Legal</span>
              </div>
              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="text-4xl md:text-5xl font-cyber font-bold tracking-tight"
              >
                Terms of Service
              </motion.h1>
              <p className="mt-4 text-sm text-white/40">Last updated: {lastUpdated}</p>
            </div>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-white/60 leading-relaxed mb-12"
            >
              These Terms of Service ("Terms") govern your use of the NEX2 mobile application and
              related services (the "Service") operated by NEX2, Inc. ("NEX2," "we," "us," or
              "our"). By creating an account or using the Service, you agree to be bound by these
              Terms. If you do not agree, do not use the Service.
            </motion.p>

            <div className="space-y-12">
              {SECTION(
                "1. Eligibility",
                <p className="text-white/60 leading-relaxed text-sm">
                  You must be at least 18 years old to use NEX2. By using the Service, you represent
                  and warrant that you meet this age requirement and are legally able to enter into a
                  binding agreement.
                </p>
              )}

              {SECTION(
                "2. Your Account",
                <p className="text-white/60 leading-relaxed text-sm">
                  You are responsible for maintaining the confidentiality of your login credentials
                  and for all activity that occurs under your account. You agree to provide accurate
                  and complete information during registration and to keep your information current.
                </p>
              )}

              {SECTION(
                "3. Acceptable Use",
                <div className="space-y-3 text-white/60 leading-relaxed text-sm">
                  <p>You agree not to:</p>
                  <ul className="list-disc list-inside space-y-1.5 pl-2">
                    <li>Use the Service for any unlawful, harmful, or fraudulent purpose</li>
                    <li>Harass, stalk, threaten, or harm other users</li>
                    <li>Impersonate another person or misrepresent your identity</li>
                    <li>Share content that is offensive, defamatory, or infringes on others' rights</li>
                    <li>Attempt to disrupt, hack, or reverse-engineer the Service</li>
                    <li>Use automated systems, bots, or scrapers without permission</li>
                    <li>Create multiple accounts or share account access</li>
                  </ul>
                </div>
              )}

              {SECTION(
                "4. User Content",
                <p className="text-white/60 leading-relaxed text-sm">
                  You retain ownership of content you post on NEX2. By posting, you grant us a
                  worldwide, non-exclusive, royalty-free license to use, display, and process your
                  content to operate the Service. You are solely responsible for your content and
                  its legality.
                </p>
              )}

              {SECTION(
                "5. Proximity & Location",
                <p className="text-white/60 leading-relaxed text-sm">
                  NEX2 displays nearby users based on proximity. You acknowledge that using
                  location-based features carries inherent risks and that NEX2 is not liable for
                  interactions that occur in person. You are responsible for your own safety when
                  meeting others.
                </p>
              )}

              {SECTION(
                "6. Subscriptions & Payments",
                <p className="text-white/60 leading-relaxed text-sm">
                  Certain features may require a paid subscription (Plus, Pro, or Platinum). Fees
                  are billed in advance on a recurring basis unless cancelled. You may cancel at
                  any time; refunds are governed by applicable law and our refund policy. Prices
                  and features may change with notice.
                </p>
              )}

              {SECTION(
                "7. Termination",
                <p className="text-white/60 leading-relaxed text-sm">
                  We may suspend or terminate your account at any time, with or without cause or
                  notice, including for violations of these Terms. You may delete your account at
                  any time. Upon termination, your right to use the Service ceases immediately.
                </p>
              )}

              {SECTION(
                "8. Disclaimers",
                <p className="text-white/60 leading-relaxed text-sm">
                  The Service is provided "as is" and "as available" without warranties of any kind.
                  We do not guarantee that the Service will be uninterrupted, error-free, or secure,
                  or that it will meet your expectations.
                </p>
              )}

              {SECTION(
                "9. Limitation of Liability",
                <p className="text-white/60 leading-relaxed text-sm">
                  To the fullest extent permitted by law, NEX2 shall not be liable for any
                  indirect, incidental, special, or consequential damages, or for any loss of data,
                  profits, or goodwill, arising from your use of the Service.
                </p>
              )}

              {SECTION(
                "10. Governing Law",
                <p className="text-white/60 leading-relaxed text-sm">
                  These Terms are governed by the laws of the State of Florida, without regard to
                  conflict-of-law principles. Any disputes will be resolved in the courts located
                  in Miami-Dade County, Florida.
                </p>
              )}

              {SECTION(
                "11. Changes to These Terms",
                <p className="text-white/60 leading-relaxed text-sm">
                  We may modify these Terms at any time. We will notify you of material changes by
                  posting the updated Terms in the app. Continued use of the Service after changes
                  constitutes acceptance of the revised Terms.
                </p>
              )}

              {SECTION(
                "12. Contact Us",
                <p className="text-white/60 leading-relaxed text-sm">
                  If you have questions about these Terms, contact us at{" "}
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