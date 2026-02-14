import type { GameBundle } from "../../shared/src/types";

const SHARE_LINK_MARKER = "id=\"kgninja-share-link\"";
const HASHTAG = "#KGNINJA";

export function buildTweetIntentUrl(title: string): string {
  void title;
  const base = "I made a mini game with #KGNINJA";
  const repoUrl = (process.env.GITHUB_REPO_URL ?? "").trim();
  const text = repoUrl ? `${base} ${repoUrl}` : base;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function injectShareWidget(bundle: GameBundle, title: string): GameBundle {
  if (bundle.html.includes(SHARE_LINK_MARKER) && (bundle.html.includes(HASHTAG) || bundle.css.includes(HASHTAG) || bundle.js.includes(HASHTAG))) {
    return bundle;
  }

  const tweetUrl = buildTweetIntentUrl(title);
  const shareHtml = [
    `<div id="kgninja-share-root">`,
    `  <button id="kgninja-share-link" type="button" aria-label="Post on X with #KGNINJA">Post on X ${HASHTAG}</button>`,
    "</div>",
    "<script>",
    "(() => {",
    "  const btn = document.getElementById('kgninja-share-link');",
    `  const url = ${JSON.stringify(tweetUrl)};`,
    "  if (!btn) return;",
    "  btn.addEventListener('click', () => {",
    "    try {",
    "      window.parent.postMessage({ type: 'kgninja_tweet', url }, '*');",
    "    } catch (_err) {",
    "      window.location.href = url;",
    "    }",
    "  });",
    "})();",
    "</script>"
  ].join("\n");

  const shareCss = [
    "",
    "#kgninja-share-root {",
    "  position: fixed;",
    "  right: 12px;",
    "  bottom: 12px;",
    "  z-index: 2147483000;",
    "  font-family: Arial, sans-serif;",
    "}",
    "#kgninja-share-link {",
    "  display: inline-block;",
    "  background: #111827;",
    "  color: #ffffff;",
    "  border: 1px solid #ffffff55;",
    "  border-radius: 999px;",
    "  padding: 8px 12px;",
    "  font-size: 13px;",
    "  font-weight: 700;",
    "  cursor: pointer;",
    "}",
    "#kgninja-share-link:hover {",
    "  background: #000000;",
    "}"
  ].join("\n");

  return {
    html: `${bundle.html}\n${shareHtml}`,
    css: `${bundle.css}\n${shareCss}`,
    js: bundle.js
  };
}

export function assertHasRequiredHashtag(bundle: GameBundle): void {
  const hasLink = bundle.html.includes(SHARE_LINK_MARKER);
  const hasTag = bundle.html.includes(HASHTAG) || bundle.css.includes(HASHTAG) || bundle.js.includes(HASHTAG);
  if (!hasLink || !hasTag) {
    throw new Error("Generated game is missing required #KGNINJA share link.");
  }
}
