// VIVA: Bilingual prompt card: English instruction, target word/sentence and Sinhala instruction with a microphone/book icon.
function PromptCard({ prompt }) {
  const isSentence = prompt?.taskType === "sentence_read";

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border-4 border-[#6e3c1b] bg-[#fffdf7] p-7 text-center shadow-2xl">
      <div className="absolute left-6 top-6 text-3xl" aria-hidden="true">
        {isSentence ? "📖" : "🎤"}
      </div>
      <p className="text-xs font-black uppercase tracking-[0.25em] text-[#786154]">
        {prompt?.instructionEn || "Say the word"}
      </p>
      <h1
        className={`mt-6 break-words font-black tracking-tight text-[#2e1910] ${
          isSentence ? "text-4xl sm:text-5xl" : "text-7xl sm:text-8xl"
        }`}
      >
        {prompt?.targetText}
      </h1>
      <p className="mt-5 text-xl font-black text-[#7c2d12]">
        {prompt?.instructionSi || "වචනය බලලා කියන්න"}
      </p>
    </section>
  );
}

export default PromptCard;
