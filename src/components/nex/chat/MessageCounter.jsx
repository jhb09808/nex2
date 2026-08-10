import React from "react";

export default function MessageCounter({ sentCount, max = 20 }) {
  if (sentCount >= max || sentCount === 0) return null;

  const remaining = max - sentCount;

  let message = "";
  let className = "text-white/20 text-[10px] font-cyber tracking-wider";

  if (sentCount >= 19) {
    message = "Last message 👀";
    className = "text-amber-400 text-[11px] font-cyber tracking-wider animate-pulse";
  } else if (sentCount >= 18) {
    message = "Only 2 messages left. Time to make a move?";
    className = "text-amber-400/80 text-[11px] font-cyber tracking-wider";
  } else if (sentCount >= 15) {
    message = `${remaining} messages left. Don't waste 'em 👀`;
    className = "text-blue-300/60 text-[11px] font-cyber tracking-wider";
  } else {
    message = `${sentCount} / ${max} messages sent`;
  }

  return (
    <div className="text-center pb-1">
      <span className={className}>{message}</span>
    </div>
  );
}