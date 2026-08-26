import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, RefreshCw, Check } from "lucide-react";
import AuraAvatar from "@/components/nex/aura/AuraAvatar";
import { auraVariations } from "@/components/nex/aura/auraGeneration";

const NOTCH_LG = "polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)";
const NOTCH = "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)";

/**
 * Preview and refresh sheet: shows the live Aura large, plus the four
 * variations of the same identity. Picking one saves it to the profile.
 */
export default function AuraPickerSheet({ profile, onSave, onClose }) {
  const [picked, setPicked] = useState(profile?.aura_variant ?? 0);
  const [saving, setSaving] = useState(false);
  const variations = useMemo(() => auraVariations(profile || {}), [profile]);
  const current = variations.find((v) => v.variant === picked) || variations[0];

  const save = async () => {
    setSaving(true);
    await onSave(picked);
    setSaving(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ padding: "0 14px" }}
    >
      <div className="absolute inset-0" onClick={onClose} style={{ background: "rgba(1,6,14,.8)", backdropFilter: "blur(6px)" }} />

      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          maxHeight: "88dvh",
          overflowY: "auto",
          padding: "20px 18px 18px",
          clipPath: NOTCH_LG,
          background: "linear-gradient(180deg, rgba(10,32,64,.97), rgba(5,16,34,.98))",
          border: "1px solid rgba(105,190,255,.38)",
        }}
        className="scrollbar-hide"
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--font-chakra)", fontWeight: 700, fontStyle: "italic", fontSize: 19, lineHeight: 1, letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff" }}>
              Your Aura
            </div>
            <div style={{ marginTop: 9, fontFamily: "var(--font-chakra)", fontWeight: 400, fontSize: 12.5, lineHeight: 1.5, color: "#a6cbec" }}>
              Generated from your interests, badges and connections. Yours alone — no photo, no face.
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ flex: "none", width: 44, height: 44, margin: "-10px -10px 0 0", display: "flex", alignItems: "center", justifyContent: "center", border: 0, background: "transparent", color: "#7fa9d4", cursor: "pointer" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Large preview */}
        <div style={{ width: 168, height: 168, margin: "20px auto 0", borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,255,255,.2)", boxShadow: "0 0 34px rgba(90,180,255,.3)", boxSizing: "border-box" }}>
          <AuraAvatar aura={current.aura} />
        </div>
        <div style={{ marginTop: 12, textAlign: "center", fontFamily: "var(--font-jetbrains)", fontWeight: 500, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7fa9d4" }}>
          {current.aura.paletteKey} field · variation {picked + 1}
        </div>

        {/* Variations */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 20 }}>
          {variations.map((v) => (
            <button
              key={v.variant}
              onClick={() => setPicked(v.variant)}
              aria-label={`Variation ${v.variant + 1}`}
              aria-pressed={picked === v.variant}
              style={{
                position: "relative",
                padding: 0,
                aspectRatio: "1",
                borderRadius: "50%",
                overflow: "hidden",
                cursor: "pointer",
                background: "transparent",
                border: picked === v.variant ? "2px solid rgba(140,210,255,.9)" : "1px solid rgba(105,190,255,.24)",
                boxShadow: picked === v.variant ? "0 0 18px rgba(90,180,255,.5)" : "none",
                boxSizing: "border-box",
              }}
            >
              <AuraAvatar aura={v.aura} animated={false} />
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 9, marginTop: 20 }}>
          <button
            onClick={() => setPicked((p) => (p + 1) % variations.length)}
            className="notch"
            style={{ flex: "none", display: "flex", alignItems: "center", gap: 9, height: 50, padding: "0 18px", clipPath: NOTCH, border: "1px solid rgba(120,190,255,.32)", background: "rgba(10,30,60,.55)", color: "#dceeff", fontFamily: "var(--font-chakra)", fontWeight: 600, fontSize: 11.5, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="cta"
            style={{ flex: 1, height: 50, clipPath: NOTCH, fontFamily: "var(--font-chakra)", fontWeight: 700, fontSize: 12.5, letterSpacing: "0.17em", textTransform: "uppercase", opacity: saving ? 0.6 : 1 }}
          >
            <span className="sheen" />
            <Check className="w-4 h-4" style={{ position: "relative" }} />
            <span style={{ position: "relative" }}>{saving ? "Saving" : "Use this Aura"}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}