LexiLand · Working Memory — run it on localhost
================================================

The screens load their pictures and code over HTTP, so open them through a
small local web server (double-clicking the files will not work).

1. Unzip this folder.
2. Open a terminal inside the "lexiland" folder.
3. Start a server with ONE of these:
     python3 -m http.server 8000        (Mac / Linux)
     py -m http.server 8000             (Windows)
     npx serve -l 8000                  (if you have Node.js)
4. Open http://localhost:8000 in Chrome, Edge or Safari.
5. Pick a level and a game. Press F11 (or Ctrl+Cmd+F on Mac) for full screen.

Every game screen is designed on a 16:9 stage (1600 x 900) and scales to fit
the browser window, so it keeps the same proportions on 1366x768, 1440x900,
1536x864, 1920x1080 and other laptop screens. The background always fills the
whole window.

Fonts come from Google Fonts, so an internet connection gives the best look.
