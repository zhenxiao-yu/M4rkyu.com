import{s as o,N as f,m as a,c as t,j as d,r as n,d as i,L as v}from"./index-ca4d20e1.js";import{m as s}from"./motion-c17dc8cf.js";const _="/assets/blogBG-edce5aa6.png",w=[{id:1,name:"Build Website with ReactJS, Styled-components and GSAP for Scrolling Animations",tags:["react","gsap","styled-components"],date:"13 May, 2021",imgSrc:"https://res.cloudinary.com/practicaldev/image/fetch/s--sBeV06Xc--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2yrzy75q4dzibqz6rf82.png",link:"https://dev.to/codebucks/build-website-with-reactjs-styled-components-and-gsap-for-scrolling-animations-2f10"},{id:2,name:"How to create React Hamburger Menu using Styled-Components",tags:["react","styled-components"],date:"5 July, 2021",imgSrc:"https://codebucks.hashnode.dev/_next/image?url=https%3A%2F%2Fcdn.hashnode.com%2Fres%2Fhashnode%2Fimage%2Fupload%2Fv1625479747640%2F7KzwP9nmj.png%3Fw%3D1600%26h%3D840%26fit%3Dcrop%26crop%3Dentropy%26auto%3Dcompress%2Cformat%26format%3Dwebp&w=1920&q=75",link:"https://codebucks.hashnode.dev/react-hamburger-menu"},{id:3,name:"React Loading Screen: Try these 3 cool loading screens for your app",tags:["react","react-lottie","styled-components"],date:"6 July, 2021",imgSrc:"https://codebucks.hashnode.dev/_next/image?url=https%3A%2F%2Fcdn.hashnode.com%2Fres%2Fhashnode%2Fimage%2Fupload%2Fv1625552344293%2Fegwis0UIX.png%3Fw%3D1600%26h%3D840%26fit%3Dcrop%26crop%3Dentropy%26auto%3Dcompress%2Cformat%26format%3Dwebp&w=1920&q=75",link:"https://codebucks.hashnode.dev/react-loading-screens"},{id:4,name:"How to build a Fabulous Todo App using React, Redux and Framer-Motion",tags:["react","redux","framer-motion"],date:"26 May, 2021",imgSrc:"https://res.cloudinary.com/practicaldev/image/fetch/s--r5oUDhhT--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/036s7j5b73up7455rdth.png",link:"https://dev.to/codebucks/build-redux-react-todo-list-app-with-animations-using-framer-motion-1mp1"},{id:5,name:"What is Higher Order Component (HOC) in React JS?",tags:["react","reactJS","web-development"],date:"3 Feb, 2021",imgSrc:"https://codebucks.hashnode.dev/_next/image?url=https%3A%2F%2Fcdn.hashnode.com%2Fres%2Fhashnode%2Fimage%2Fupload%2Fv1625295480148%2FlyKj8bpHK.jpeg%3Fw%3D1600%26h%3D840%26fit%3Dcrop%26crop%3Dentropy%26auto%3Dcompress%2Cformat%26format%3Dwebp&w=1920&q=75",link:"https://codebucks.hashnode.dev/what-is-higher-order-component"},{id:6,name:"How to implement Pagination Component in React from scratch",tags:["react","css"],date:"5 Jan, 2021",imgSrc:"https://codebucks.hashnode.dev/_next/image?url=https%3A%2F%2Fcdn.hashnode.com%2Fres%2Fhashnode%2Fimage%2Fupload%2Fv1625240050668%2FGAya9b0XK.png%3Fw%3D1600%26h%3D840%26fit%3Dcrop%26crop%3Dentropy%26auto%3Dcompress%2Cformat%26format%3Dwebp&w=1920&q=75",link:"https://codebucks.hashnode.dev/pagination-in-react"},{id:7,name:"What is Redux ? Simply Explained!",tags:["react","redux","javascript"],date:"16 May, 2021",imgSrc:"https://res.cloudinary.com/practicaldev/image/fetch/s--ZY1EK-Eo--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/bcz1u90oq3prr5fga3fs.png",link:"https://dev.to/codebucks/what-is-redux-simply-explained-2ch7"},{id:8,name:"How to create Sidebar navigation menu in ReactJS with react router and framer-motion",tags:["react","framer-motion","styled-components"],date:"26 May, 2021",imgSrc:"https://res.cloudinary.com/practicaldev/image/fetch/s--rv4I8UwE--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/0a9h50milhlf1us6mn4a.png",link:"https://dev.to/codebucks/build-sidebar-navigation-menu-in-reactjs-with-react-router-and-framer-motion-for-cool-page-transition-effects-4bc3"}],m=o(s(f))`
  backdrop-filter: blur(2px);
  box-shadow: 0 0 1rem 0 rgba(0, 0, 0, 0.2);
  text-decoration: none;
  width: calc(10rem + 15vw);
  height: 20rem;
  border: 2px solid ${e=>e.theme.text};
  padding: 1rem;
  color: ${e=>e.theme.text};

  display: flex;
  flex-direction: column;
  z-index: 5;

  cursor: pointer;
  &:hover {
    color: ${e=>e.theme.body};
    background-color: ${e=>e.theme.text};
    transition: all 0.3s ease;
  }

  ${a(50)`
    width:calc(60vw);
  `};

  ${a(30)`
    height:18rem;
  `};

  ${a(25)`
    height:14rem;
    padding:0.8rem;
    backdrop-filter: none;
  `};
`,y=o.div`
  background-image: ${e=>`url(${e.img})`};
  width: 100%;
  height: 60%;
  background-size: cover;
  border: 1px solid transparent;
  background-position: center center;
  ${a(25)`
    height:70%;
  `};

  ${m}:hover & {
    border: 1px solid ${e=>e.theme.body};
  }
`,F=o.h3`
  color: inherit;
  padding: 0.5rem 0;
  padding-top: 1rem;
  font-family: "Poppins", sans-serif;
  font-weight: 700;
  ${a(40)`
    font-size:calc(0.8em + 1vw);
  `};

  ${a(25)`
    font-size:calc(0.6em + 1vw);
  `};

  border-bottom: 1px solid ${e=>e.theme.text};

  ${m}:hover & {
    border-bottom: 1px solid ${e=>e.theme.body};
  }
`,x=o.div`
  padding: 0.5rem 0;
  ${a(25)`
    font-size:calc(0.5em + 1vw);
  `};
`,k=o.span`
  padding-right: 0.5rem;
`,D=o.span`
  padding: 0.5rem 0;
  ${a(25)`
    font-size:calc(0.5em + 1vw);
  `};
`,$=o(s.div)``,S={hidden:{scale:0},show:{scale:1,transition:{type:"spring",duration:.5}}},z=e=>{const{name:c,tags:r,date:l,imgSrc:h,link:g}=e.blog;return t($,{variants:S,children:d(m,{target:"_blank",to:{pathname:`${g}`},children:[t(y,{img:h}),t(F,{children:c}),t(x,{children:r.map((u,b)=>d(k,{children:["#",u]},b))}),t(D,{children:l})]})})},C=n.lazy(()=>i(()=>import("./Anchor-1a8cfded.js"),["assets/Anchor-1a8cfded.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css","assets/AllSvgs-7c618cbc.js"])),E=n.lazy(()=>i(()=>import("./SocialIcons-b47d7a96.js"),["assets/SocialIcons-b47d7a96.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css","assets/AllSvgs-7c618cbc.js","assets/motion-c17dc8cf.js"])),A=n.lazy(()=>i(()=>import("./HomeButton-6c13a292.js"),["assets/HomeButton-6c13a292.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css","assets/AllSvgs-7c618cbc.js"])),R=n.lazy(()=>i(()=>import("./LogoComponent-65af8458.js"),["assets/LogoComponent-65af8458.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css"])),P=n.lazy(()=>i(()=>import("./BigTitle-59bc404b.js"),["assets/BigTitle-59bc404b.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css"])),T=o(s.div)`
  background-image: url(${_});
  background-size: cover;
  background-repeat: repeat;
  background-attachment: fixed;
  background-position: center;
  user-select: none;
`,j=o.div`
  background-color: ${e=>e.theme.body};
  width: 100%;
  height: auto;
  position: relative;
  padding-bottom: 5rem;
`,q=o.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 10rem;
  ${a(30)`
    padding-top: 7rem;
  `};
`,H=o(s.div)`
  display: grid;
  grid-template-columns: repeat(2, minmax(calc(10rem + 15vw), 1fr));
  grid-gap: calc(0.3rem + 2vw);
  ${a(50)`
    grid-template-columns: 100%;
  `};
`,p={hidden:{opacity:0},show:{opacity:1,transition:{staggerChildren:.5,duration:.5}}},B=()=>{const[e,c]=n.useState(0);return n.useEffect(()=>{let r=(window.innerHeight-70)/30;c(parseInt(r))},[]),t(n.Suspense,{fallback:t(v,{}),children:t(T,{variants:p,initial:"hidden",animate:"show",exit:{opacity:0,transition:{duration:.5}},children:d(j,{children:[t(R,{}),t(A,{}),t(E,{}),t(C,{number:e}),t(q,{children:t(H,{variants:p,initial:"hidden",animate:"show",children:w.map(r=>t(z,{blog:r},r.id))})}),t(P,{text:"Posts",top:"5rem",left:"5rem"})]})})})};export{B as default};
