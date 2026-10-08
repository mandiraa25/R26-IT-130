/**
 * Temporary fallbacks until real Leo assets are supplied:
 * - frontend/src/assets/lexiland/leo-lion.webp
 * - frontend/src/assets/lexiland/leo-training-map-bg.webp
 * - frontend/src/assets/speech-demo-illustration.png
 */

export const LEO_TRAINING_MAP_GRADIENT =
  "radial-gradient(circle at 20% 20%, rgba(254,243,199,0.45), transparent 32%), linear-gradient(135deg, #052e16 0%, #0f766e 55%, #14532d 100%)";

export function LeoLionImage({ className = "", alt = "Leo the lion", ...props }) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-900 shadow-lg ring-4 ring-amber-200/80 ${className}`}
      {...props}
    >
      <svg viewBox="0 0 64 64" className="h-full w-full p-2" aria-hidden="true">
        <circle cx="32" cy="32" r="28" fill="#f59e0b" />
        <circle cx="24" cy="28" r="4" fill="#78350f" />
        <circle cx="40" cy="28" r="4" fill="#78350f" />
        <path d="M22 40c4 6 16 6 20 0" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M12 18c4-8 12-12 20-12s16 4 20 12" fill="#d97706" />
      </svg>
    </div>
  );
}

export function SpeechDemoIllustration({ className = "", alt = "Speech processing", ...props }) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex items-center justify-center rounded-[2rem] bg-gradient-to-br from-violet-100 via-sky-100 to-emerald-100 text-6xl shadow-xl ${className}`}
      {...props}
    >
      🎙️
    </div>
  );
}
