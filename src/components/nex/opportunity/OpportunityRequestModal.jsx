import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { LOOKING_FOR_CATEGORIES, ALL_LOOKING_FOR } from "./opportunityCategories";

const PROJECT_TYPES = [
  "mixed_use_development",
  "ground_up_construction",
  "commercial",
  "residential",
  "multifamily",
  "industrial",
  "land_development",
  "fix_and_flip",
  "saas",
  "ai_automation",
  "retail",
  "hospitality",
];

const TIMELINES = [
  "Within 30 days",
  "Within 60 days",
  "Within 90 days",
  "Within 6 months",
  "Within 1 year",
  "Flexible",
];

const VISIBILITY_OPTIONS = [
  { id: "local", label: "Local" },
  { id: "national", label: "National" },
  { id: "global", label: "Global" },
  { id: "invite_only", label: "Invite Only" },
];

export default function OpportunityRequestModal({ onClose, onCreated }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const [requestedAmount, setRequestedAmount] = useState("");
  const [projectType, setProjectType] = useState("");
  const [location, setLocation] = useState("");
  const [geographicScope, setGeographicScope] = useState("national");
  const [timeline, setTimeline] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [visibility, setVisibility] = useState("national");
  const [saving, setSaving] = useState(false);

  const toggleNeed = (id) => {
    setSelectedNeeds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !industry.trim() || selectedNeeds.length === 0) {
      toast({ title: "Please fill in all required fields", variant: "destructive", duration: 4000 });
      return;
    }
    setSaving(true);
    try {
      const amount = requestedAmount ? Number(requestedAmount.replace(/[^0-9]/g, "")) : null;
      await base44.entities.OpportunityRequest.create({
        title: title.trim(),
        industry: industry.trim(),
        looking_for: selectedNeeds,
        requested_amount: amount,
        project_type: projectType || null,
        location: location.trim(),
        geographic_scope: geographicScope,
        timeline: timeline,
        additional_details: additionalDetails.trim(),
        visibility,
        status: "open",
        is_remote_ok: geographicScope !== "local",
      });
      toast({ title: "Opportunity posted", description: "Relevant providers will be matched.", duration: 4000 });
      onCreated?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to create opportunity", variant: "destructive", duration: 4000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide glass-strong rounded-t-3xl sm:rounded-2xl border border-white/10"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 glass-strong border-b border-white/5 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-cyber uppercase tracking-wider text-blue-300">Post an Opportunity</span>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="px-5 py-5 space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-cyber uppercase tracking-wider text-white/50">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Looking for Construction Financing"
                className="w-full px-3 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white/80 placeholder:text-white/20 focus:border-blue-400/40 focus:outline-none"
              />
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <label className="text-xs font-cyber uppercase tracking-wider text-white/50">Industry *</label>
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Construction"
                className="w-full px-3 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white/80 placeholder:text-white/20 focus:border-blue-400/40 focus:outline-none"
              />
            </div>

            {/* Looking For */}
            <div className="space-y-2">
              <label className="text-xs font-cyber uppercase tracking-wider text-white/50">What You're Looking For *</label>
              <div className="max-h-40 overflow-y-auto scrollbar-hide space-y-1.5">
                {LOOKING_FOR_CATEGORIES.map((cat) => (
                  <div key={cat.id}>
                    <p className="text-[10px] text-white/30 mt-2 mb-1">{cat.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.subcategories.map((sub) => {
                        const selected = selectedNeeds.includes(sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => toggleNeed(sub.id)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                              selected
                                ? "bg-blue-500/20 border border-blue-400/40 text-blue-300"
                                : "bg-white/[0.03] border border-white/5 text-white/40"
                            }`}
                          >
                            {sub.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amount + Project Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-cyber uppercase tracking-wider text-white/50">Requested Amount</label>
                <input
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  placeholder="$100,000,000"
                  className="w-full px-3 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white/80 placeholder:text-white/20 focus:border-blue-400/40 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-cyber uppercase tracking-wider text-white/50">Project Type</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white/80 focus:border-blue-400/40 focus:outline-none"
                >
                  <option value="">Select...</option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-zinc-900">{t.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location + Timeline */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-cyber uppercase tracking-wider text-white/50">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ohio, United States"
                  className="w-full px-3 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white/80 placeholder:text-white/20 focus:border-blue-400/40 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-cyber uppercase tracking-wider text-white/50">Timeline</label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white/80 focus:border-blue-400/40 focus:outline-none"
                >
                  <option value="">Select...</option>
                  {TIMELINES.map((t) => (
                    <option key={t} value={t} className="bg-zinc-900">{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Geographic Scope */}
            <div className="space-y-2">
              <label className="text-xs font-cyber uppercase tracking-wider text-white/50">Geographic Scope</label>
              <div className="grid grid-cols-4 gap-2">
                {VISIBILITY_OPTIONS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setGeographicScope(v.id)}
                    className={`py-2 rounded-lg text-[10px] font-medium transition-all ${
                      geographicScope === v.id
                        ? "neon-btn text-white"
                        : "bg-white/[0.03] border border-white/5 text-white/40"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <label className="text-xs font-cyber uppercase tracking-wider text-white/50">Visibility</label>
              <div className="grid grid-cols-4 gap-2">
                {VISIBILITY_OPTIONS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVisibility(v.id)}
                    className={`py-2 rounded-lg text-[10px] font-medium transition-all ${
                      visibility === v.id
                        ? "neon-btn text-white"
                        : "bg-white/[0.03] border border-white/5 text-white/40"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-2">
              <label className="text-xs font-cyber uppercase tracking-wider text-white/50">Additional Details</label>
              <textarea
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                rows={3}
                placeholder="Optional — describe your project, requirements, etc."
                className="w-full px-3 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white/80 placeholder:text-white/20 focus:border-blue-400/40 focus:outline-none resize-none"
              />
            </div>

            {/* Privacy note */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
              <Lock size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-blue-200/60 leading-relaxed">
                Your opportunity will only be shown to relevant users and providers. Private financial documents are never exposed publicly.
              </p>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? "Posting..." : "Post Opportunity"} <Send size={14} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}