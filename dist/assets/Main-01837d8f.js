import{s as a,m as i,r as n,j as o,a as t,W as u,_ as b,F as x,L as w,N as p}from"./index-81b8ab02.js";import{H as v}from"./Helmet-f54e6b7c.js";import{C as k}from"./AllSvgs-0f0c20e8.js";import{T as $}from"./index-4021e6fb.js";import{P as _,B as z,a as M,b as C,c as I,d as S,F as L}from"./index.esm-4cbd0ca9.js";import{G as E}from"./iconBase-f2c7985c.js";import{M as P}from"./index.esm-b1fdad2f.js";import{m as s}from"./motion-33849963.js";const T="/assets/file-clean-7733bd18.png";function B(e){return E({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{fill:"none",strokeWidth:"2",d:"M12,22 C12,22 4,16 4,10 C4,5 8,2 12,2 C16,2 20,5 20,10 C20,16 12,22 12,22 Z M12,13 C13.657,13 15,11.657 15,10 C15,8.343 13.657,7 12,7 C10.343,7 9,8.343 9,10 C9,11.657 10.343,13 12,13 L12,13 Z"}}]})(e)}const N=a(s.section)`
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

  ${i(1200)`
    width: 65vw;
  `};

  ${i(60)`
    width: 70vw;
  `};

  ${i(50)`
    width: 70vw;
    background-size: 100% 2px;
    flex-direction: column;
    justify-content: space-between;
  `};

  ${i(40)`
    width: 64vw;
  `};

  ${i(30)`
     width: 64vw;
  `};
  ${i(20)`
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
`,f=a.div`
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
    -webkit-filter: brightness(105%) hue-rotate(350deg);
    filter: grayscale(100%);
    transition: 0.5s ease-in-out;
  }

  .pic:hover {
  -webkit-filter: none; /* Remove filter on hover */
  filter: none;
  }
    
  ${i(50)`
    width: 100%;
    height: 50%;
    .pic {
      width: 90%;
    }
  `};

  ${i(40)`
    .pic {
      width: 90%;
    }
  `};

  ${i(30)`
    .pic {
      width: 100%;
    }
  `};

  ${i(20)`
    .pic {
      width: 50%;
    }
  `};
  
`,O=a(s.article)`
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

    ${i(50)`
        font-size: calc(0.5rem + 1vw);
    `};
  }

  ${i(40)`
    font-size: calc(1rem + 1.5vw);
  `};

  ${i(20)`
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

    ${i(40)`
      font-size: calc(0.5rem + 0.6vw);
    `};
  }
`,Y=a.nav`
  margin-top: 0.5rem;
  display: flex;
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

  ${i(50)`
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

  ${i(30)`
    font-size: calc(0.7rem + 0.2vw);
  `};

  ${i(20)`
    font-size: calc(0.7rem + 0.2vw);
  `};
`,j=a.div`
  margin-top: 0.5rem;
  display: flex;
  justify-content: center;
  color: ${e=>e.theme.text};
  font-size: calc(0.5rem + 0.2vw);
  transition: 0.3s ease-in-out;

  ${i(50)`
    align-items: center;
  `};

  ${i(30)`
    font-size: calc(0.4rem + 0.2vw);
  `};

  ${i(20)`
    font-size: calc(0.2rem + 0.2vw);
  `};
`,H=()=>{const[e,l]=n.useState("55vh"),[r,c]=n.useState("");n.useEffect(()=>{window.matchMedia("(max-width: 50em)").matches&&l("70vh"),window.matchMedia("(max-width: 20em)").matches&&l("60vh")},[]);const m=g=>{c(g)},h=()=>{c("")};return o(N,{initial:{height:0},animate:{height:e},transition:{type:"spring",duration:2,delay:1},role:"main",children:[t(f,{children:o(O,{children:[t("h2",{className:"hvr-sink",children:"Hello,"}),o("h2",{className:"hvr-sink",children:["I'm",t($,{words:[" Mark Yu "," 于震潇 "],loop:0,typeSpeed:60,deleteSpeed:60,delaySpeed:2500,cursor:!0,"aria-label":" Mark Yu, ZhenXiao Yu, 于震潇"})]}),o("h6",{className:"animate__animated animate__bounceInLeft animate__delay-1s hvr-bounce-to-right",children:[t(P,{"aria-hidden":"true"})," Developer / Designer"]}),o("h6",{className:"animate__animated animate__bounceInLeft animate__delay-2s hvr-bounce-to-right",children:[t(B,{"aria-hidden":"true"})," Oakville, Ontario"]}),o("h6",{className:"animate__animated animate__bounceInLeft animate__delay-3s hvr-bounce-to-right",children:[t(_,{"aria-hidden":"true"})," UWO Engineering '24"]}),o(Y,{className:"animate__animated animate__bounceInUp animate__delay-1s",role:"navigation",children:[t("a",{href:"/about",onMouseEnter:()=>m("<About />"),onMouseLeave:h,"aria-label":"About",children:t(z,{size:"1.2em"})}),t("a",{href:"/post",onMouseEnter:()=>m("<Posts />"),onMouseLeave:h,"aria-label":"Posts",children:t(M,{size:"1.2em"})}),t("a",{href:"/project",onMouseEnter:()=>m("<Projects />"),onMouseLeave:h,"aria-label":"Projects",children:t(C,{size:"1.2em"})}),t("a",{href:"/skills",onMouseEnter:()=>m("<Skills />"),onMouseLeave:h,"aria-label":"Skills",children:t(I,{size:"1.2em"})}),t("a",{href:"/gallery",onMouseEnter:()=>m("<Gallery />"),onMouseLeave:h,"aria-label":"Gallery",children:t(S,{size:"1.2em"})})]}),t(j,{className:"hovered-icon-text",children:t("p",{children:r?`${r}`:"</>"})})]})}),t(f,{children:t(s.div,{initial:{opacity:0},animate:{opacity:1},transition:{duration:2,delay:1},children:t("img",{className:"animate__animated animate__fadeIn animate__delay-2s pic",src:T,alt:"Mark Yu",loading:"lazy",width:"500",height:"500"})})})]})},G=a.div`
  text-align: center;
  margin-top: 2.8em;
  position: relative;
  padding: 0 1em; /* Added for better responsiveness */
`,A=u`
  from { opacity: 0; }
  to { opacity: 1; }
`,D=u`
  0%, 100% { transform: translateX(-50%) translateY(0) rotate(0deg); }
  25% { transform: translateX(-50%) translateY(-10px) rotate(-20deg); }
  75% { transform: translateX(-50%) translateY(10px) rotate(20deg); }
`,W=a(s.h2)`
  color: rgb(8, 9, 10);
  animation: ${A} 2s ease-in;
   margin-top: 0.5em;
`,R=a(L)`
  position: absolute;
  top: -30px; /* Adjust as needed to position above the greeting text */
  left: 50%;
  font-size: 30px;
  transform: translateX(-50%) rotate(0deg); /* Center horizontally and rotate */
  animation: ${D} 2s infinite;
  color: rgb(8, 9, 10);

  @media (max-width: 768px) {
    top: -40px;
    size: 1.5em;
  }

  @media (max-width: 480px) {
    top: -35px;
    size: 1.2em;
  }
`,V={hidden:{opacity:0},visible:{opacity:1}},X=()=>{const[e,l]=n.useState("Nice to meet you...");let r=localStorage.getItem("hasVisited");return n.useEffect(()=>{r?l("m4rkyu.com"):(l("Nice to meet you..."),localStorage.setItem("hasVisited","true"))},[r]),o(G,{children:[t(W,{className:"fadeIn",initial:"hidden",animate:"visible",variants:V,children:e}),t(R,{})]})},Z="/assets/videobg-ecae579c.webm",F="/assets/videobg2-d37e940e.webm",U=n.lazy(()=>b(()=>import("./SocialIcons-c0666d73.js"),["assets/SocialIcons-c0666d73.js","assets/index-81b8ab02.js","assets/index-139dcfa0.css","assets/AllSvgs-0f0c20e8.js","assets/motion-33849963.js"])),q=n.lazy(()=>b(()=>import("./LogoComponent-6e5fe017.js"),["assets/LogoComponent-6e5fe017.js","assets/index-81b8ab02.js","assets/index-139dcfa0.css"])),J=a(s.div)`
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
    ${i(40)`
      font-size: 1.2em;
    `};

    ${i(30)`
      font-size: 1em;
    `};
  }
`,K=a.div`
  padding: 2rem;
`,Q=u`
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
`,ee=a.button`
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
    animation: ${Q} infinite 8s linear;
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
`,te=a(p)`
  color: ${e=>e.click||e.mq?e.theme.body:e.theme.text};
  position: absolute;
  top: 2rem;
  right: calc(1rem + 2vw);
  text-decoration: none;
  z-index: 1;
`,ie=a(p)`
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
`,ae=a(p)`
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
`,ne=a.div`
  position: absolute;
  bottom: 2rem;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  justify-content: space-evenly;
`,oe=a(p)`
  color: ${e=>e.click?e.theme.body:e.theme.text};
  text-decoration: none;
  z-index: 1;
  bottom: 1.5rem;
`,re=a(p)`
  color: ${e=>e.theme.text};
  text-decoration: none;
  bottom: 1.5rem;
`,se=a.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 50%;
  width: ${e=>e.click?"50%":"0%"};
  background-color: rgb(8,9,10);
  height: ${e=>e.click?"100%":"0%"};
  transition: height 0.5s ease, width 1s ease 0.5s;
  z-index: 1;

  ${e=>e.click?i(50)`
          height: 50%;
          right: 0;
          width: 100%;
          transition: width 0.5s ease, height 1s ease 0.5s;
        `:i(50)`
          height: 0;
          width: 0;
        `};
`,fe=()=>{const[e,l]=n.useState(!1),[r,c]=n.useState(""),m=n.useCallback(()=>{l(y=>!y)},[]),h=n.useMemo(()=>({y:"-100%"}),[]),g=n.useMemo(()=>({x:`${r==="project"?"100%":"-100%"}`}),[r]),d=n.useMemo(()=>window.matchMedia("(max-width: 50em)").matches,[]);return o(x,{children:[o(v,{children:[t("title",{children:"M4rkyu.com"}),t("meta",{name:"description",content:"Official website of Mark Yu (Zhenxiao Yu), a software engineer working in full-stack development and game design. Learn more about Zhenxiao Yu's projects and achievements."}),t("meta",{name:"author",content:"Mark Yu"}),t("meta",{name:"keywords",content:"Mark Yu, Zhenxiao Yu, Software Engineer, Frontend Development, Game Design"})]}),t(n.Suspense,{fallback:t(w,{}),children:o(J,{initial:{opacity:0},animate:{opacity:1},exit:r==="about"||r==="skills"?h:g,transition:{duration:.5},children:[e?t("video",{src:F,autoPlay:!0,loop:!0,playsInline:!0,muted:!0,playbackRate:.5,className:"video-background",loading:"lazy"}):t("video",{src:Z,autoPlay:!0,loop:!0,playsInline:!0,muted:!0,className:"video-background",loading:"lazy"}),t(se,{click:e}),o(K,{children:[t(q,{theme:e?"dark":"light"}),t(U,{theme:e?d?"light":"dark":"light"}),o(ee,{click:e,children:[t(k,{onClick:m,width:e?d?100:120:d?150:200,height:e?d?100:120:d?150:200,fill:"#101010"}),t(X,{})]}),t(te,{click:e&&d,onClick:()=>c("gallery"),to:"/gallery",children:t(s.h2,{initial:{y:-200,transition:{type:"spring",duration:1.5,delay:1}},animate:{y:0,transition:{type:"spring",duration:1.5,delay:1}},whileHover:{scale:1.2,fontWeight:"bold"},whileTap:{scale:.85},children:"MY PHOTOS"})}),t(ie,{click:e&&d,onClick:()=>c("blog"),to:"/post",children:t(s.h2,{initial:{y:-200,transition:{type:"spring",duration:1.5,delay:1}},animate:{y:0,transition:{type:"spring",duration:1.5,delay:1}},whileHover:{scale:1.3,fontWeight:"bold"},whileTap:{scale:.85},children:"MY POSTS"})}),t(ae,{click:+e,to:"/project",children:t(s.h2,{onClick:()=>c("project"),initial:{y:-200,transition:{type:"spring",duration:1.5,delay:1}},animate:{y:0,transition:{type:"spring",duration:1.5,delay:1}},whileHover:{scale:1.2},whileTap:{scale:.85},children:"MY PROJECTS"})}),o(ne,{children:[t(oe,{onClick:()=>l(!1),click:d?0:+e,to:"/about",children:t(s.h2,{onClick:()=>c("about"),initial:{y:200,transition:{type:"spring",duration:1.5,delay:1}},animate:{y:0,transition:{type:"spring",duration:1.5,delay:1}},whileHover:{scale:1.2},whileTap:{scale:.85},children:"ABOUT ME"})}),t(re,{onClick:()=>c("skills"),to:"/skills",children:t(s.h2,{initial:{y:200,transition:{type:"spring",duration:1.5,delay:1}},animate:{y:0,transition:{type:"spring",duration:1.5,delay:1}},whileHover:{scale:1.2},whileTap:{scale:.85},children:"WHAT I DO"})})]})]}),e&&t(H,{click:e})]},"modal")})]})};export{fe as default};
