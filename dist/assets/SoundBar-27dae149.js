import{s as c,m as l,W as f,r as a,b as i,a as x}from"./index-d572a681.js";import{a as g}from"./index.esm-ce2f6a57.js";import"./iconBase-1d44ea2e.js";const y="/assets/Pinegrove - Angelina-72d7eb56.mp3",b="/assets/There Is a Light That Never Goes Out (2011 Remaster)-ecf215ee.mp3",v="/assets/Out of Tune-b51c4aae.mp3",k="/assets/Rick Astley - Never Gonna Give You Up (Official Music Video)-f2671541.mp3",$=c.div`
  display: flex;
  cursor: pointer;
  position: fixed;
  left: 8rem;
  top: 2.6rem;
  z-index: 10;

  & > *:nth-child(1) { animation-delay: 0.2s; }
  & > *:nth-child(2) { animation-delay: 0.3s; }
  & > *:nth-child(3) { animation-delay: 0.4s; }
  & > *:nth-child(4) { animation-delay: 0.5s; }
  & > *:nth-child(5) { animation-delay: 0.6s; }
  & > *:nth-child(6) { animation-delay: 0.7s; }
  & > *:nth-child(7) { animation-delay: 0.8s; }
  & > *:nth-child(8) { animation-delay: 0.9s; }
  & > *:nth-child(9) { animation-delay: 1s; }

  ${l(40)`
      left:1rem;
      top:5rem;
      scale:0.9;
  `};
`,E=f`
  0% { transform: scaleY(1); }
  50% { transform: scaleY(2); }
  100% { transform: scaleY(1); }
`,S=c.span`
  background: ${e=>e.theme.text};
  border: 1px solid ${e=>e.theme.body};
  animation: ${E} 1s ease infinite;
  animation-play-state: ${e=>e.click?"running":"paused"};
  height: 1rem;
  width: 3px;
  margin: 0 0.15rem;

  ${l(40)`
      height:0.5rem;
      width: 2px;
      margin: 0 0.1rem;
  `};
`,C=c.button`
  position: fixed;
  left: 14.5rem;
  top: 2rem;
  cursor: pointer;
  background: ${e=>e.theme.body};
  color: ${e=>e.theme.text};
  border: 4px solid ${e=>e.theme.text};
  padding: 9px;
  scale: 1.1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  // &:hover {
  //   scale: 1.4;
  //   transition: all 0.3s ease-in-out;
  // }

  ${l(40)`
      left: 0.7rem;
      top: 1.8rem;
      scale: 1.1;
      padding: 5px;
  `};

  svg {
    width: 16px;
    height: 16px;
  }
`,N=()=>{const[e,r]=a.useState(!0),[o,u]=a.useState(0),d=[y,b,v,k],t=a.useRef(null);a.useEffect(()=>{h(o)},[o]),a.useEffect(()=>{const n=t.current;if(n){const s=()=>{m()};return n.addEventListener("ended",s),()=>{n.removeEventListener("ended",s)}}},[o]);const h=n=>{t.current&&(t.current.pause(),t.current.currentTime=0,t.current.volume=.1),t.current.src=d[n],t.current.play().then(()=>{r(!0)}).catch(s=>{console.warn("Playback failed:",s),r(!1)})},p=()=>{e?(t.current.pause(),r(!1)):(t.current.play(),r(!0))},m=()=>{const n=(o+1)%d.length;u(n)};return i("div",{children:x($,{onClick:p,children:[Array.from({length:9}).map((n,s)=>i(S,{click:e},s)),i("audio",{ref:t,loop:!1}),i(C,{onClick:m,children:i(g,{})})]})})};export{N as default};
