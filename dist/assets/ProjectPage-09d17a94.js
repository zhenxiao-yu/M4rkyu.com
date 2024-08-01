import{s as i,m as o,N as b,j as l,a as t,r as s,_ as h,W as k,b as S,D as u,L as $}from"./index-784aae70.js";import{c as _,S as P}from"./AllSvgs-a237324b.js";import{m}from"./motion-861d08e4.js";import{H as C}from"./Helmet-d4594485.js";const z=[{id:1,name:"UI Studio",subtitle:"Web APP",description:"UI Studio is a streamlined, minimalist web-based application tailored for PC users and offered completely free of charge. Designed to emulate a professional collaborative user interface design environment, UI Studio integrates essential features such as live collaboration, real-time cursor tracking, integrated chat, commenting, and dynamic drawing capabilities. Leveraging cutting-edge technologies like Next.js, TypeScript, and Fabric.js, the application provides a robust platform for exploring and mastering real-time web applications and collaborative design processes. With its intuitive, user-friendly interface, UI Studio ensures a seamless and interactive experience, enabling teams to collaborate effectively and creatively in a virtual workspace. Discover how UI Studio can enhance your design workflow and facilitate efficient team collaboration.",tags:["Next.js","TypeScript","Tailwind CSS","Fabric.js","Liveblocks","Shadcn","JavaScript","HTML5 Canvas"],demo:"https://ui-studio-mu.vercel.app/",github:"https://github.com/zhenxiao-yu/ui-studio",status:"Ready"},{id:2,name:"In the Silence of a Brother",subtitle:"AI Animated Short Film",description:"“In the Silence of a Brother” is a poignant exploration of childhood in 1980s Beijing under China’s One-Child Policy. Using a blend of physical art, stop motion animation and AI-generated visuals, the film vividly depicts the memories and adventures of a sibling relationship. It delves into the impact of the policy on family dynamics and personal identity, while celebrating the joy and imagination of childhood. This film is the final project for the SA2560 course at Western University and is now available to watch on YouTube.",tags:["CapCut","Premiere Pro","Stable-Diffusion","Pictory","RunwayML","Film","Video Project"],demo:"https://youtu.be/tttaJabgVMw?si=RcJMkkqryKP6Vpuj",github:"https://github.com/zhenxiao-yu/Text-To-Video-AI",status:"Ready"},{id:3,name:"Spring Boot Blog",subtitle:"Web APP",description:"A robust full-stack blogging platform built with MySQL and Spring Boot, utilizing Thymeleaf for server-side rendering and Semantic UI for a sleek, user-friendly interface. Features include post categorization by hashtags, categories, and dates.",tags:["Spring Boot","MySQL","Thymeleaf","Semantic UI","CSS","JavaScript","Web Development"],demo:"",github:"https://github.com/zhenxiao-yu/Spring-Boot-Blog",status:"Maintenance"},{id:4,name:"React E-Commerce Website",subtitle:"Web APP",description:"Create a vibrant online storefront with this React.js-powered e-commerce site, featuring a faux backend via JSON Server and stylish aesthetics with Node SASS and Bulma. Ideal for small businesses aiming to establish an online presence.",tags:["React","JSON Server","SASS","Bulma","React Router","Custom Hooks","E-commerce"],demo:"",github:"https://github.com/zhenxiao-yu/React-Ecommerce-Website",status:"Maintenance"},{id:5,name:"Web3 Ethereum Wallet",subtitle:"Web APP",description:"This decentralized application (dApp) leverages blockchain technology to enable users to securely and efficiently send cryptocurrency globally using Ethereum smart contracts. Built with React and TailwindCSS for a responsive user experience.",tags:["Web3","Blockchain","Solidity","React","TailwindCSS","Crypto Wallet","Smart Contracts"],demo:"",github:"https://github.com/zhenxiao-yu/web3-blockchain-app",status:"Maintenance"},{id:6,name:"Descent In To Madness",subtitle:"PC Game",description:"Enter the twisted realms of Karnoxia, where reality and nightmare blur. In this heart-pounding 2D rogue-like horror shooter, survival depends on more than quick reflexes—your sanity is as fragile as your flesh. Trapped in a maze that reshapes with each playthrough, you'll face monstrous entities challenging both your physical prowess and perception. Now available on PC.",tags:["Unity","Game Dev","2D","Roguelike","PC","C#","Horror","PVE","Procedural Generation","URP"],demo:"https://markyu615.itch.io/descent-into-madness",github:"https://github.com/zhenxiao-yu/Descent-In-To-Madness",status:"Ready"}],p=i(m.li)`
  width: 28rem;
  height: 50vh;
  background-color: ${e=>e.theme.text};
  color: ${e=>e.theme.body};
  padding: 1.5rem 2rem;
  margin-right: 8rem;
  border-radius: 0 50px 0 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid ${e=>e.theme.body};
  transition: all 0.5s ease; // Updated transition time
  background-image: linear-gradient(
    to right, 
    ${e=>e.theme.body} 50%, 
    ${e=>e.theme.text} 50%);
  background-size: 200% 100%;
  background-position: right bottom;

  &:hover {
    color: ${e=>e.theme.text};
    border: 1px solid ${e=>e.theme.text};
    background-color: ${e=>e.theme.body};
    background-position: left bottom; // Shifts the gradient to change the background color directionally
  }
  ${o(50)`
        width:16rem;
        margin-right:6rem;
        height:40vh;
  `};
  ${o(40)`
        width:14rem;
        margin-right:4rem;
        height:40vh;
  `};
  ${o(25)`
        width:12rem;
        margin-right:4rem;
        height:35vh;
        padding:1.5rem 1.5rem;
  `};
  ${o(20)`
        width:10rem;
        margin-right:4rem;
        height:40vh;
  `};
`,R=i.h2`
  font-size: calc(1em + 0.5vw);
  overflow: hidden;
  height: auto; /* Adjust height to auto to fit content */
  text-overflow: ellipsis;
  margin: 0; /* Remove default margin */
`,T=i.div`
  font-size: calc(0.7em + 0.2vw);
  font-weight: 400;
  margin-top: 5px; /* Add some space between title and subtitle */
`,I=i.h4`
  font-size: calc(0.75em + 0.3vw);
  font-family: "Karla", sans-serif;
  font-weight: 500;
  max-height: 15vh;
  overflow-y: scroll;
  text-overflow: ellipsis;
  line-height: 1.3rem;
  border-radius: 10px;
  padding: 0.3em 1.3em 0.3em 0.3em;
  ${o(25)`
    font-size:calc(0.6em + 0.3vw);
  `};
  ${o(20)`
    font-size:calc(0.5em + 0.3vw);
  `};

  /* Custom scrollbar styles */
  ::-webkit-scrollbar {
    width: 4px; /* width of the scrollbar */
  }

  ::-webkit-scrollbar-track {
    background: ${e=>e.theme.text}; /* color of the scrollbar track */
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${e=>e.theme.body};; /* color of the scrollbar thumb */
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #404252; /* color of the scrollbar thumb on hover */
  }
`,j=i.div`
  border-top: 4px solid ${e=>e.theme.body};
  padding: 0.8rem 1.3rem 0.8rem 1.3rem;
  display: flex;
  gap: 0.2rem;
  overflow: hidden;
  flex-wrap: wrap;

  ${p}:hover & {
    border-top: 4px solid ${e=>e.theme.text};
  }
`,A=i.span`
  margin-right: 0.1rem;  // Consistent margin for layout spacing
  font-size: calc(0.5em + 0.2vw);  // Dynamic font size based on viewport width
  overflow: hidden;  // Prevents overflow of text outside the tag
  text-overflow: ellipsis;  // Adds ellipsis when text overflows
  white-space: nowrap;  // Keeps the tag text on one line
  background-color: ${e=>e.theme.body};  // Background color from theme
  color: ${e=>e.theme.text};  // Text color from theme
  padding: 0.5em 1em;  // Padding around the text for a better visual presentation
  border-radius: 15px;  // Rounded corners for a modern look
  transition: all 0.2s ease;  // Smooth transition for hover effects

  &:hover {
    background-color: ${e=>e.theme.text};  // Changes background on hover
    color: ${e=>e.theme.body};  // Changes text color on hover
    transform: scale(1.1);  // Slightly enlarges the tag on hover for emphasis
    cursor: pointer;  // Changes the cursor to indicate interactivity
  }

  ${o(25)`  
    font-size:calc(0.7em);
    padding: 0.4em 0.9em;  
  `};
`,E=i.footer`
  display: flex;
  justify-content: space-between;
`,D=i(b)`
  background-color: ${e=>e.theme.body};
  color: ${e=>e.theme.text};
  text-decoration: none;
  padding: 0.5rem calc(2rem + 2vw);  // Adjusted to ensure proper vertical alignment
  border-radius: 0 0 0 30px;
  font-family: "Karla", sans-serif;
  font-size: calc(0.85em + 0.5vw);
  text-overflow: ellipsis;  // Adds ellipsis when text overflows
  white-space: nowrap; 
  display: flex;
  font-weight: bold;
  align-items: center;  // Ensures vertical centering of text
  height: 1.8rem  // Fixed height for consistency
  max-width: 15vw; // Fixed width for consistency

  ${p}:hover & {
    background-color: ${e=>e.theme.text};
    color: ${e=>e.theme.body};
    text-decoration: underline;
    transition: 0.3S ease-in-out;
  }
`,L=i(b)`
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;  // Ensures vertical centering of the icon
  height: 2.8rem;  // Same height as the Visit button to maintain consistency

  ${p}:hover & {
    & > * {
      fill: ${e=>e.theme.text};
    }
  }
`,f=i.span`
  background-color: ${e=>e.theme.body};
  color: ${e=>e.theme.text};
  text-decoration: none;
  padding: 0.5rem calc(2rem + 2vw);  // Adjusted to ensure proper vertical alignment
  border-radius: 0 0 0 30px;
  font-family: "Karla", sans-serif;
  font-size: calc(0.7em + 0.5vw);
  font-weight: bold;
  text-overflow: ellipsis;  // Adds ellipsis when text overflows
  white-space: nowrap; 
  display: flex;
  align-items: center;  // Ensures vertical centering of text
  height: 1.8rem;  // Fixed height for consistency
  max-width: 15rem; // Fixed width for consistency
`,B=(e,a)=>{let n="";return e==="Ready"?n="#74febd":e==="Development"?n="#64e9ff":e==="Maintenance"&&(n="#ff4066"),e==="Ready"?t(D,{style:{border:`3px solid ${n}`},to:{pathname:`${a}`},target:"_blank",children:"View Demo"}):e==="Development"?t(f,{style:{border:`3px solid ${n}`},children:"Coming Soon"}):e==="Maintenance"?t(f,{style:{border:`3px solid ${n}`},children:"Unavailable"}):null},M=e=>{const a=`https://www.google.com/search?q=${e}`;window.open(a,"_blank")},U={hidden:{scale:0},show:{scale:1,transition:{type:"spring",duration:.5}}},W=e=>{const{id:a,name:n,subtitle:r,description:c,tags:d,demo:v,github:w,status:y}=e.data;return l(p,{variants:U,children:[l(R,{className:"animate__animated animate__flipInX animate__delay-1s",children:[n,t(T,{children:r})]}),t(I,{className:"animate__animated animate__zoomIn animate__delay-1s",children:c}),t(j,{className:"animate__animated animate__fadeInUp animate__delay-1s",children:d.map((g,x)=>l(A,{onClick:()=>M(g),children:["#",g]},x))}),l(E,{className:"animate__animated animate__fadeInUp animate__delay-1s",children:[B(y,v),t(L,{to:{pathname:`${w}`},className:"hvr-grow",target:"_blank",children:t(_,{height:"100%"})})]})]},a)},N=s.lazy(()=>h(()=>import("./SocialIcons-03ceccf8.js"),["assets/SocialIcons-03ceccf8.js","assets/index-784aae70.js","assets/index-85df3ed2.css","assets/AllSvgs-a237324b.js","assets/motion-861d08e4.js"])),O=s.lazy(()=>h(()=>import("./HomeButton-4ee5a9b5.js"),["assets/HomeButton-4ee5a9b5.js","assets/index-784aae70.js","assets/index-85df3ed2.css","assets/AllSvgs-a237324b.js"])),V=s.lazy(()=>h(()=>import("./LogoComponent-b7f74ae8.js"),["assets/LogoComponent-b7f74ae8.js","assets/index-784aae70.js","assets/index-85df3ed2.css"])),F=s.lazy(()=>h(()=>import("./BigTitle-458c9346.js"),["assets/BigTitle-458c9346.js","assets/index-784aae70.js","assets/index-85df3ed2.css"])),J=i(m.div)`
  background-color: ${e=>e.theme.body};
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 400vh;
  overflow: hidden;
`,H=i(m.ul)`
  position: fixed;
  top: 12rem;
  left: calc(10rem + 15vw);
  user-select: none;
  height: 40vh;
  display: flex;

  ${o(50)`
    left: calc(8rem + 15vw);
  `};

  ${o(40)`
    top: 30%;
    left: calc(6rem + 15vw);
  `};

  ${o(40)`
    left: calc(2rem + 15vw);
  `};

  ${o(25)`
    left: calc(1rem + 15vw);
  `};
`,K=i.span`
  display: block;
  position: fixed;
  right: 1rem;
  top: 1rem;
  width: 85px;
  height: 85px;
  z-index: 1;

  ${o(40)`
    width: 60px;
    height: 60px;
    svg {
      width: 60px;
      height: 60px;
    }
  `};

  ${o(25)`
    width: 50px;
    height: 50px;
    svg {
      width: 50px;
      height: 50px;
    }
  `};
`,G=k`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
`,Y=i(m.div)`
  position: fixed;
  bottom: 7rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  cursor: pointer;
  animation: ${G} 2s infinite;

  svg {
    width: 30px;
    height: 40px;
    fill: ${e=>e.theme.text};
  }
`,q={hidden:{opacity:0},show:{opacity:1,transition:{staggerChildren:.2,duration:.5}}},Q=e=>{const a=["Ready","Development","Maintenance"];return e.sort((n,r)=>a.indexOf(n.status)-a.indexOf(r.status))},ie=()=>{const e=s.useRef(null),a=s.useRef(null);s.useEffect(()=>{const r=()=>{const c=e.current,d=window.pageYOffset;c&&(c.style.transform=`translateX(${-d}px)`),a.current&&(a.current.style.transform=`rotate(${-d}deg)`)};return window.addEventListener("scroll",r),()=>{window.removeEventListener("scroll",r)}},[]);const n=Q(z);return l(S,{theme:u,children:[l(C,{children:[t("title",{children:"Projects - My Portfolio"}),t("meta",{name:"description",content:"Projects: Showcasing what I've been working on."})]}),t(s.Suspense,{fallback:t($,{}),children:l(J,{initial:{opacity:0},animate:{opacity:1,transition:{duration:1}},exit:{opacity:0,transition:{duration:.5}},children:[t(V,{theme:"dark"}),t(O,{}),t(N,{theme:"dark"}),t(H,{ref:e,variants:q,initial:"hidden",animate:"show",children:n.map(r=>t(W,{data:r},r.id))}),t(F,{text:"PROJECTS",top:"10%",right:"20%"}),t(K,{ref:a,children:t(P,{width:85,height:85,fill:u.text})}),t(Y,{children:t("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",children:t("path",{d:"M12 21l-12-18h24z"})})})]},"project")})]})};export{ie as default};
