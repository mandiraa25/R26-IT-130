import { useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { formatYouTubeEmbedUrl } from "../logic/presentation";
import { getHowToPlayVideo } from "../config/gameConfig";
import "../styles/howToPlay.css";

const POSTER = "/images/workingMemory/shared/backgrounds/how-to-play/video-poster.webp";
export default function HowToPlay({ gameType, levelNumber, videoUrl, onSkipAndPlay, language }) {
  const [watching, setWatching] = useState(false);
  const [playbackKey, setPlaybackKey] = useState(0);
  const si = language?.startsWith("si");
  const source = getHowToPlayVideo(gameType, levelNumber, language, videoUrl);
  const youtube = /(?:youtube\.com|youtu\.be)/i.test(source);
  const watch = () => {
    if (!source) return;
    setPlaybackKey(key => key + 1);
    setWatching(true);
  };
  const embed = youtube ? `${formatYouTubeEmbedUrl(source)}&autoplay=1&playsinline=1` : "";
  return <>
    <img className="lx-tutorial-bunny" src="/images/workingMemory/shared/bunny/bunny.webp" alt="" />
    <section className="lx-howto-board lx-video-howto" aria-labelledby="lx-howto-heading">
      <h1 id="lx-howto-heading" className="lx-howto-title">{si ? "ක්‍රීඩා කරන ආකාරය" : "HOW TO PLAY"}</h1>
      <div id="lx-howto-player" className="lx-howto-video-frame" aria-label={si ? "ක්‍රීඩා උපදෙස් වීඩියෝව" : "How to play video"}>
        {watching ? youtube ? <iframe key={playbackKey} src={embed} title={si ? "ක්‍රීඩා උපදෙස් වීඩියෝව" : "How to play video"} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : <video key={playbackKey} src={source} poster={POSTER} controls autoPlay playsInline onError={() => setWatching(false)} /> : <>
          <img className="lx-howto-poster" src={POSTER} alt="" />
          <button className="lx-howto-poster-play" type="button" onClick={watch} disabled={!source} aria-label={si ? "උපදෙස් වීඩියෝව ධාවනය කරන්න" : "Play tutorial video"}><Play fill="white" aria-hidden="true" /></button>
        </>}
      </div>
      <div className="lx-howto-reference-actions">
        <button className="lx-howto-watch" type="button" onClick={watch} disabled={!source} aria-controls="lx-howto-player"><Play fill="white" aria-hidden="true" />{si ? "වීඩියෝව බලන්න" : "Watch Video"}</button>
        <button className="lx-howto-skip" type="button" onClick={onSkipAndPlay}>{si ? "මඟහැර ක්‍රීඩා කරන්න" : "Skip & Play"}<ArrowRight aria-hidden="true" /></button>
      </div>
    </section>
  </>;
}
