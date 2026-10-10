function LeoGameSessionModal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-2 sm:p-4 md:p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Leo game activity"}
    >
      <div className="mx-auto min-h-[calc(100vh-1rem)] max-w-7xl sm:min-h-[calc(100vh-2rem)]">
        <div
          className="relative min-h-[calc(100vh-1rem)] overflow-hidden rounded-[2rem] sm:rounded-[2.8rem] border-4 sm:border-[5px] border-[#6e3c1b] bg-[#a06334] p-3 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:min-h-[calc(100vh-2rem)]"
          style={{
            backgroundImage: "url('/images/reports/jungle_waterfall_bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Subtle overlay for optimal content contrast */}
          <div className="pointer-events-none absolute inset-0 bg-black/15" />
          <div className="relative z-10">
            {children}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-30 hidden h-10 w-10 items-center justify-center rounded-full border-2 border-[#6e3c1b] bg-white/95 text-sm font-black text-[#6e3c1b] shadow-md transition hover:scale-105 hover:bg-rose-50 hover:text-rose-600 focus:outline-none md:flex cursor-pointer"
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeoGameSessionModal;
