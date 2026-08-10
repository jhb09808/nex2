import React from "react";
import { MapPin, Share2, UserX } from "lucide-react";

const distanceMiles = (lat1, lon1, lat2, lon2) => {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (dist) => {
  if (dist < 0.1) return `${Math.round(dist * 5280)} ft`;
  return `${dist.toFixed(1)} mi`;
};

export default function PostChatPanel({
  conversation,
  myProfile,
  otherUser,
  onShareContact,
  onEndConnection,
}) {
  const hasLocation =
    myProfile?.latitude != null &&
    myProfile?.longitude != null &&
    otherUser?.latitude != null &&
    otherUser?.longitude != null;

  const dist = hasLocation
    ? distanceMiles(
        myProfile.latitude,
        myProfile.longitude,
        otherUser.latitude,
        otherUser.longitude
      )
    : null;

  const contactStatus = conversation?.contact_exchange_status || "none";

  return (
    <div className="px-4 py-6 space-y-5">
      {conversation?.connection_made && (
        <div className="text-center py-2">
          <p className="text-3xl">🤝</p>
          <p className="font-cyber text-sm text-green-400 neon-text mt-2">
            Connection made
          </p>
          <p className="text-white/30 text-[10px] mt-1">
            You met in real life. NEX2 worked.
          </p>
        </div>
      )}

      <div className="text-center">
        <h2 className="font-cyber text-lg font-bold text-white neon-text">
          Chat complete.
        </h2>
        <p className="font-cyber text-sm text-blue-300/60 mt-1">NEX2 did its job.</p>
      </div>

      {dist != null && (
        <div className="cyber-frame rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">
              You're only {formatDistance(dist)} apart.
            </p>
            <p className="text-white/30 text-[11px]">
              Close enough to meet in person.
            </p>
          </div>
        </div>
      )}

      {contactStatus === "accepted" && (
        <div className="cyber-frame rounded-xl p-3 text-center">
          <p className="text-green-400 text-xs font-cyber">
            ✓ Contact info exchanged
          </p>
        </div>
      )}

      {contactStatus === "pending" && (
        <div className="cyber-frame rounded-xl p-3 text-center">
          <p className="text-blue-300/60 text-xs font-cyber">
            Contact request pending...
          </p>
        </div>
      )}

      {contactStatus === "declined" && (
        <div className="cyber-frame rounded-xl p-3 text-center">
          <p className="text-white/30 text-xs font-cyber">
            Contact request declined
          </p>
        </div>
      )}

      <div className="space-y-2">
        {contactStatus === "none" && (
          <button
            onClick={onShareContact}
            className="w-full py-3.5 rounded-xl neon-btn text-white font-cyber font-bold text-sm tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Share2 className="w-4 h-4" /> SHARE CONTACT
          </button>
        )}
        <button
          onClick={onEndConnection}
          className="w-full py-3.5 rounded-xl cyber-input text-white/60 font-cyber font-medium text-sm tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <UserX className="w-4 h-4" /> END CONNECTION
        </button>
      </div>
    </div>
  );
}