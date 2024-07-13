import{g as X,j as U,r as c,s,m as r,a as m,b as t,W as A,_ as W,F as q,L as F,N as j}from"./index-d572a681.js";import{H as Z}from"./Helmet-96b1ff45.js";import{C as J}from"./AllSvgs-6435270f.js";import{P as K,B as Q,a as ee,b as te,c as ie,d as ne,F as oe}from"./index.esm-3367735e.js";import{G as ae}from"./iconBase-1d44ea2e.js";import{M as re}from"./index.esm-4274756a.js";import{m as y}from"./motion-ce1830e7.js";const se="/assets/self-portrait2-9634f572.png";var N={};const le=X(U);var V;Object.defineProperty(N,"__esModule",{value:!0});var D=le,p=c,u=function(){return u=Object.assign||function(e){for(var i,n=1,o=arguments.length;n<o;n++)for(var a in i=arguments[n])Object.prototype.hasOwnProperty.call(i,a)&&(e[a]=i[a]);return e},u.apply(this,arguments)};function ce(e,i){var n,o;switch(i.type){case"TYPE":return u(u({},e),{speed:i.speed,text:(n=i.payload)===null||n===void 0?void 0:n.substring(0,e.text.length+1)});case"DELAY":return u(u({},e),{speed:i.payload});case"DELETE":return u(u({},e),{speed:i.speed,text:(o=i.payload)===null||o===void 0?void 0:o.substring(0,e.text.length-1)});case"COUNT":return u(u({},e),{count:e.count+1});default:return e}}var R=function(e){var i=e.words,n=i===void 0?["Hello World!","This is","a simple Typewriter"]:i,o=e.loop,a=o===void 0?1:o,l=e.typeSpeed,h=l===void 0?80:l,d=e.deleteSpeed,f=d===void 0?50:d,$=e.delaySpeed,_=$===void 0?1500:$,v=e.onLoopDone,C=e.onType,b=e.onDelete,T=e.onDelay,z=p.useReducer(ce,{speed:h,text:"",count:0}),S=z[0],M=S.speed,x=S.text,I=S.count,w=z[1],E=p.useRef(0),k=p.useRef(!1),g=p.useRef(!1),P=p.useRef(!1),L=p.useRef(!1),H=p.useCallback(function(){var B=I%n.length,O=n[B];g.current?(w({type:"DELETE",payload:O,speed:f}),x===""&&(g.current=!1,w({type:"COUNT"}))):(w({type:"TYPE",payload:O,speed:h}),P.current=!0,x===O&&(w({type:"DELAY",payload:_}),P.current=!1,L.current=!0,setTimeout(function(){L.current=!1,g.current=!0},_),a>0&&(E.current+=1,E.current/n.length===a&&(L.current=!1,k.current=!0)))),P.current&&C&&C(E.current),g.current&&b&&b(),L.current&&T&&T()},[I,_,f,a,h,n,x,C,b,T]);return p.useEffect(function(){var B=setTimeout(H,M);return k.current&&clearTimeout(B),function(){return clearTimeout(B)}},[H,M]),p.useEffect(function(){v&&k.current&&v()},[v]),[x,{isType:P.current,isDelay:L.current,isDelete:g.current,isDone:k.current}]},de="styles-module_blinkingCursor__yugAC",me="styles-module_blinking__9VXRT";(function(e,i){i===void 0&&(i={});var n=i.insertAt;if(e&&typeof document<"u"){var o=document.head||document.getElementsByTagName("head")[0],a=document.createElement("style");a.type="text/css",n==="top"&&o.firstChild?o.insertBefore(a,o.firstChild):o.appendChild(a),a.styleSheet?a.styleSheet.cssText=e:a.appendChild(document.createTextNode(e))}})(".styles-module_blinkingCursor__yugAC{color:inherit;font:inherit;left:3px;line-height:inherit;opacity:1;position:relative;top:0}.styles-module_blinking__9VXRT{animation-duration:.8s;animation-iteration-count:infinite;animation-name:styles-module_blink__rqfaf}@keyframes styles-module_blink__rqfaf{0%{opacity:1}to{opacity:0}}");var Y=p.memo(function(e){var i=e.cursorBlinking,n=i===void 0||i,o=e.cursorStyle,a=o===void 0?"|":o,l=e.cursorColor,h=l===void 0?"inherit":l;return D.jsx("span",u({style:{color:h},className:"".concat(de," ").concat(n?me:"")},{children:a}))});N.Cursor=Y,V=N.Typewriter=function(e){var i=e.words,n=i===void 0?["Hello World!","This is","a simple Typewriter"]:i,o=e.loop,a=o===void 0?1:o,l=e.typeSpeed,h=l===void 0?80:l,d=e.deleteSpeed,f=d===void 0?50:d,$=e.delaySpeed,_=$===void 0?1500:$,v=e.cursor,C=v!==void 0&&v,b=e.cursorStyle,T=b===void 0?"|":b,z=e.cursorColor,S=z===void 0?"inherit":z,M=e.cursorBlinking,x=M===void 0||M,I=e.onLoopDone,w=e.onType,E=e.onDelay,k=e.onDelete,g=R({words:n,loop:a,typeSpeed:h,deleteSpeed:f,delaySpeed:_,onLoopDone:I,onType:w,onDelay:E,onDelete:k})[0];return D.jsxs(D.Fragment,{children:[D.jsx("span",{children:g}),C&&D.jsx(Y,{cursorStyle:T,cursorColor:S,cursorBlinking:x})]})},N.useTypewriter=R;function he(e){return ae({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{fill:"none",strokeWidth:"2",d:"M12,22 C12,22 4,16 4,10 C4,5 8,2 12,2 C16,2 20,5 20,10 C20,16 12,22 12,22 Z M12,13 C13.657,13 15,11.657 15,10 C15,8.343 13.657,7 12,7 C10.343,7 9,8.343 9,10 C9,11.657 10.343,13 12,13 L12,13 Z"}}]})(e)}const ue=s(y.section)`
  width: 55vw;
  display: flex;
  background: linear-gradient(
        to right,
        ${e=>e.theme.body} 50%,
        ${e=>e.theme.text} 50%
      )
      bottom,
    linear-gradient(
        to right,
        ${e=>e.theme.body} 50%,
        ${e=>e.theme.text} 50%
      )
      top;
  background-repeat: no-repeat;
  background-size: 100% 2px;
  border-left: 5px solid ${e=>e.theme.body};
  border-right: 5px solid ${e=>e.theme.text};
  z-index: 1;
  position: absolute;
  left: 50%;
  top: 50%;
  right: 0;
  transform: translate(-50%, -50%);

  ${r(1200)`
    width: 65vw;
  `};

  ${r(60)`
    width: 70vw;
  `};

  ${r(50)`
    width: 70vw;
    background-size: 100% 2px;
    flex-direction: column;
    justify-content: space-between;
  `};

  ${r(40)`
    width: 64vw;
  `};

  ${r(30)`
     width: 64vw;
  `};
  ${r(20)`
    width:60vw;
  `};

  @media only screen and (max-width: 50em) {
    background: none;
    border: none;
    border-top: 2px solid ${e=>e.theme.body};
    border-bottom: 2px solid ${e=>e.theme.text};
    background-image: linear-gradient(
        ${e=>e.theme.body} 50%,
        ${e=>e.theme.text} 50%
      ),
      linear-gradient(
        ${e=>e.theme.body} 50%,
        ${e=>e.theme.text} 50%
      );
    background-size: 2px 100%;
    background-position: 0 0, 100% 0;
    background-repeat: no-repeat;
  }
`,G=s.div`
  width: 50%;
  position: relative;
  display: flex;
  background: rgba(8, 9, 10, 0.2);
  box-shadow: 3px 4px 2px rgba(8, 9, 10, 0.1);
  backdrop-filter: blur(3.4px);
  -webkit-backdrop-filter: blur(3.4px);
    
  .pic {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 0%);
    width: 88%;
    height: auto;
  }
  ${r(50)`
    width: 100%;
    height: 50%;
    .pic {
      width: 90%;
    }
  `};

  ${r(40)`
    .pic {
      width: 90%;
    }
  `};

  ${r(30)`
    .pic {
      width: 100%;
    }
  `};

  ${r(20)`
    .pic {
      width: 50%;
    }
  `};
`,pe=s(y.article)`
  font-size: calc(1rem + 1.5vw);
  color: ${e=>e.theme.body};
  padding: 2.5rem;
  cursor: pointer;
  display: flex;
  z-index: 2;
  flex-direction: column;
  font-family: "Poppins", sans-serif;
  justify-content: space-evenly;
  letter-spacing: 1px;
  user-select: none;

  & > *:last-child {
    color: ${e=>`rgba(${e.theme.bodyRgba}, 0.6)`};
    font-size: calc(0.3rem + 1.5vw);
    font-weight: 600;

    ${r(50)`
        font-size: calc(0.5rem + 1vw);
    `};
  }

  ${r(40)`
    font-size: calc(1rem + 1.5vw);
  `};

  ${r(20)`
    padding: 1rem;
  `};

  h2 {
    margin-bottom: 1rem;
  }

  h6 {
    font-size: calc(0.4rem + 0.7vw);
    font-weight: 400;
    line-height: 0.3;
    opacity: 0.9;
    padding: 0.4rem;
    font-family: "Karla", sans-serif !important;

    ${r(40)`
      font-size: calc(0.5rem + 0.6vw);
    `};
  }
`,ye=s.nav`
  margin-top: 0.5rem;
  display: flex;
  justify-content: space-evenly;
  justify-content: center;
  gap: 2rem;
  z-index: 100;
  width: 100%;
  font-size: calc(0.5rem + 0.8vw);
  
  & > a {
    color: ${e=>e.theme.body};
    text-decoration: none;
    padding: 0.8rem 1.4rem;
    border-radius: 15px;
    transition: background 0.3s ease, color 0.3s ease;
    &:hover {
      background: ${e=>e.theme.body};
      color: ${e=>e.theme.text};
    }
    &:focus {
      outline: none;
      border: 2px solid ${e=>e.theme.text};
    }
  }

  ${r(50)`
    flex-direction: row;
    align-items: center;
    gap: 0.2rem;
    & > a {
      padding: 0.6rem;
      width: 100%;
      text-align: center;
      font-size: calc(0.8rem + 0.2vw);
    }
  `};

  ${r(30)`
    font-size: calc(0.7rem + 0.2vw);
  `};

  ${r(20)`
    font-size: calc(0.7rem + 0.2vw);
  `};
`,ge=s.div`
  margin-top: 0.5rem;
  display: flex;
  justify-content: center;
  color: ${e=>e.theme.text};
  font-size: calc(0.5rem + 0.2vw);
  transition: 0.3s ease-in-out;

  ${r(50)`
    align-items: center;
  `};

  ${r(30)`
    font-size: calc(0.4rem + 0.2vw);
  `};

  ${r(20)`
    font-size: calc(0.2rem + 0.2vw);
  `};
`,fe=()=>{const[e,i]=c.useState("55vh"),[n,o]=c.useState("");c.useEffect(()=>{window.matchMedia("(max-width: 50em)").matches&&i("70vh"),window.matchMedia("(max-width: 20em)").matches&&i("60vh")},[]);const a=h=>{o(h)},l=()=>{o("")};return m(ue,{initial:{height:0},animate:{height:e},transition:{type:"spring",duration:2,delay:1},role:"main",children:[t(G,{children:m(pe,{children:[t("h2",{className:"hvr-sink",children:"Hello,"}),m("h2",{className:"hvr-sink",children:["I'm",t(V,{words:[" Mark Yu"," 于震潇 "],loop:0,typeSpeed:60,deleteSpeed:60,delaySpeed:2500,cursor:!0,"aria-label":" Mark Yu, ZhenXiao Yu, 于震潇"})]}),m("h6",{className:"animate__animated animate__bounceInLeft animate__delay-1s hvr-bounce-to-right",children:[t(re,{"aria-hidden":"true"})," Developer / Designer"]}),m("h6",{className:"animate__animated animate__bounceInLeft animate__delay-2s hvr-bounce-to-right",children:[t(he,{"aria-hidden":"true"})," Oakville, Ontario"]}),m("h6",{className:"animate__animated animate__bounceInLeft animate__delay-3s hvr-bounce-to-right",children:[t(K,{"aria-hidden":"true"})," UWO Engineering '24"]}),m(ye,{className:"animate__animated animate__bounceInUp animate__delay-1s",role:"navigation",children:[t("a",{href:"/about",onMouseEnter:()=>a("<About />"),onMouseLeave:l,"aria-label":"About",children:t(Q,{size:"1.2em"})}),t("a",{href:"/post",onMouseEnter:()=>a("<Posts />"),onMouseLeave:l,"aria-label":"Posts",children:t(ee,{size:"1.2em"})}),t("a",{href:"/project",onMouseEnter:()=>a("<Projects />"),onMouseLeave:l,"aria-label":"Projects",children:t(te,{size:"1.2em"})}),t("a",{href:"/skills",onMouseEnter:()=>a("<Skills />"),onMouseLeave:l,"aria-label":"Skills",children:t(ie,{size:"1.2em"})}),t("a",{href:"/gallery",onMouseEnter:()=>a("<Gallery />"),onMouseLeave:l,"aria-label":"Gallery",children:t(ne,{size:"1.2em"})})]}),t(ge,{className:"hovered-icon-text",children:t("p",{children:n?`${n}`:"</>"})})]})}),t(G,{children:t(y.div,{initial:{opacity:0},animate:{opacity:1},transition:{duration:2,delay:1},children:t("img",{className:"animate__animated animate__fadeIn animate__delay-2s pic",src:se,alt:"Mark Yu",loading:"lazy",width:"500",height:"500"})})})]})},ve=s.div`
  text-align: center;
  margin-top: 2.8em;
  position: relative;
  padding: 0 1em; /* Added for better responsiveness */
`,be=A`
  from { opacity: 0; }
  to { opacity: 1; }
`,xe=A`
  0%, 100% { transform: translateX(-50%) translateY(0) rotate(0deg); }
  25% { transform: translateX(-50%) translateY(-10px) rotate(-20deg); }
  75% { transform: translateX(-50%) translateY(10px) rotate(20deg); }
`,we=s(y.h2)`
  color: rgb(8, 9, 10);
  animation: ${be} 2s ease-in;
   margin-top: 0.5em;
`,ke=s(oe)`
  position: absolute;
  top: -30px; /* Adjust as needed to position above the greeting text */
  left: 50%;
  font-size: 30px;
  transform: translateX(-50%) rotate(0deg); /* Center horizontally and rotate */
  animation: ${xe} 2s infinite;
  color: rgb(8, 9, 10);

  @media (max-width: 768px) {
    top: -40px;
    size: 1.5em;
  }

  @media (max-width: 480px) {
    top: -35px;
    size: 1.2em;
  }
`,$e={hidden:{opacity:0},visible:{opacity:1}},_e=()=>{const[e,i]=c.useState("Nice to meet you...");let n=localStorage.getItem("hasVisited");return c.useEffect(()=>{n?i("m4rkyu.com"):(i("Nice to meet you..."),localStorage.setItem("hasVisited","true"))},[n]),m(ve,{children:[t(we,{className:"fadeIn",initial:"hidden",animate:"visible",variants:$e,children:e}),t(ke,{})]})},Ce="/assets/videobg-ecae579c.webm",Te="/assets/videobg2-d37e940e.webm",ze=c.lazy(()=>W(()=>import("./SocialIcons-634292d2.js"),["assets/SocialIcons-634292d2.js","assets/index-d572a681.js","assets/index-85df3ed2.css","assets/AllSvgs-6435270f.js","assets/motion-ce1830e7.js"])),Se=c.lazy(()=>W(()=>import("./LogoComponent-52930ba7.js"),["assets/LogoComponent-52930ba7.js","assets/index-d572a681.js","assets/index-85df3ed2.css"])),Me=s(y.div)`
  background: ${e=>e.theme.body};
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  user-select: none;

  h2, h3, h4, h5, h6 {
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
  }

  h2 {
    ${r(40)`
      font-size: 1.2em;
    `};

    ${r(30)`
      font-size: 1em;
    `};
  }
`,Ee=s.div`
  padding: 2rem;
`,Le=A`
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
`,De=s.button`
  position: absolute;
  top: ${e=>e.click?"85%":"50%"};
  left: ${e=>e.click?"90%":"50%"};
  transform: translate(-50%, -50%);
  border: none;
  outline: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 1s ease;

  & > *:first-child {
    animation: ${Le} infinite 8s linear;
  }

  & > *:last-child {
    display: ${e=>e.click?"none":"inline-block"};
  }

  @media only screen and (max-width: 50em) {
    top: ${e=>e.click?"90%":"50%"};
    left: ${e=>e.click?"90%":"50%"};
    width: ${e=>e.click?"100px":"150px"};
    height: ${e=>e.click?"100px":"150px"};
  }

  @media only screen and (max-width: 30em) {
    width: ${e=>e.click?"80px":"150px"};
    height: ${e=>e.click?"80px":"150px"};
  }
`,je=s(j)`
  color: ${e=>e.click||e.mq?e.theme.body:e.theme.text};
  position: absolute;
  top: 2rem;
  right: calc(1rem + 2vw);
  text-decoration: none;
  z-index: 1;
`,Ie=s(j)`
  color: ${e=>e.click||e.mq?e.theme.body:e.theme.text};
  position: absolute;
  top: 46%;
  right: calc(-0.6rem + 2vw);
  transform: rotate(90deg) translate(-50%, -80%);
  z-index: 1;
  text-decoration: none;

  @media only screen and (max-width: 50em) {
    text-shadow: ${e=>e.click?"0 0 3px #101010, 1px 1px 5px #000":"none"};
  }
`,Pe=s(j)`
  color: ${e=>e.click?e.theme.body:e.theme.text};
  position: absolute;
  top: 42%;
  left: calc(1.5rem + 2vw);
  transform: translate(-50%, -50%) rotate(-90deg);
  z-index: 1;
  text-decoration: none;
  
  @media only screen and (max-width: 50em) {
    text-shadow: ${e=>e.click?"0 0 3px #101010, 1px 1px 5px #000":"none"};
  }
`,Be=s.div`
  position: absolute;
  bottom: 2rem;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  justify-content: space-evenly;
`,Ne=s(j)`
  color: ${e=>e.click?e.theme.body:e.theme.text};
  text-decoration: none;
  z-index: 1;
  bottom: 1.5rem;
`,Oe=s(j)`
  color: ${e=>e.theme.text};
  text-decoration: none;
  bottom: 1.5rem;
`,Ae=s.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 50%;
  width: ${e=>e.click?"50%":"0%"};
  background-color: rgb(8,9,10);
  height: ${e=>e.click?"100%":"0%"};
  transition: height 0.5s ease, width 1s ease 0.5s;
  z-index: 1;

  ${e=>e.click?r(50)`
          height: 50%;
          right: 0;
          width: 100%;
          transition: width 0.5s ease, height 1s ease 0.5s;
        `:r(50)`
          height: 0;
          width: 0;
        `};
`,Ue=()=>{const[e,i]=c.useState(!1),[n,o]=c.useState(""),a=c.useCallback(()=>{i(f=>!f)},[]),l=c.useMemo(()=>({y:"-100%"}),[]),h=c.useMemo(()=>({x:`${n==="project"?"100%":"-100%"}`}),[n]),d=c.useMemo(()=>window.matchMedia("(max-width: 50em)").matches,[]);return m(q,{children:[m(Z,{children:[t("title",{children:"My Portfolio"}),t("meta",{name:"description",content:"Welcome to my portfolio website."})]}),t(c.Suspense,{fallback:t(F,{}),children:m(Me,{initial:{opacity:0},animate:{opacity:1},exit:n==="about"||n==="skills"?l:h,transition:{duration:.5},children:[e?t("video",{src:Te,autoPlay:!0,loop:!0,playsInline:!0,muted:!0,playbackRate:.5,className:"video-background",loading:"lazy"}):t("video",{src:Ce,autoPlay:!0,loop:!0,playsInline:!0,muted:!0,className:"video-background",loading:"lazy"}),t(Ae,{click:e}),m(Ee,{children:[t(Se,{theme:e?"dark":"light"}),t(ze,{theme:e?d?"light":"dark":"light"}),m(De,{click:e,children:[t(J,{onClick:a,width:e?d?100:120:d?150:200,height:e?d?100:120:d?150:200,fill:"#101010"}),t(_e,{})]}),t(je,{click:e&&d,target:"_blank",onClick:()=>o("gallery"),to:"/gallery",children:t(y.h2,{initial:{y:-200,transition:{type:"spring",duration:1.5,delay:1}},animate:{y:0,transition:{type:"spring",duration:1.5,delay:1}},whileHover:{scale:1.2,fontWeight:"bold"},whileTap:{scale:.85},children:"MY PHOTOS"})}),t(Ie,{click:e&&d,onClick:()=>o("blog"),to:"/post",children:t(y.h2,{initial:{y:-200,transition:{type:"spring",duration:1.5,delay:1}},animate:{y:0,transition:{type:"spring",duration:1.5,delay:1}},whileHover:{scale:1.3,fontWeight:"bold"},whileTap:{scale:.85},children:"MY POSTS"})}),t(Pe,{click:+e,to:"/project",children:t(y.h2,{onClick:()=>o("project"),initial:{y:-200,transition:{type:"spring",duration:1.5,delay:1}},animate:{y:0,transition:{type:"spring",duration:1.5,delay:1}},whileHover:{scale:1.2},whileTap:{scale:.85},children:"MY PROJECTS"})}),m(Be,{children:[t(Ne,{onClick:()=>i(!1),click:d?0:+e,to:"/about",children:t(y.h2,{onClick:()=>o("about"),initial:{y:200,transition:{type:"spring",duration:1.5,delay:1}},animate:{y:0,transition:{type:"spring",duration:1.5,delay:1}},whileHover:{scale:1.2},whileTap:{scale:.85},children:"ABOUT ME"})}),t(Oe,{onClick:()=>o("skills"),to:"/skills",children:t(y.h2,{initial:{y:200,transition:{type:"spring",duration:1.5,delay:1}},animate:{y:0,transition:{type:"spring",duration:1.5,delay:1}},whileHover:{scale:1.2},whileTap:{scale:.85},children:"WHAT I DO"})})]})]}),e&&t(fe,{click:e})]},"modal")})]})};export{Ue as default};
