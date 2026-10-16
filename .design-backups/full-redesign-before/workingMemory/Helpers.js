// Shared helper functions used across the Working Memory improvement games

// Turns any youtube URL shape into a clean embeddable URL
export const formatYouTubeEmbedUrl = (url) => {
  if (!url) return "";
  let videoId = "";
  if (url.includes("/embed/")) {
    videoId = url.split("/embed/")[1]?.split("?")[0];
  } else if (url.includes("v=")) {
    videoId = url.split("v=")[1]?.split("&")[0];
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0];
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`;
  }
  return url;
};

// Extracts the raw YouTube video id from any of the common URL shapes
export const getYouTubeId = (url) => {
  if (!url) return "";
  if (url.includes("/embed/")) return url.split("/embed/")[1]?.split("?")[0];
  if (url.includes("v=")) return url.split("v=")[1]?.split("&")[0];
  if (url.includes("youtu.be/")) return url.split("youtu.be/")[1]?.split("?")[0];
  return "";
};

// Parses an instruction string into step items with emojis for the Instructions game
export const parseInstructionSteps = (instructionText) => {
  if (!instructionText) return [];

  let cleanText = instructionText.trim();
  if (cleanText.endsWith(".")) {
    cleanText = cleanText.slice(0, -1);
  }

  // Split by comma, "then", or "පසුව"
  const rawParts = cleanText.split(/,\s*|then\b|\s+then\s+|පසුව/i);
  const parts = rawParts.map((p) => p.trim()).filter(Boolean);

  return parts.map((part) => {
    let text = part.trim();
    let icon = "📝";

    const lower = text.toLowerCase();
    if (lower.includes("book") || lower.includes("පොත")) icon = "📖";
    else if (lower.includes("clap") || lower.includes("අත්පුඩි")) icon = "👏";
    else if (lower.includes("jump") || lower.includes("පනින්න")) icon = "🦘";
    else if (lower.includes("nose") || lower.includes("නාසය")) icon = "👃";
    else if (lower.includes("box") || lower.includes("පෙට්ටිය")) icon = "📦";
    else if (lower.includes("toy") || lower.includes("සෙල්ලම් බඩුව")) icon = "🧸";
    else if (lower.includes("wave") || lower.includes("අත වනන්න")) icon = "👋";
    else if (lower.includes("sit") || lower.includes("වාඩිවන්න")) icon = "🧎";
    else if (lower.includes("head") || lower.includes("හිස")) icon = "🧑";
    else if (lower.includes("light") || lower.includes("පහන") || lower.includes("ලයිට්")) icon = "💡";
    else if (lower.includes("bell") || lower.includes("බෙල්")) icon = "🔔";
    else if (lower.includes("flower") || lower.includes("මල") || lower.includes("මලක්")) icon = "🌸";
    else if (lower.includes("stand") || lower.includes("හිටගන්න")) icon = "🧍";
    else if (lower.includes("door") || lower.includes("දොර")) icon = "🚪";
    else if (lower.includes("write") || lower.includes("ලියන්න")) icon = "✍️";
    else if (lower.includes("draw") || lower.includes("අඳින්න")) icon = "🎨";
    else if (lower.includes("sing") || lower.includes("ගයන්න")) icon = "🎤";

    text = text.charAt(0).toUpperCase() + text.slice(1);
    return { text, icon };
  });
};

// Fisher-Yates-ish shuffle (matches original random sort behaviour)
export const shuffleArray = (arr) => {
  return [...arr].sort(() => Math.random() - 0.5);
};