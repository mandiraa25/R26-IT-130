// VIVA: Full-screen dialog/background wrapper for child gameplay content; children supply the actual controls.
function LeoGameSessionModal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-cover bg-center p-2 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Leo game activity"}
      style={{
        backgroundImage: "url('/images/speechProcessing/sunlit_jungle_gameplay_bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Subtle sunbeam warm contrast overlay */}
      <div className="pointer-events-none fixed inset-0 bg-amber-950/10 backdrop-blur-[0.5px]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] max-w-7xl flex-col justify-between">
        {children}
      </div>
    </div>
  );
}

export default LeoGameSessionModal;
