import React, { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({ profile, className = "" }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/welcome`;
  const shareText = profile
    ? `Join me on NEX2 — discover people nearby who share your interests. We're building the waitlist in your area! ${shareUrl}`
    : `Join the NEX2 waitlist — discover people nearby who share your interests. ${shareUrl}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "NEX2",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (e) {
        // User cancelled or share failed — fall back to copy
      }
    }
    navigator.clipboard?.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className={`w-14 py-4 rounded-2xl glass flex items-center justify-center active:scale-95 transition-transform flex-shrink-0 ${className}`}
    >
      {copied ? (
        <Check className="w-5 h-5 text-green-400" />
      ) : (
        <Share2 className="w-5 h-5 text-white/60" />
      )}
    </button>
  );
}