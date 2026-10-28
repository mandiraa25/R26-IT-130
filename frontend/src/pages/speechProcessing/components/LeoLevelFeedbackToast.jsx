// VIVA: Transient result display: child feedback, Leo's message and earned collectibles; retry-required results stay hidden here.
function LeoLevelFeedbackToast({ feedback, theme }) {
  if (!feedback || feedback.retryRequired) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 top-24 z-[60] mx-auto max-w-md rounded-[2rem] border-3 border-[#6e3c1b] bg-[#fffdf7] p-5 text-center shadow-2xl backdrop-blur">
      <p className="text-2xl font-black text-[#2e1910]">
        {feedback.childFeedback || "Great safari work!"}
      </p>
      <p className="mt-2 text-sm font-bold text-[#786154]">
        {feedback.leoMessage || "You unlocked the next jungle step!"}
      </p>
      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#ecdac2] bg-[#fbf7ed] px-4 py-2 text-sm font-black text-amber-500 shadow-sm">
        <span>★</span>
        <span>+{feedback.starsEarned || 0} {theme?.collectible || "sound gems"}</span>
      </p>
    </div>
  );
}

export default LeoLevelFeedbackToast;
