import { UI } from "../utils/memoryTheme";
import { useEffect, useRef, useState } from "react";
import { MemoryBunny, MemoryButton } from "./MemoryUI";
import { formatYouTubeEmbedUrl } from "../utils/helpers";

const COPY = {
  pattern: ["Look at the pattern. Tap the picture that comes next.", "රටාව බලන්න. ඊළඟට පැමිණෙන පින්තූරය තෝරන්න."],
  words: ["Tap Ready to see the pictures. Remember their order, then put them back in the same order.", "පින්තූර බැලීමට සූදානම් බොත්තම ඔබන්න. අනුපිළිවෙල මතක තබා එම පිළිවෙලට තබන්න."],
  instructions: ["Tap Listen and remember the steps. When the audio finishes, show the question and choose your answer.", "සවන් දෙන්න බොත්තම ඔබා පියවර මතක තබා ගන්න. අවසානයේ ප්‍රශ්නය බලා පිළිතුර තෝරන්න."],
  numbers: ["Look at the numbers and remember the order. When they disappear, use the number pad to enter your answer.", "අංක බලා අනුපිළිවෙල මතක තබා ගන්න. අංක නොපෙනෙන විට ඔබේ පිළිතුර ඇතුළත් කරන්න."],
};
export default function HowToPlayScreen({ gameType, videoUrl, onWatchVideo, onSkipAndPlay, language }) {
  const [watching, setWatching] = useState(false);
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!watching) return;
    const previous = document.activeElement;
    dialogRef.current?.querySelector("button")?.focus();
    const onKey = event => {
      if (event.key === "Escape") setWatching(false);
      if (event.key !== "Tab") return;
      const controls = [...dialogRef.current.querySelectorAll("iframe,video,button")];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [watching]);
  const si = language?.startsWith("si");
  const icons = gameType === "numbers" ? ["c-orange", "c-blue", "c-green"] : gameType === "pattern" ? ["carrot", "flower", "carrot", "flower"] : ["apple", "leaf", "star"];
  return <>
    <MemoryBunny message={si ? "අපි එකට ක්‍රීඩා කරමු!" : "Let's learn how to play!"} />
    <section className="lx-howto-board" aria-label={si ? "ක්‍රීඩා කරන ආකාරය" : "How to play"}>
      <h1 className="lx-howto-title">{si ? "ක්‍රීඩා කරන ආකාරය" : "HOW TO PLAY"}</h1>
      <div className="lx-howto-art" aria-hidden="true">{icons.map((name, i) => <img key={i} src={`${UI}/icons/${name}.svg`} alt="" />)}</div>
      <p className="lx-howto-text">{COPY[gameType]?.[si ? 1 : 0]}</p>
      <div className="lx-actions"><MemoryButton variant="play" onClick={onSkipAndPlay}>{si ? "ක්‍රීඩා කරමු" : "Let's Play"}</MemoryButton>{videoUrl && <MemoryButton variant="secondary" onClick={() => { onWatchVideo?.(); setWatching(true); }}>{si ? "වීඩියෝව බලන්න" : "Watch Video"}</MemoryButton>}</div>
    </section>
    {watching && <section ref={dialogRef} className="lx-howto-video-wrap" role="dialog" aria-modal="true" aria-label="Tutorial video">
      {/youtube\.com|youtu\.be/i.test(videoUrl) ? <iframe src={formatYouTubeEmbedUrl(videoUrl)} title="Tutorial video" allow="autoplay; encrypted-media" allowFullScreen /> : <video src={videoUrl} controls autoPlay playsInline />}
      <div className="lx-actions"><MemoryButton variant="secondary" onClick={() => setWatching(false)}>{si ? "වහන්න" : "Close video"}</MemoryButton><MemoryButton onClick={() => { setWatching(false); onSkipAndPlay(); }}>{si ? "ක්‍රීඩා කරමු" : "Let's Play"}</MemoryButton></div>
    </section>}
  </>;
}
