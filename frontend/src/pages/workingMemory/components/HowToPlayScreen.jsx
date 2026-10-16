import { useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { formatYouTubeEmbedUrl } from "../utils/helpers";
import { getHowToPlayVideo } from "../data/howToPlayVideos";
import "../styles/howToPlay.css";

const COPY = {
  pattern: ["Look at the pattern. Tap the picture that comes next.", "රටාව බලන්න. ඊළඟට පැමිණෙන පින්තූරය තෝරන්න."],
  words: ["Tap Ready to see the pictures. Remember their order, then put them back in the same order.", "පින්තූර බැලීමට සූදානම් බොත්තම ඔබන්න. අනුපිළිවෙල මතක තබා එම පිළිවෙලට තබන්න."],
  instructions: ["Tap Listen and remember the steps. When the audio finishes, show the question and choose your answer.", "සවන් දෙන්න බොත්තම ඔබා පියවර මතක තබා ගන්න. අවසානයේ ප්‍රශ්නය බලා පිළිතුර තෝරන්න."],
  numbers: ["Look at the numbers and remember the order. When they disappear, use the number pad to enter your answer.", "අංක බලා අනුපිළිවෙල මතක තබා ගන්න. අංක නොපෙනෙන විට ඔබේ පිළිතුර ඇතුළත් කරන්න."],
};
const POSTER = "/images/workingMemory/how-to-play/video-poster.webp";
export default function HowToPlayScreen({ gameType, levelNumber, videoUrl, onWatchVideo, onSkipAndPlay, language }) {
  const [watching, setWatching] = useState(false);
  const [playbackKey, setPlaybackKey] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const si = language?.startsWith("si");
  const source = getHowToPlayVideo(gameType, levelNumber, language, videoUrl);
  const youtube = /(?:youtube\.com|youtu\.be)/i.test(source);
  const watch = () => {
    if (!source) return;
    onWatchVideo?.();
    setVideoError(false);
    setPlaybackKey(key => key + 1);
    setWatching(true);
  };
  const embed = youtube ? `${formatYouTubeEmbedUrl(source)}&autoplay=1&playsinline=1` : "";
  return <>
    <img className="lx-tutorial-bunny" src="/images/workingMemory/ui/characters/bunny.webp" alt="" />
    <section className="lx-howto-board lx-video-howto" aria-labelledby="lx-howto-heading">
      <h1 id="lx-howto-heading" className="lx-howto-title">{si ? "ක්‍රීඩා කරන ආකාරය" : "HOW TO PLAY"}</h1>
      <p className="lx-howto-text">{COPY[gameType]?.[si ? 1 : 0]}</p>
      <div id="lx-howto-player" className="lx-howto-video-frame" aria-label={si ? "ක්‍රීඩා උපදෙස් වීඩියෝව" : "How to play video"}>
        {watching ? youtube ? <iframe key={playbackKey} src={embed} title={si ? "ක්‍රීඩා උපදෙස් වීඩියෝව" : "How to play video"} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : <video key={playbackKey} src={source} poster={POSTER} controls autoPlay playsInline onError={() => setVideoError(true)} /> : <>
          <img className="lx-howto-poster" src={POSTER} alt="" />
          <button className="lx-howto-poster-play" type="button" onClick={watch} disabled={!source} aria-label={si ? "උපදෙස් වීඩියෝව ධාවනය කරන්න" : "Play tutorial video"}><Play fill="white" aria-hidden="true" /></button>
        </>}
      </div>
      <div className="lx-howto-reference-actions">
        <button className="lx-howto-watch" type="button" onClick={watch} disabled={!source} aria-controls="lx-howto-player"><Play fill="white" aria-hidden="true" />{si ? "වීඩියෝව බලන්න" : "Watch Video"}</button>
        <button className="lx-howto-skip" type="button" onClick={onSkipAndPlay}>{si ? "මඟහැර ක්‍රීඩා කරන්න" : "Skip & Play"}<ArrowRight aria-hidden="true" /></button>
      </div>
      {(videoError || !source) && <p className="lx-howto-video-status" role="status">{si ? "වීඩියෝව දැන් ලබාගත නොහැක. මඟහැර ක්‍රීඩා කළ හැක." : "Video unavailable. You can skip and play."}</p>}
    </section>
  </>;
}
