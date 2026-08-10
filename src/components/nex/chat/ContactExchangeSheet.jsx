import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Phone, Instagram, AtSign, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const METHODS = [
  { value: "phone", label: "Phone Number", icon: Phone, placeholder: "+1 (555) 000-0000" },
  { value: "instagram", label: "Instagram", icon: Instagram, placeholder: "@your_handle" },
  { value: "other", label: "Other", icon: AtSign, placeholder: "Your handle or link" },
];

export default function ContactExchangeSheet({
  open,
  onClose,
  conversation,
  currentUser,
  onRespond,
}) {
  const [method, setMethod] = useState("phone");
  const [value, setValue] = useState("");

  if (!open) return null;

  const status = conversation?.contact_exchange_status || "none";
  const isRequester = conversation?.contact_exchange_requested_by === currentUser?.id;
  const isResponder = conversation?.contact_exchange_requested_by && !isRequester;

  const handleSubmit = async () => {
    if (!value.trim()) return;
    await base44.functions.invoke("requestContactExchange", {
      conversation_id: conversation.id,
      contact_method: method,
      contact_value: value.trim(),
    });
    setValue("");
    onClose();
  };

  const handleRespond = async (accept, responderMethod, responderValue) => {
    await base44.functions.invoke("respondContactExchange", {
      conversation_id: conversation.id,
      accept,
      responder_contact_method: responderMethod,
      responder_contact_value: responderValue,
    });
    onClose();
  };

  const activeMethod = METHODS.find((m) => m.value === method);

  // Accepted state — show both users' contact info
  if (status === "accepted") {
    const requesterInfo = {
      method: conversation?.requester_contact_method,
      value: conversation?.requester_contact_value,
    };
    const responderInfo = {
      method: conversation?.responder_contact_method,
      value: conversation?.responder_contact_value,
    };
    const myInfo = isRequester ? requesterInfo : responderInfo;
    const theirInfo = isRequester ? responderInfo : requesterInfo;

    return (
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="glass-strong rounded-t-2xl p-5 pb-8 space-y-4 safe-bottom"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-cyber text-sm font-bold text-green-400 tracking-wider">
            ✓ CONTACT EXCHANGED
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-white/40" />
          </button>
        </div>

        {theirInfo?.value && (
          <div className="cyber-frame rounded-xl p-4">
            <p className="text-white/40 text-[10px] font-cyber uppercase tracking-wider mb-1">
              Their {theirInfo.method}
            </p>
            <p className="text-white text-sm font-medium break-all">{theirInfo.value}</p>
          </div>
        )}

        {myInfo?.value && (
          <div className="cyber-frame rounded-xl p-4">
            <p className="text-white/40 text-[10px] font-cyber uppercase tracking-wider mb-1">
              Your {myInfo.method}
            </p>
            <p className="text-white/60 text-sm break-all">{myInfo.value}</p>
          </div>
        )}

        {!theirInfo?.value && (
          <p className="text-white/30 text-xs text-center">
            You shared your info. They haven't shared theirs yet.
          </p>
        )}
      </motion.div>
    );
  }

  // Responding state — the other user requested, current user responds
  if (isResponder && status === "pending") {
    return (
      <RespondPanel
        conversation={conversation}
        onAccept={(m, v) => handleRespond(true, m, v)}
        onDecline={() => handleRespond(false)}
        onClose={onClose}
      />
    );
  }

  // Requesting state — current user enters their contact info
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      className="glass-strong rounded-t-2xl p-5 pb-8 space-y-4 safe-bottom"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-cyber text-sm font-bold text-white neon-text tracking-wider">
          SHARE CONTACT
        </h3>
        <button onClick={onClose}>
          <X className="w-5 h-5 text-white/40" />
        </button>
      </div>

      <p className="text-blue-200/50 text-xs">
        Choose how you want to be reached. Your info will only be shared after the
        other person accepts.
      </p>

      <div className="flex gap-2">
        {METHODS.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => setMethod(opt.value)}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium transition-all active:scale-95 ${
                method === opt.value
                  ? "neon-btn text-white"
                  : "cyber-input text-white/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {opt.label}
            </button>
          );
        })}
      </div>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={activeMethod?.placeholder}
        autoFocus
        className="w-full px-4 py-3.5 rounded-xl cyber-input text-white placeholder:text-white/30 text-sm focus:outline-none"
      />

      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="w-full py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 transition-transform"
      >
        <Check className="w-4 h-4" /> SEND REQUEST
      </button>
    </motion.div>
  );
}

function RespondPanel({ conversation, onAccept, onDecline, onClose }) {
  const [shareBack, setShareBack] = useState(false);
  const [method, setMethod] = useState("phone");
  const [value, setValue] = useState("");

  const requesterMethod = conversation?.requester_contact_method;
  const activeMethod = METHODS.find((m) => m.value === method);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      className="glass-strong rounded-t-2xl p-5 pb-8 space-y-4 safe-bottom"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-cyber text-sm font-bold text-white neon-text tracking-wider">
          CONTACT REQUEST
        </h3>
        <button onClick={onClose}>
          <X className="w-5 h-5 text-white/40" />
        </button>
      </div>

      <p className="text-blue-200/50 text-xs">
        They want to share their {requesterMethod} with you. Accept to reveal their
        contact info.
      </p>

      {shareBack && (
        <>
          <div className="flex gap-2">
            {METHODS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setMethod(opt.value)}
                  className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium transition-all active:scale-95 ${
                    method === opt.value
                      ? "neon-btn text-white"
                      : "cyber-input text-white/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {opt.label}
                </button>
              );
            })}
          </div>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={activeMethod?.placeholder}
            autoFocus
            className="w-full px-4 py-3.5 rounded-xl cyber-input text-white placeholder:text-white/30 text-sm focus:outline-none"
          />
        </>
      )}

      {!shareBack && (
        <button
          onClick={() => setShareBack(true)}
          className="w-full py-2.5 rounded-xl cyber-input text-white/40 font-medium text-xs"
        >
          + Share my contact back (optional)
        </button>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onDecline()}
          className="flex-1 py-3.5 rounded-xl cyber-input text-white/60 font-cyber font-medium text-sm tracking-wider transition-transform"
        >
          DECLINE
        </button>
        <button
          onClick={() => onAccept(shareBack ? method : null, shareBack ? value.trim() : null)}
          className="flex-1 py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform"
        >
          <Check className="w-4 h-4" /> ACCEPT
        </button>
      </div>
    </motion.div>
  );
}