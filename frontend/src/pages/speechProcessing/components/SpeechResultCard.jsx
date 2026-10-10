const SpeechResultCard = ({ result, completion }) => {
  if (!result && !completion) return null;

  return (
    <div className="rounded-[2rem] border-3 border-[#6e3c1b] bg-[#fffdf7] p-6 shadow-xl">
      <h3 className="text-2xl font-black text-[#2e1910]">Great try!</h3>

      {result && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#ecdac2] bg-[#fbf7ed] p-4">
            <p className="text-xs font-black uppercase tracking-widest text-[#786154]">
              Pronunciation Score
            </p>
            <p className="mt-2 text-3xl font-black text-[#2e1910]">
              {Math.round((result.itemResult?.pronunciationScore || 0) * 100)}%
            </p>
          </div>
          <div className="rounded-2xl border border-[#ecdac2] bg-[#fbf7ed] p-4">
            <p className="text-xs font-black uppercase tracking-widest text-[#786154]">
              Stars Earned
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-3xl font-black text-amber-500">
              <span>★</span>
              <span>{result.itemResult?.starsEarned || 0}</span>
            </p>
          </div>
          <div className="rounded-2xl border border-[#ecdac2] bg-[#fbf7ed] p-4 sm:col-span-2">
            <p className="text-xs font-black uppercase tracking-widest text-[#7c2d12]">
              Sound practice
            </p>
            <p className="mt-2 text-base font-bold text-[#2e1910]">
              {result.itemResult?.supportHint ||
                "Let's practice this sound again."}
            </p>
          </div>
          <div className="rounded-2xl border border-[#ecdac2] bg-[#fbf7ed] p-4 sm:col-span-2">
            <p className="text-xs font-black uppercase tracking-widest text-[#786154]">
              Audio check
            </p>
            <p className="mt-2 text-sm font-bold text-[#786154]">
              Valid audio: {result.itemResult?.validAudio ? "Yes" : "No"} |
              Word correct: {result.itemResult?.wordCorrect ? "Yes" : "Keep practicing"}
            </p>
          </div>
        </div>
      )}

      {completion && (
        <div className="mt-5 rounded-2xl border-2 border-[#ecdac2] bg-[#fbf7ed] p-5">
          <p className="text-xs font-black uppercase tracking-widest text-[#786154]">
            Great work!
          </p>
          <p className="mt-2 text-3xl font-black text-[#2e1910]">
            You earned stars.
          </p>
          <p className="mt-2 text-sm font-bold text-[#786154]">
            Your guardian can see your progress.
          </p>
          <p className="mt-4 text-sm font-black text-[#2e1910]">
            Practice ideas
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {completion.recommendations?.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#ecdac2] bg-[#fffdf7] px-4 py-2 text-xs font-black text-[#7c2d12]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeechResultCard;
