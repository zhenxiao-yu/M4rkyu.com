"use client";

import { useEffect } from "react";

/**
 * Root-level error boundary — the last line of defense. Unlike
 * `[locale]/error.tsx`, this catches failures in the root layout itself, so
 * it renders *outside* every provider: no next-intl, no theme, and no
 * guarantee the global stylesheet loaded. It therefore declares its own
 * `<html>`/`<body>` and is fully self-contained — all styling lives in the
 * scoped `<style>` block below (no Tailwind tokens, no CSS-var dependency).
 * English-only by necessity (the locale provider lives above this node).
 *
 * Presented as an "M4RKYU.SYS" phosphor fault console to match the site's
 * HUD/terminal voice (cf. the `system fault / unhandled` register on
 * `[locale]/error.tsx`). Every animation is gated behind
 * `prefers-reduced-motion`. Recovery is a full reload / hard navigation
 * rather than a router-level retry, because the router context may itself
 * be gone.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error("[M4RKYU.SYS] root error", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="ge-root">
        <style>{CSS}</style>

        {/* Decorative atmosphere — all inert / aria-hidden. */}
        <div className="ge-grid" aria-hidden="true" />
        <div className="ge-scan" aria-hidden="true" />
        <div className="ge-vignette" aria-hidden="true" />

        <main className="ge-shell">
          <section className="ge-panel">
            <div className="ge-titlebar" aria-hidden="true">
              <span className="ge-leds">
                <i />
                <i />
                <i />
              </span>
              <span className="ge-titletext">M4RKYU.SYS</span>
              <span className="ge-fault">Fault</span>
            </div>

            <div className="ge-content">
              <p className="ge-eyebrow">
                <span className="ge-pulse" aria-hidden="true" />
                Signal lost
              </p>

              <h1 className="ge-title">The archive dropped a frame.</h1>

              <p className="ge-sub">
                Something failed before the page could load. A reload usually
                clears it.
              </p>

              {/* Console flavour — purely decorative; the accessible recovery
                * path is the buttons + the labelled fault reference below. */}
              <pre className="ge-console" aria-hidden="true">
                <span className="ge-cline">
                  <span className="ge-prompt">&gt;</span> boot m4rkyu.sys
                </span>
                <span className="ge-cline ge-amber">
                  panic: render halted before first paint
                </span>
                <span className="ge-cline">
                  <span className="ge-prompt">&gt;</span> recovery
                  <span className="ge-cursor">▮</span>
                </span>
              </pre>

              {error.digest ? (
                <p className="ge-ref">
                  <span className="ge-reflabel">Ref</span>
                  <span className="ge-refcode">{error.digest}</span>
                </p>
              ) : null}

              <div className="ge-actions">
                <button
                  type="button"
                  className="ge-btn ge-btn-primary"
                  onClick={() => window.location.reload()}
                >
                  Reload
                </button>
                {/* Hard document navigation, not next/link: in a root-layout
                  * crash the router context may be unavailable, so force a
                  * full load back to the locale-negotiating root. */}
                <button
                  type="button"
                  className="ge-btn ge-btn-ghost"
                  onClick={() => window.location.assign("/")}
                >
                  Return home
                </button>
              </div>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}

// Self-contained styles. Inline because globals.css is not guaranteed here.
// Unique `ge-` prefix avoids any collision; literal values only (no CSS vars).
const CSS = `
*{box-sizing:border-box}
.ge-root{
  margin:0;min-height:100dvh;position:relative;overflow:hidden;
  display:grid;place-items:center;padding:1.5rem;
  background:#070706;color:#ece6d8;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;
}
.ge-grid,.ge-scan,.ge-vignette{position:fixed;inset:0;pointer-events:none}
.ge-grid{
  background-image:
    linear-gradient(rgba(255,176,0,.05) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,176,0,.05) 1px,transparent 1px);
  background-size:46px 46px;opacity:.6;
  -webkit-mask-image:radial-gradient(circle at 50% 40%,#000 0%,transparent 78%);
  mask-image:radial-gradient(circle at 50% 40%,#000 0%,transparent 78%);
  animation:ge-flicker 5s steps(40) infinite;
}
.ge-scan{
  background:repeating-linear-gradient(0deg,transparent 0 2px,rgba(0,0,0,.22) 2px 3px);
  opacity:.5;animation:ge-drift 7s linear infinite;
}
.ge-vignette{background:radial-gradient(120% 100% at 50% 28%,transparent 42%,rgba(0,0,0,.6) 100%)}
@keyframes ge-drift{from{background-position:0 0}to{background-position:0 9px}}
@keyframes ge-flicker{0%,100%{opacity:.6}48%{opacity:.6}50%{opacity:.5}52%{opacity:.62}54%{opacity:.55}}
@keyframes ge-blink{0%,48%{opacity:1}50%,100%{opacity:0}}
@keyframes ge-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes ge-pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(255,176,0,.5)}50%{opacity:.45;box-shadow:0 0 0 5px rgba(255,176,0,0)}}

.ge-shell{position:relative;width:100%;max-width:34rem;animation:ge-rise .5s cubic-bezier(.2,.7,.2,1) both}
.ge-panel{
  position:relative;border:1px solid #2a2822;border-radius:13px;overflow:hidden;
  background:linear-gradient(180deg,rgba(22,21,17,.72),rgba(11,10,8,.72));
  box-shadow:0 30px 90px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.03);
}
.ge-titlebar{
  display:flex;align-items:center;gap:.65rem;padding:.62rem .95rem;
  border-bottom:1px solid #211f1a;background:rgba(255,176,0,.03);
  font-size:.6rem;letter-spacing:.22em;text-transform:uppercase;color:#8c887c;
}
.ge-leds{display:inline-flex;gap:.34rem}
.ge-leds i{width:.44rem;height:.44rem;border-radius:50%;background:#2c2a24}
.ge-leds i:first-child{background:#ffb000;box-shadow:0 0 7px #ffb000}
.ge-titletext{color:#b9b4a6}
.ge-fault{margin-left:auto;color:#ffb000;font-weight:700;letter-spacing:.3em}
.ge-content{padding:1.95rem 1.65rem 1.75rem}
.ge-eyebrow{margin:0;display:inline-flex;align-items:center;gap:.5rem;font-size:.62rem;letter-spacing:.34em;text-transform:uppercase;color:#8c887c}
.ge-pulse{width:.5rem;height:.5rem;border-radius:50%;background:#ffb000;display:inline-block;animation:ge-pulse 1.8s ease-in-out infinite}
.ge-title{
  margin:1.15rem 0 0;font-size:clamp(2rem,7vw,3.25rem);line-height:1.05;
  font-weight:700;letter-spacing:-.01em;color:#f4efe4;
  text-shadow:0 0 22px rgba(255,176,0,.26),1.5px 0 rgba(255,64,64,.2),-1.5px 0 rgba(64,196,255,.18);
}
.ge-sub{margin:1.05rem 0 0;max-width:42ch;font-size:.9rem;line-height:1.65;color:#b3afa3}
.ge-console{
  margin:1.5rem 0 0;padding:.85rem 1rem;border:1px solid #211f1a;border-radius:8px;
  background:rgba(0,0,0,.34);font-size:.74rem;line-height:1.75;color:#9b9788;
  white-space:pre-wrap;word-break:break-word;font-family:inherit;
}
.ge-cline{display:block}
.ge-amber{color:#ffb000}
.ge-prompt{color:#b8780a}
.ge-cursor{display:inline-block;width:.55ch;height:1em;margin-left:.15rem;vertical-align:-.12em;background:#ffb000;animation:ge-blink 1.05s steps(1) infinite}
.ge-ref{
  margin:1.25rem 0 0;display:inline-flex;align-items:center;gap:.55rem;
  padding:.42rem .72rem;border:1px solid #2a2822;border-radius:6px;background:rgba(0,0,0,.3);
  font-size:.64rem;letter-spacing:.16em;text-transform:uppercase;color:#8c887c;
}
.ge-refcode{color:#ece6d8;letter-spacing:.08em}
.ge-actions{margin:1.85rem 0 0;display:flex;flex-wrap:wrap;gap:.7rem}
.ge-btn{
  appearance:none;cursor:pointer;font:inherit;font-size:.82rem;letter-spacing:.02em;
  padding:.74rem 1.45rem;border-radius:7px;border:1px solid transparent;
  transition:transform .15s cubic-bezier(.2,.7,.2,1),background-color .15s,border-color .15s,color .15s,box-shadow .15s;
}
.ge-btn:active{transform:translateY(1px)}
.ge-btn-primary{background:#ffb000;color:#0a0805;border-color:#ffb000;font-weight:700;box-shadow:0 0 24px rgba(255,176,0,.22)}
.ge-btn-primary:hover{background:#ffc23d;box-shadow:0 0 32px rgba(255,176,0,.4);transform:translateY(-1px)}
.ge-btn-ghost{background:transparent;color:#ece6d8;border-color:#3a382f}
.ge-btn-ghost:hover{border-color:#ffb000;color:#fff;transform:translateY(-1px)}
.ge-btn:focus-visible{outline:2px solid #ffb000;outline-offset:3px}

@media (max-width:480px){.ge-content{padding:1.55rem 1.2rem 1.4rem}}
@media (prefers-reduced-motion:reduce){
  .ge-grid,.ge-scan,.ge-shell,.ge-pulse,.ge-cursor,.ge-btn{animation:none!important;transition:none!important}
  .ge-cursor{opacity:1}
}
`;
