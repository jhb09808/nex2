import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const PURPOSES = [
  { id: "discuss_funding", label: "Discuss Funding" },
  { id: "explore_partnership", label: "Explore Partnership" },
  { id: "request_services", label: "Request Services" },
  { id: "offer_services", label: "Offer Services" },
  { id: "discuss_investment", label: "Discuss an Investment" },
  { id: "explore_opportunity", label: "Explore a Business Opportunity" },
  { id: "general_networking", label: "General Networking" },
];

export default function ConnectionRequestModal({ provider, request, matchResult, onClose, onSent }) {
  const { toast } = useToast();
  const [purpose, setPurpose] = useState("discuss_funding");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const defaultMessage = request
    ? `Hi, I'm reaching out regarding my opportunity: ${request.title}. NEX2 identified us as a strong match based on your services and my needs. I'd love to discuss further.`
    : `Hi, NEX2 identified us as a strong match. I'd love to connect and explore how we might work together.`;

  const handleSubmit = async () => {
    setSending(true);
    try {
      await base44.entities.ConnectionRequest.create({
        recipient_id: provider.id,
        recipient_name: provider.company_name,
        opportunity_request_id: request?.id || null,
        purpose,
        message: message || defaultMessage,
        status: "pending",
        pipeline_status: "connection_requested",
      });
      toast({ title: "Connection request sent", description: `${provider.company_name} will be notified.`, duration: 4000 });
      onSent?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to send request", variant: "destructive", duration: 4000 });
    } finally {
      setSending(false);
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
          className="w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide glass-strong rounded-t-3xl sm:rounded-2xl border border-white/10"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 glass-strong border-b border-white/5 px-5 py-4 flex items-center justify-between">
            <span className="text-[10px] font-cyber uppercase tracking-wider text-blue-300">Request Connection</span>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="px-5 py-5 space-y-5">
            {/* Recipient */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <span className="text-blue-400 font-cyber font-bold text-sm">{provider.company_name?.[0]}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{provider.company_name}</p>
                <p className="text-xs text-white/40">{provider.industry}</p>
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <label className="text-xs font-cyber uppercase tracking-wider text-white/50">Purpose of Connection</label>
              <div className="grid grid-cols-2 gap-2">
                {PURPOSES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPurpose(p.id)}
                    className={`py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                      purpose === p.id
                        ? "neon-btn text-white"
                        : "bg-white/[0.03] border border-white/5 text-white/50 hover:border-blue-400/20"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-xs font-cyber uppercase tracking-wider text-white/50">Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={defaultMessage}
                rows={4}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white/80 placeholder:text-white/20 focus:border-blue-400/40 focus:outline-none resize-none"
              />
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-white/30 leading-relaxed">
              Connection requests are private. The recipient can accept, decline, or request more information.
            </p>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={sending}
              className="w-full py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Request"} <Send size={14} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}