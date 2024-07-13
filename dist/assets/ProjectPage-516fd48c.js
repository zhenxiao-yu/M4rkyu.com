import{s as o,m as i,N as b,a as c,b as t,r as s,_ as h,W as y,c as k,D as u,L as S}from"./index-d572a681.js";import{c as $,S as _}from"./AllSvgs-6435270f.js";import{m}from"./motion-ce1830e7.js";import{H as R}from"./Helmet-96b1ff45.js";const z=[{id:1,name:"Spring Boot Wiki",description:"A comprehensive full-stack wiki application combining Spring Boot with Vue 3, featuring a sophisticated management system for document and account handling, secure JWT authentication, and integrated E-charts for dynamic trend visualization.",tags:["Spring Boot","Vue.js","JWT","E-charts","MyBatis","Java","TypeScript","SQL"],demo:"",github:"https://github.com/zhenxiao-yu/Spring-Boot-Wiki",status:"Development"},{id:2,name:"Vue Grocery Delivery App",description:"This streamlined web application is designed for students to effortlessly explore, bookmark, and purchase essentials from nearby grocery stores, enhancing the shopping experience with intuitive navigation and interactive design.",tags:["Vue.js","SASS","REST API","Vue CLI","Vue Router","Web App","JavaScript"],demo:"",github:"https://github.com/zhenxiao-yu/Vue-Grocery-Delivery-App",status:"Maintenance"},{id:3,name:"Spring Boot Blog",description:"A robust full-stack blogging platform built with MySQL and Spring Boot, utilizing Thymeleaf for server-side rendering and Semantic UI for a sleek, user-friendly interface. Features include post categorization by hashtags, categories, and dates.",tags:["Spring Boot","MySQL","Thymeleaf","Semantic UI","CSS","JavaScript","Web Development"],demo:"",github:"https://github.com/zhenxiao-yu/Spring-Boot-Blog",status:"Maintenance"},{id:4,name:"React E-Commerce Website",description:"Create a vibrant online storefront with this React.js-powered e-commerce site, featuring a faux backend via JSON Server and stylish aesthetics with Node SASS and Bulma. Ideal for small businesses aiming to establish an online presence.",tags:["React","JSON Server","SASS","Bulma","React Router","Custom Hooks","E-commerce"],demo:"",github:"https://github.com/zhenxiao-yu/React-Ecommerce-Website",status:"Maintenance"},{id:5,name:"Web3 Ethereum Wallet",description:"This decentralized application (dApp) leverages blockchain technology to enable users to securely and efficiently send cryptocurrency globally using Ethereum smart contracts. Built with React and TailwindCSS for a responsive user experience.",tags:["Web3","Blockchain","Solidity","React","TailwindCSS","Crypto Wallet","Smart Contracts"],demo:"",github:"https://github.com/zhenxiao-yu/web3-blockchain-app",status:"Maintenance"},{id:6,name:"React Responsive Navigation",description:"Craft a seamless navigation experience with this responsive ReactJS navbar, featuring react-router integration for dynamic routing. Designed from scratch, this component is perfect for enhancing any web application with mobile-friendly navigation.",tags:["React","React Router","CSS","Responsive Design","Web Component","UI"],demo:"http://react-responsive-navbar-codebucks27.vercel.app/",github:"https://github.com/codebucks27/React-responsive-navbar",status:"Ready"}],p=o(m.li)`
  width: 25rem;
  height: 45vh;
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
  ${i(50)`
        width:16rem;
        margin-right:6rem;
        height:38vh;
  `};
  ${i(40)`
        width:14rem;
        margin-right:4rem;
        height:38vh;
  `};
  ${i(25)`
        width:12rem;
        margin-right:4rem;
        height:35vh;
        padding:1.5rem 1.5rem;
  `};
  ${i(20)`
        width:10rem;
        margin-right:4rem;
        height:40vh;
  `};
`,C=o.h2`
  font-size: calc(0.8em + 0.5vw);
  overflow: hidden;
  height: 35px;
  text-overflow: ellipsis;
`,E=o.h4`
  font-size: calc(0.75em + 0.3vw);
  font-family: "Karla", sans-serif;
  font-weight: 500;
  max-height: 15vh;
  overflow-y: scroll;
  text-overflow: ellipsis;
  line-height: 1.3rem;
  border-radius: 10px;
  padding: 0.3em 1.3em 0.3em 0.3em;
  ${i(25)`
    font-size:calc(0.6em + 0.3vw);
  `};
  ${i(20)`
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
`,T=o.div`
  border-top: 4px solid ${e=>e.theme.body};
  padding: 0.8rem 1.3rem 0.8rem 1.3rem;
  display: flex;
  gap: 0.2rem;
  overflow: hidden;
  flex-wrap: wrap;

  ${p}:hover & {
    border-top: 4px solid ${e=>e.theme.text};
  }
`,B=o.span`
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

  ${i(25)`  
    font-size:calc(0.7em);
    padding: 0.4em 0.9em;  
  `};
`,A=o.footer`
  display: flex;
  justify-content: space-between;
`,D=o(b)`
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
`,L=o(b)`
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
`,f=o.span`
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
`,P=(e,n)=>{let r="";return e==="Ready"?r="#74febd":e==="Development"?r="#64e9ff":e==="Maintenance"&&(r="#ff4066"),e==="Ready"?t(D,{style:{border:`3px solid ${r}`},to:{pathname:`${n}`},target:"_blank",children:"View Demo"}):e==="Development"?t(f,{style:{border:`3px solid ${r}`},children:"Coming Soon"}):e==="Maintenance"?t(f,{style:{border:`3px solid ${r}`},children:"Unavailable"}):null},j=e=>{const n=`https://www.google.com/search?q=${e}`;window.open(n,"_blank")},I={hidden:{scale:0},show:{scale:1,transition:{type:"spring",duration:.5}}},W=e=>{const{id:n,name:r,description:a,tags:l,demo:d,github:v,status:x}=e.data;return c(p,{variants:I,children:[t(C,{className:"animate__animated animate__flipInX animate__delay-1s",children:r}),t(E,{className:"animate__animated animate__zoomIn animate__delay-1s",children:a}),t(T,{className:"animate__animated animate__fadeInUp animate__delay-1s",children:l.map((g,w)=>c(B,{onClick:()=>j(g),children:["#",g]},w))}),c(A,{className:"animate__animated animate__fadeInUp animate__delay-1s",children:[P(x,d),t(L,{to:{pathname:`${v}`},className:"hvr-grow",target:"_blank",children:t($,{height:"100%"})})]})]},n)},M=s.lazy(()=>h(()=>import("./SocialIcons-634292d2.js"),["assets/SocialIcons-634292d2.js","assets/index-d572a681.js","assets/index-85df3ed2.css","assets/AllSvgs-6435270f.js","assets/motion-ce1830e7.js"])),V=s.lazy(()=>h(()=>import("./HomeButton-bdc6c15c.js"),["assets/HomeButton-bdc6c15c.js","assets/index-d572a681.js","assets/index-85df3ed2.css","assets/AllSvgs-6435270f.js"])),N=s.lazy(()=>h(()=>import("./LogoComponent-52930ba7.js"),["assets/LogoComponent-52930ba7.js","assets/index-d572a681.js","assets/index-85df3ed2.css"])),O=s.lazy(()=>h(()=>import("./BigTitle-b56b4276.js"),["assets/BigTitle-b56b4276.js","assets/index-d572a681.js","assets/index-85df3ed2.css"])),J=o(m.div)`
  background-color: ${e=>e.theme.body};
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 400vh;
  overflow: hidden;
`,U=o(m.ul)`
  position: fixed;
  top: 12rem;
  left: calc(10rem + 15vw);
  user-select: none;
  height: 40vh;
  display: flex;

  ${i(50)`
    left: calc(8rem + 15vw);
  `};

  ${i(40)`
    top: 30%;
    left: calc(6rem + 15vw);
  `};

  ${i(40)`
    left: calc(2rem + 15vw);
  `};

  ${i(25)`
    left: calc(1rem + 15vw);
  `};
`,F=o.span`
  display: block;
  position: fixed;
  right: 1rem;
  top: 1rem;
  width: 85px;
  height: 85px;
  z-index: 1;

  ${i(40)`
    width: 60px;
    height: 60px;
    svg {
      width: 60px;
      height: 60px;
    }
  `};

  ${i(25)`
    width: 50px;
    height: 50px;
    svg {
      width: 50px;
      height: 50px;
    }
  `};
`,G=y`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
`,H=o(m.div)`
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
`,K={hidden:{opacity:0},show:{opacity:1,transition:{staggerChildren:.2,duration:.5}}},Q=e=>{const n=["Ready","Development","Maintenance"];return e.sort((r,a)=>n.indexOf(r.status)-n.indexOf(a.status))},ee=()=>{const e=s.useRef(null),n=s.useRef(null);s.useEffect(()=>{const a=()=>{const l=e.current,d=window.pageYOffset;l&&(l.style.transform=`translateX(${-d}px)`),n.current&&(n.current.style.transform=`rotate(${-d}deg)`)};return window.addEventListener("scroll",a),()=>{window.removeEventListener("scroll",a)}},[]);const r=Q(z);return c(k,{theme:u,children:[c(R,{children:[t("title",{children:"Projects - My Portfolio"}),t("meta",{name:"description",content:"Projects: Showcasing what I've been working on."})]}),t(s.Suspense,{fallback:t(S,{}),children:c(J,{initial:{opacity:0},animate:{opacity:1,transition:{duration:1}},exit:{opacity:0,transition:{duration:.5}},children:[t(N,{theme:"dark"}),t(V,{}),t(M,{theme:"dark"}),t(U,{ref:e,variants:K,initial:"hidden",animate:"show",children:r.map(a=>t(W,{data:a},a.id))}),t(O,{text:"PROJECTS",top:"10%",right:"20%"}),t(F,{ref:n,children:t(_,{width:85,height:85,fill:u.text})}),t(H,{children:t("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",children:t("path",{d:"M12 21l-12-18h24z"})})})]},"project")})]})};export{ee as default};
