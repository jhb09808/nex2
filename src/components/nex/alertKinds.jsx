import React from "react";

// The alert vocabulary the phone and desktop screens both read from: one
// glyph and accent per Notification.type, and the tab each type belongs to.

export const BELL = (
  <svg width="24" height="25" viewBox="0 0 17 18" fill="none" aria-hidden="true">
    <path d="M3.4 7.2a5.1 5.1 0 0 1 10.2 0c0 4 1.4 5.4 1.4 5.4H2s1.4-1.4 1.4-5.4z" stroke="#8fd0ff" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M6.8 15.2a2 2 0 0 0 3.4 0" stroke="#8fd0ff" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const ICON_REQUEST = (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="7.2" cy="6" r="3.4" stroke="currentColor" strokeWidth="1.4" />
    <path d="M1.4 16c0-3.2 2.6-5 5.8-5 1.2 0 2.3.3 3.2.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M13.6 10.4v5.2M11 13h5.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
export const ICON_ACCEPTED = (
  <svg width="17" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
    <path d="M1.4 7.4l4.6 4.6L16.6 1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const ICON_MESSAGE = (
  <svg width="17" height="16" viewBox="0 0 18 17" fill="none" aria-hidden="true">
    <path d="M1 8a6.6 6.6 0 0 1 6.9-6.5h2.2A6.6 6.6 0 0 1 17 8a6.6 6.6 0 0 1-6.9 6.5H5.4L1 16.4l1.2-3.6A6.4 6.4 0 0 1 1 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);
export const ICON_MATCH = (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="10" cy="10" r="2.4" fill="currentColor" />
    <path d="M10 .8v2.6M10 16.6v2.6M.8 10h2.6M16.6 10h2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
export const ICON_RANK = (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M5 1.6h8v4.2a4 4 0 0 1-8 0V1.6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M5 2.8H2.4v1.4A2.6 2.6 0 0 0 5 6.8M13 2.8h2.6v1.4A2.6 2.6 0 0 1 13 6.8M9 9.8v3.4M5.8 16.4h6.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

// Maps the app's Notification.type values onto the design's tone + tab.
export const KIND = {
  request: { tab: "Requests", tone: "#a98cff", icon: ICON_REQUEST },
  accepted: { tab: "Requests", tone: "#4dffb0", icon: ICON_ACCEPTED },
  message: { tab: "Messages", tone: "#7fc8ff", icon: ICON_MESSAGE },
  nearby: { tab: "Activity", tone: "#ffb454", icon: ICON_MATCH },
  match: { tab: "Activity", tone: "#ffb454", icon: ICON_MATCH },
  event: { tab: "Activity", tone: "#ffc46b", icon: ICON_RANK },
  system: { tab: "Activity", tone: "#ffc46b", icon: ICON_RANK },
};

export const kindOf = (n) => KIND[n.type] || KIND.system;

export const TABS = ["All", "Requests", "Messages", "Activity"];

export const EMPTY_BELL = (
  <svg width="42" height="44" viewBox="0 0 17 18" fill="none" aria-hidden="true" style={{ opacity: 0.5 }}>
    <path d="M3.4 7.2a5.1 5.1 0 0 1 10.2 0c0 4 1.4 5.4 1.4 5.4H2s1.4-1.4 1.4-5.4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M6.8 15.2a2 2 0 0 0 3.4 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const CHECK = (
  <svg width="15" height="12" viewBox="0 0 16 13" fill="none" aria-hidden="true">
    <path d="M1 7l4.4 4.4L15 1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
