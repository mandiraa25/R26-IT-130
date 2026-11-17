// VIVA: FILE CONTENTS - JSX text helpers for mirrored reading stimuli and their clean accessible labels.
import React from "react";

/**
 * Renders text with optional character-level or whole-string horizontal mirroring.
 * - If text starts with "MIRROR:", mirrors the whole string.
 * - If text contains "[m]...[/m]", mirrors only the content inside [m] tags.
 * - Otherwise renders standard text.
 */
export const renderMirroredText = (text) => {
  if (typeof text !== "string") return text;

  if (text.startsWith("MIRROR:")) {
    const raw = text.replace("MIRROR:", "");
    return <span className="scale-x-[-1] inline-block">{raw}</span>;
  }

  if (text.includes("[m]") && text.includes("[/m]")) {
    const parts = text.split(/(\[m\].*?\[\/m\])/g);
    return (
      <span className="inline-flex flex-row items-center justify-center">
        {parts.map((part, idx) => {
          if (part.startsWith("[m]") && part.endsWith("[/m]")) {
            const char = part.slice(3, -4);
            return (
              <span key={idx} className="scale-x-[-1] inline-block">
                {char}
              </span>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </span>
    );
  }

  return text;
};

/**
 * Gets clean display string for text length calculations or accessibility labels.
 */
export const getCleanText = (text) => {
  if (typeof text !== "string") return text || "";
  return text.replace(/^MIRROR:/, "").replace(/\[m\]|\[\/m\]/g, "");
};
