import React from "react";

/**
 * Pinned chrome, one flexible content region.
 *
 * The header and footer keep their natural (physical) height on every phone
 * and carry the safe-area insets themselves; the content region takes all the
 * remaining space and is the only thing that grows or shrinks between an
 * iPhone SE and a 15 Pro Max, or between browser and standalone mode.
 *
 * 100dvh — never 100vh — because on iOS 100vh is the height with the URL bar
 * hidden, which makes the page permanently taller than the visible area.
 */
export default function AppShell({ header, footer, children, background = "#01050c" }) {
  return (
    <div style={{ position: "fixed", inset: 0, height: "100dvh", display: "flex", flexDirection: "column", background, overflow: "hidden" }}>
      {header ? (
        <div style={{ flex: "none", paddingTop: "env(safe-area-inset-top, 0px)", paddingLeft: "env(safe-area-inset-left, 0px)", paddingRight: "env(safe-area-inset-right, 0px)" }}>
          {header}
        </div>
      ) : null}
      {/* min-height:0 lets a scrolling child actually shrink instead of
          pushing the footer off screen. */}
      <main style={{ flex: 1, minHeight: 0, position: "relative", display: "flex", flexDirection: "column" }}>{children}</main>
      {footer ? (
        <div style={{ flex: "none", paddingBottom: "env(safe-area-inset-bottom, 0px)", paddingLeft: "env(safe-area-inset-left, 0px)", paddingRight: "env(safe-area-inset-right, 0px)" }}>
          {footer}
        </div>
      ) : null}
    </div>
  );
}
