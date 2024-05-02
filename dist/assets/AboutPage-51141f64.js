import{r as i,d as a,s as n,W as l,m as o,c as t,e as c,D as d,L as m,j as s}from"./index-ca4d20e1.js";import{m as r}from"./motion-c17dc8cf.js";const p="/assets/spaceman-b47252a8.png",h=i.lazy(()=>a(()=>import("./SocialIcons-b47d7a96.js"),["assets/SocialIcons-b47d7a96.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css","assets/AllSvgs-7c618cbc.js","assets/motion-c17dc8cf.js"])),f=i.lazy(()=>a(()=>import("./HomeButton-6c13a292.js"),["assets/HomeButton-6c13a292.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css","assets/AllSvgs-7c618cbc.js"])),u=i.lazy(()=>a(()=>import("./LogoComponent-65af8458.js"),["assets/LogoComponent-65af8458.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css"])),g=i.lazy(()=>a(()=>import("./ParticlesComponent-26f4581c.js").then(e=>e.af),["assets/ParticlesComponent-26f4581c.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css"])),_=i.lazy(()=>a(()=>import("./BigTitle-59bc404b.js"),["assets/BigTitle-59bc404b.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css"])),v=n(r.div)`
  background-color: ${e=>e.theme.body};
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
`,y=l`
0% { transform: translateY(-10px)         }
    50% { transform: translateY(15px) translateX(15px)        }
    100% { transform: translateY(-10px)         }
`,w=n(r.div)`
  position: absolute;
  top: 10%;
  right: 5%;
  animation: ${y} 4s ease infinite;
width:20vw;
  img{
    width:100%;
    height:auto;
  }
`,x=n(r.div)`
  border: 2px solid ${e=>e.theme.text};
  color: ${e=>e.theme.text};
  padding: 2rem;
  width: 50vw;
  height: 60vh;
  z-index: 3;
  line-height: 1.5;
  display: flex;
  justify-content: center;
  align-items: center;
 font-size: calc(0.55rem + 1vw);
 backdrop-filter: blur(4px);
  
  position: absolute;
  left: calc(5rem + 5vw);
  top: 10rem;

  font-family: "Poppins", sans-serif;
  font-style: italic;

  ${o(40)`
          width: 60vw;
          height: 50vh;
          top:50%;
          left:50%;
          transform:translate(-50%,-50%);


  `};
  ${o(30)`
          width: 50vw;
          height: auto;
          backdrop-filter: none;
          margin-top:2rem;

  `};

${o(20)`
          padding: 1rem;
          font-size: calc(0.5rem + 1vw);
  `};

`,E=()=>t(c,{theme:d,children:t(i.Suspense,{fallback:t(m,{}),children:s(v,{initial:{opacity:0},animate:{opacity:1,transition:{duration:.5}},exit:{opacity:0,transition:{duration:.5}},children:[t(u,{theme:"dark"}),t(f,{}),t(h,{theme:"dark"}),t(g,{theme:"dark"}),t(w,{initial:{right:"-20%",top:"100%"},animate:{right:"5%",top:"10%",transition:{duration:2,delay:.5}},children:t("img",{src:p,alt:"spaceman"})}),s(x,{initial:{opacity:0},animate:{opacity:1,transition:{duration:1,delay:1}},children:["Welcome to my corner of the internet! I’m a 22-year-old software engineer and artist residing in Oakville, Canada.",t("br",{}),t("br",{}),"At the heart of my work, whether it's coding or creating art, lies a commitment to innovation, quality, and continuous learning. I believe in blending aesthetics with functionality to create meaningful and impactful products and experiences."," "]}),t(_,{text:"ABOUT",top:"10%",left:"5%"})]},"skills")})});export{E as default};
