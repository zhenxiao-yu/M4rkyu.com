import{s as t,m as s,W as c,r as i,j as d,c as n}from"./index-ca4d20e1.js";const m="/assets/u-said-it-v13-1167-5ba755f1.mp3",h=t.div`
  display: flex;
  cursor: pointer;
  position: fixed;
  left: 8rem;
  top: 2.6rem;
  z-index: 10;

  & > *:nth-child(1) {
    animation-delay: 0.2s;
  }
  & > *:nth-child(2) {
    animation-delay: 0.3s;
  }
  & > *:nth-child(3) {
    animation-delay: 0.4s;
  }
  & > *:nth-child(4) {
    animation-delay: 0.5s;
  }
  & > *:nth-child(5) {
    animation-delay: 0.6s;
  }
  & > *:nth-child(6) {
    animation-delay: 0.7s;
  }
  & > *:nth-child(7) {
    animation-delay: 0.8s;
  }
  & > *:nth-child(8) {
    animation-delay: 0.9s;
  }
  & > *:nth-child(9) {
    animation-delay: 1s;
  }

  ${s(40)`
      left:1rem;
      top:5rem;
      scale:0.9;
  `};
`,p=c`
0%{
    transform:scaleY(1);
}
50%{
    transform:scaleY(2);
}
100%{
    transform:scaleY(1);
}
`,u=t.span`
  background: ${a=>a.theme.text};
  border: 1px solid ${a=>a.theme.body};
  animation: ${p} 1s ease infinite;
  animation-play-state: ${a=>a.click?"running":"paused"};
  height: 1rem;
  width: 3px;
  margin: 0 0.15rem;

  ${s(40)`
      height:0.5rem;
      width: 2px;
      margin: 0 0.1rem;
  `};
`,x=()=>{const[a,l]=i.useState(!1),r=()=>{l(!a),a?e.current.pause():e.current.play()},e=i.useRef(null);return d(h,{onClick:()=>r(),children:[Array.from({length:9}).map((f,o)=>n(u,{click:a},o)),n("audio",{src:m,ref:e,loop:!0})]})};export{x as default};
