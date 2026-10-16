import React, { useRef, useState } from "react";
import { formatYouTubeEmbedUrl } from "../utils/helpers";
import { getWorkingMemoryThemeAssets } from "../utils/themeAssets";

const THEMES = {
  1: { primary: "#F28C28", light: "#FFF0D5", dark: "#B9530B", title: "#7A3C08" },
  2: { primary: "#4DAE58", light: "#EAF8E8", dark: "#267735", title: "#246B31" },
  3: { primary: "#E56F9D", light: "#FCE8F0", dark: "#AD3F6B", title: "#96365E" },
  4: { primary: "#873CB7", light: "#E7D8F0", dark: "#642B91", title: "#642B91" },
};

const GAME_TITLES = {
  pattern: "Pattern Game",
  words: "Picture Memory Game",
  instructions: "Instruction-Following Game",
  numbers: "Number Memory Game",
};

const isYouTubeUrl = (url = "") => /(?:youtube\.com|youtu\.be)/i.test(url);
const addAutoplay = (url) => `${url}${url.includes("?") ? "&" : "?"}autoplay=1`;

// Layout tuned against the 1536×1024 reference board — proportional across levels.
const HOW_TO_BOARD_ASPECT = "3 / 2";
const HOW_TO_BOARD_MAX_WIDTH = 1050;
const HOW_TO_BOARD_MAX_HEIGHT = 700;
const HOW_TO_VIEWPORT_GUTTER = 96;
const HOW_TO_BUNNY_LEFT = "-21%";
const HOW_TO_BUNNY_BOTTOM = "-12%";
const HOW_TO_BUNNY_WIDTH = "41.5%";

export default function HowToPlayScreen({ levelNumber, gameType, videoUrl, videoTitle, bunnyImage, onWatchVideo, onSkipAndPlay, language }) {
  const videoRef = useRef(null);
  const [mediaKey, setMediaKey] = useState(0);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const isSinhala = language?.startsWith("si");
  const theme = THEMES[1];
  const youtube = isYouTubeUrl(videoUrl);
  const embedUrl = youtube ? formatYouTubeEmbedUrl(videoUrl) : "";
  const title = videoTitle || GAME_TITLES[gameType] || "Working Memory Game";
  const boardImage = getWorkingMemoryThemeAssets(levelNumber).howToBoard;
  const themeVariables = {
    "--how-primary": theme.primary,
    "--how-light": theme.light,
    "--how-dark": theme.dark,
    "--how-title": theme.title,
    "--how-board-image": `url('${boardImage}')`,
  };

  const watchVideo = () => {
    onWatchVideo?.();
    if (youtube) {
      setShouldAutoplay(true);
      setMediaKey((key) => key + 1);
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => undefined);
    }
  };

  const skipAndPlay = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setShouldAutoplay(false);
    setMediaKey((key) => key + 1);
    onSkipAndPlay();
  };

  return (
    <main className="how-video-screen" style={themeVariables}>
      <section className="how-video-board" aria-label={isSinhala ? "ක්‍රීඩා කරන ආකාරය" : "How to play"}>
        <h1 className="how-video-title">{isSinhala ? "ක්‍රීඩා කරන ආකාරය" : "HOW TO PLAY"}</h1>
        <div className="how-video-board__content">
          <div className="how-video-player">
            {videoUrl ? youtube ? (
              <iframe key={mediaKey} src={shouldAutoplay ? addAutoplay(embedUrl) : embedUrl} title={`${title} tutorial video`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : (
              <video key={mediaKey} ref={videoRef} src={videoUrl} title={`${title} tutorial video`} controls playsInline preload="metadata" />
            ) : (
              <div className="how-video-placeholder" role="status"><span aria-hidden="true">▶</span><strong>{isSinhala ? "වීඩියෝව ඉක්මනින් ලබා ගත හැක" : "Video coming soon"}</strong></div>
            )}
          </div>

          <div className="how-video-actions">
            <button type="button" className="how-video-watch" onClick={watchVideo} disabled={!videoUrl} aria-label={isSinhala ? "වීඩියෝව බලන්න" : "Watch tutorial video"}>
              <span className="how-video-btn-icon" aria-hidden="true">▶</span>
              <strong>{isSinhala ? "වීඩියෝව බලන්න" : "Watch Video"}</strong>
            </button>
            <button type="button" className="how-video-skip" onClick={skipAndPlay} aria-label={isSinhala ? "වීඩියෝව මඟහැර ක්‍රීඩා කරන්න" : "Skip video and play"}>
              <strong>{isSinhala ? "මඟහැර ක්‍රීඩා කරන්න" : "Skip & Play"}</strong>
              <span className="how-video-btn-icon" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        {bunnyImage && <img className="how-video-bunny" src={bunnyImage} alt="" />}
      </section>

      <style>{`
        .how-video-screen{
          position:relative;z-index:10;flex:1;min-height:0;width:100%;
          display:flex;align-items:center;justify-content:center;
          padding:clamp(8px,1.5vw,20px) clamp(10px,2vw,28px);
          overflow:hidden;box-sizing:border-box;
          --how-board-max-width:${HOW_TO_BOARD_MAX_WIDTH}px;
          --how-board-max-height:${HOW_TO_BOARD_MAX_HEIGHT}px;
          --how-viewport-gutter:${HOW_TO_VIEWPORT_GUTTER}px;
          --how-content-width:80%;
          --how-y-inset:9%;
        }
        .how-video-board{
          position:relative;flex:0 0 auto;margin:auto;box-sizing:border-box;
          isolation:isolate;overflow:visible;
          aspect-ratio:${HOW_TO_BOARD_ASPECT};
          width:min(var(--how-board-max-width),56vw,calc((100dvh - var(--how-viewport-gutter)) * 1.5));
          max-height:min(var(--how-board-max-height),calc(100dvh - var(--how-viewport-gutter)));
          background:var(--how-board-image) center/100% 100% no-repeat;
        }
        .how-video-title{
          position:absolute;z-index:3;top:3.4%;left:50%;
          transform:translateX(-50%) translateY(7%);
          width:min(46%,420px);height:12%;margin:0;padding:0.18em 0.75em 0.1em;
          display:flex;align-items:center;justify-content:center;
          color:var(--how-title);font-size:clamp(1rem,1.75vw,1.65rem);font-weight:900;
          line-height:1;letter-spacing:0.02em;text-align:center;text-transform:uppercase;
          text-shadow:0 2px 0 rgba(255,255,255,.3);box-sizing:border-box;
        }
        .how-video-board__content{
          position:absolute;z-index:2;
          top:calc(3.4% + 12% + var(--how-y-inset));
          right:10%;bottom:var(--how-y-inset);left:10%;
          display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
          gap:clamp(14px,1.6vw,20px);box-sizing:border-box;
        }
        .how-video-player{
          width:var(--how-content-width);max-width:760px;aspect-ratio:16/9;flex:0 0 auto;
          overflow:hidden;border:clamp(3px,.4vw,5px) solid var(--how-primary);
          border-radius:clamp(10px,1vw,15px);background:#172033;box-sizing:border-box;
        }
        .how-video-player iframe,.how-video-player video{display:block;width:100%;height:100%;border:0;object-fit:contain;background:#000}
        .how-video-placeholder{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#fff;background:#334155;text-align:center}.how-video-placeholder span{display:grid;place-items:center;width:56px;height:56px;padding-left:4px;border-radius:50%;background:var(--how-primary);font-size:1.45rem}
        .how-video-actions{
          width:var(--how-content-width);max-width:760px;display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch;
          gap:clamp(18px,2vw,24px);
        }
        .how-video-actions button{
          width:100%;min-width:0;min-height:max(44px,3rem);height:100%;
          display:inline-flex;align-items:center;justify-content:center;
          gap:0.45em;padding:0.65em clamp(14px,1.5vw,22px);
          color:#fff;background:var(--how-primary);border:3px solid var(--how-dark);
          border-radius:14px;font-size:clamp(1.125rem,1.35vw,1.15rem);font-weight:900;
          letter-spacing:0;line-height:1;cursor:pointer;box-shadow:0 4px 0 var(--how-dark);
          box-sizing:border-box;
        }
        .how-video-actions .how-video-btn-icon{
          display:inline-flex;align-items:center;justify-content:center;
          font-size:1em;line-height:1;flex-shrink:0;
        }
        .how-video-actions button strong{
          display:inline-flex;align-items:center;line-height:1;font-weight:900;
        }
        .how-video-actions button:hover{filter:brightness(1.06)}
        .how-video-actions button:focus-visible{outline:4px solid #fff;box-shadow:0 0 0 7px var(--how-dark)}
        .how-video-actions button:disabled{cursor:not-allowed;opacity:.55}
        .how-video-actions .how-video-skip{
          color:var(--how-dark)!important;background:var(--how-light)!important;
          border-color:var(--how-primary)!important;box-shadow:0 4px 0 var(--how-primary)!important;
        }
        .how-video-actions .how-video-skip:hover{filter:brightness(1.03)}
        .how-video-bunny{
          position:absolute;z-index:4;left:${HOW_TO_BUNNY_LEFT};bottom:${HOW_TO_BUNNY_BOTTOM};
          width:${HOW_TO_BUNNY_WIDTH};height:auto;object-fit:contain;pointer-events:none;
        }
        @media(max-width:900px){
          .how-video-board{width:min(84vw,calc((100dvh - var(--how-viewport-gutter)) * 1.5))}
          .how-video-board__content{right:9.5%;left:9.5%;--how-y-inset:9%}
        }
        @media(max-width:620px){
          .how-video-screen{padding-inline:clamp(6px,2vw,12px);overflow-y:auto}
          .how-video-board{width:min(96vw,calc((100dvh - var(--how-viewport-gutter)) * 1.5))}
          .how-video-title{font-size:clamp(.9rem,3.2vw,1.05rem);width:min(52%,360px)}
          .how-video-board__content{right:8%;left:8%;gap:clamp(10px,2vw,14px);--how-content-width:84%;--how-y-inset:8.5%}
          .how-video-actions{gap:clamp(12px,3vw,18px)}
          .how-video-actions button{
            min-height:44px;padding:0.55em clamp(8px,2vw,14px);
            font-size:clamp(1rem,2.9vw,1.0625rem);
          }
        }
      `}</style>
    </main>
  );
}
