/*
 * FILE PURPOSE
 * Reusable tutorial video board shown before each improvement attempt.
 *
 * HOW IT CONNECTS
 * ActivityScreen passes gameType, levelNumber, videoUrl, language and onSkipAndPlay. gameConfig
 * selects the URL; presentation formats YouTube embeds.
 * Direct source importers: ../improvement/ActivityScreen.jsx.
 * Local feature/style dependencies: ../logic/presentation.js, ../config/gameConfig.js,
 * ../styles/howToPlay.css.
 *
 * THINGS TO REMEMBER
 * watching selects poster or player; playbackKey remounts the player to replay. Both YouTube and local
 * video URLs are supported. Skip & Play calls the parent start function; tutorial viewing is not
 * persisted as videoWatched here. howToPlay.css styles the board and controls.
 */

import { useState } from "react";
// VIVA: Tutorial board with video/poster, replay and Skip & Play controls.
import { ArrowRight, Play } from "lucide-react";
import { formatYouTubeEmbedUrl } from "../logic/presentation";
import { getHowToPlayVideo } from "../config/gameConfig";
import "../styles/howToPlay.css";

const POSTER = "/images/workingMemory/shared/backgrounds/how-to-play/video-poster.webp";
/*
 * FUNCTION / COMPONENT: HowToPlay
 * React renders this component when its parent uses <HowToPlay /> or when its state/props change.
 * INPUT PROPS: { gameType, levelNumber, videoUrl, onSkipAndPlay, language }. These values/callbacks
 * come from the parent; defaults apply when omitted.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export default function HowToPlay({ gameType, levelNumber, videoUrl, onSkipAndPlay, language }) {
  // VIVA: Configuration resolves the tutorial URL. watching/playbackKey control
  // media presentation only; Skip & Play starts the attempt through the parent.
  /*
   * REMEMBER: watching
   * Whether the tutorial player replaces its poster. Watch Video turns it on; a local video error can
   * return to the poster.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [watching, setWatching] = useState(false);
  /*
   * REMEMBER: playbackKey
   * Replay counter used as a React key so Watch Video recreates and restarts the player.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [playbackKey, setPlaybackKey] = useState(0);
  const si = language?.startsWith("si");
  const source = getHowToPlayVideo(gameType, levelNumber, language, videoUrl);
  const youtube = /(?:youtube\.com|youtu\.be)/i.test(source);
  /*
   * FUNCTION: watch
   * Start or replay the tutorial video.
   * WHEN: The tutorial poster and Watch Video controls call this.
   * HOW / RESULT: Increments playbackKey and shows the player only when a URL is available.
   */
  const watch = () => {
    if (!source) return;
    setPlaybackKey(key => key + 1);
    setWatching(true);
  };
  const embed = youtube ? `${formatYouTubeEmbedUrl(source)}&autoplay=1&playsinline=1` : "";
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <>
    {/* VIVA: Tutorial mascot and illustrated how-to-play board are here. */}
    <img className="lx-tutorial-bunny" src="/images/workingMemory/shared/bunny/bunny.webp" alt="" />
    <section className="lx-howto-board lx-video-howto" aria-labelledby="lx-howto-heading">
      <h1 id="lx-howto-heading" className="lx-howto-title">{si ? "ක්‍රීඩා කරන ආකාරය" : "HOW TO PLAY"}</h1>
      {/* VIVA: The poster switches to an embedded YouTube or local video player. */}
      <div id="lx-howto-player" className="lx-howto-video-frame" aria-label={si ? "ක්‍රීඩා උපදෙස් වීඩියෝව" : "How to play video"}>{/* UI SECTION: Tutorial media area: poster, embedded YouTube player or local video according to state and URL. */}
        {watching ? youtube ? <iframe key={playbackKey} src={embed} title={si ? "ක්‍රීඩා උපදෙස් වීඩියෝව" : "How to play video"} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : <video key={playbackKey} src={source} poster={POSTER} controls autoPlay playsInline onError={() => setWatching(false)} /> : <>
          <img className="lx-howto-poster" src={POSTER} alt="" />
          <button className="lx-howto-poster-play" type="button" onClick={watch} disabled={!source} aria-label={si ? "උපදෙස් වීඩියෝව ධාවනය කරන්න" : "Play tutorial video"}><Play fill="white" aria-hidden="true" /></button>
        </>}
      </div>
      {/* VIVA: Watch Video replays the tutorial; Skip & Play starts the activity. */}
      <div className="lx-howto-reference-actions">{/* UI SECTION: Tutorial actions: replay the video or call the parent to start the attempt. */}
        <button className="lx-howto-watch" type="button" onClick={watch} disabled={!source} aria-controls="lx-howto-player"><Play fill="white" aria-hidden="true" />{si ? "වීඩියෝව බලන්න" : "Watch Video"}</button>
        <button className="lx-howto-skip" type="button" onClick={onSkipAndPlay}>{si ? "මඟහැර ක්‍රීඩා කරන්න" : "Skip & Play"}<ArrowRight aria-hidden="true" /></button>
      </div>
    </section>
  </>;
}
