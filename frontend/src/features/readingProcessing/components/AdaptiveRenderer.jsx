import { useEffect } from "react";

function speak(text) {
  if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.85;
  utterance.pitch = 1.05;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export default function AdaptiveRenderer({ target, action }) {
  useEffect(() => {
    if (action?.action === "PLAY_AUDIO") speak(target);
  }, [action, target]);

  const text = target ?? "";
  const kind = action?.action;
  const cls = [
    "target-card",
    kind === "SIMPLIFY_UI" ? "flash-simplify" : "",
    kind === "ATTENTION_PROMPT" ? "attention-pulse" : "",
  ].filter(Boolean).join(" ");
  const isWord = text.length > 1 && /^[A-Za-z]+$/.test(text);
  const isSentence = /\s/.test(text);
  const highlighted = kind === "HIGHLIGHT_LETTERS";
  const split = kind === "SPLIT_WORD";

  return (
    <div key={action?.t || "target"} data-target={text} className={cls}>
      {isSentence ? (
        <SentenceRenderer text={text} highlighted={highlighted} />
      ) : isWord ? (
        <WordRenderer word={text} highlighted={highlighted} split={split} />
      ) : (
        <span className={highlighted ? "letter highlighted" : "letter"}>{text}</span>
      )}
    </div>
  );
}

function WordRenderer({ word, highlighted, split }) {
  return (
    <span>
      {word.split("").map((ch, i) => (
        <span key={`${word}-${i}`} className={["letter", highlighted ? "highlighted" : "", split ? "split" : ""].filter(Boolean).join(" ")}>{ch}</span>
      ))}
    </span>
  );
}

function SentenceRenderer({ text, highlighted }) {
  return (
    <span style={{ fontSize: "0.45em", lineHeight: 1.5, textAlign: "center", padding: "0 0.5em" }}>
      {text.split(/(\s+)/).map((token, i) => (
        token.trim()
          ? <span key={`${token}-${i}`} className={highlighted ? "letter highlighted" : "letter"}>{token}</span>
          : <span key={`space-${i}`}>{token}</span>
      ))}
    </span>
  );
}
