import Script from "next/script";

/**
 * Apply the stored / system theme before first paint so dark-mode loads do
 * not flash light first. In Next 16 / React 19 the supported way to ship an
 * inline bootstrap from the root layout is `next/script` with
 * `beforeInteractive`, which keeps dev/test logs clean and runs before the
 * app hydrates.
 */
const BOOTSTRAP = `(function(){try{var d=document.documentElement;var s=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var r=(!s||s==='system')?m:s;d.setAttribute('data-theme',r);var P=['risograph','terminal','editorial'];var p=localStorage.getItem('palette');d.setAttribute('data-palette',P.indexOf(p)>=0?p:'risograph');}catch(e){}})()`;

export function ThemeScript() {
  return (
    // Next 16 supports this in the App Router root layout; the current
    // ESLint rule still carries the older pages-router-only assumption.
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script id="theme-bootstrap" strategy="beforeInteractive">
      {BOOTSTRAP}
    </Script>
  );
}
