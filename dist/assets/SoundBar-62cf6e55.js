import{s as c,m as l,W as f,r as n,a as i,j as g}from"./index-784aae70.js";import{a as x}from"./index.esm-d8d07341.js";import"./iconBase-bc493976.js";const y="/assets/Human Music-65a9a00c.mp3",b="/assets/There Is a Light That Never Goes Out (2011 Remaster)-ecf215ee.mp3",k="/assets/Out of Tune-b51c4aae.mp3",v="/assets/Rick Astley - Never Gonna Give You Up (Official Music Video)-f2671541.mp3",$="/assets/Pinegrove - Angelina-72d7eb56.mp3",C=c.div`
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
    left: 1rem;
    top: 5rem;
    scale: 0.9;
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
    height: 0.5rem;
    width: 2px;
    margin: 0 0.1rem;
  `};
`,j=c.button`
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
`,N=()=>{const[e,r]=n.useState(!0),[d,h]=n.useState(0),t=n.useRef(null),o=n.useMemo(()=>[y,b,k,v,$],[]),m=n.useCallback(s=>{t.current&&(t.current.pause(),t.current.currentTime=0,t.current.volume=.1,t.current.src=o[s],t.current.play().then(()=>{r(!0)}).catch(a=>{console.warn("Playback failed:",a),r(!1)}))},[o]);n.useEffect(()=>{m(d)},[d,m]),n.useEffect(()=>{const s=t.current,a=()=>u();if(s)return s.addEventListener("ended",a),()=>{s.removeEventListener("ended",a)}},[]);const p=n.useCallback(()=>{e?(t.current.pause(),r(!1)):(t.current.play(),r(!0))},[e]),u=n.useCallback(()=>{h(s=>(s+1)%o.length)},[o.length]);return i("div",{children:g(C,{onClick:p,children:[Array.from({length:9}).map((s,a)=>i(S,{click:e},a)),i("audio",{ref:t,loop:!1}),i(j,{onClick:u,children:i(x,{})})]})})};export{N as default};
