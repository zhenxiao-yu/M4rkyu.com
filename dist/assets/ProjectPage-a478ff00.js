import{s as o,m as i,N as p,j as c,c as t,r as n,d,e as y,D as m,L as x}from"./index-ca4d20e1.js";import{G as w,S}from"./AllSvgs-7c618cbc.js";import{m as l}from"./motion-c17dc8cf.js";const $=[{id:1,name:"Spring Boot Wiki",description:"A comprehensive full-stack wiki application combining Spring Boot with Vue 3, featuring a sophisticated management system for document and account handling, secure JWT authentication, and integrated E-charts for dynamic trend visualization.",tags:["Spring Boot","Vue.js","JWT","E-charts","MyBatis","Java","TypeScript","SQL"],demo:"",github:"https://github.com/zhenxiao-yu/Spring-Boot-Wiki"},{id:2,name:"Vue Grocery Delivery App",description:"This streamlined web application is designed for students to effortlessly explore, bookmark, and purchase essentials from nearby grocery stores, enhancing the shopping experience with intuitive navigation and interactive design.",tags:["Vue.js","SASS","REST API","Vue CLI","Vue Router","Web App"],demo:"",github:"https://github.com/zhenxiao-yu/Vue-Grocery-Delivery-App"},{id:3,name:"Spring Boot Blog",description:"A robust full-stack blogging platform built with MySQL and Spring Boot, utilizing Thymeleaf for server-side rendering and Semantic UI for a sleek, user-friendly interface. Features include post categorization by hashtags, categories, and dates.",tags:["Spring Boot","MySQL","Thymeleaf","Semantic UI","CSS","JavaScript","Web Development"],demo:"",github:"https://github.com/zhenxiao-yu/Spring-Boot-Blog"},{id:4,name:"React E-Commerce Website",description:"Create a vibrant online storefront with this React.js-powered e-commerce site, featuring a faux backend via JSON Server and stylish aesthetics with Node SASS and Bulma. Ideal for small businesses aiming to establish an online presence.",tags:["React","JSON Server","SASS","Bulma","React Router","Custom Hooks","E-commerce"],demo:"",github:"https://github.com/zhenxiao-yu/React-Ecommerce-Website"},{id:5,name:"Web3 Ethereum Wallet",description:"This decentralized application (dApp) leverages blockchain technology to enable users to securely and efficiently send cryptocurrency globally using Ethereum smart contracts. Built with React and TailwindCSS for a responsive user experience.",tags:["Web3","Blockchain","Solidity","React","TailwindCSS","Crypto Wallet","Smart Contracts"],demo:"",github:"https://github.com/zhenxiao-yu/web3-blockchain-app"},{id:6,name:"React Responsive Navigation",description:"Craft a seamless navigation experience with this responsive ReactJS navbar, featuring react-router integration for dynamic routing. Designed from scratch, this component is perfect for enhancing any web application with mobile-friendly navigation.",tags:["React","React Router","CSS","Responsive Design","Web Component"],demo:"http://react-responsive-navbar-codebucks27.vercel.app/",github:"https://github.com/codebucks27/React-responsive-navbar"}],h=o(l.li)`
  width: 16rem;
  height: 40vh;
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
        height:35vh;
  `};
  ${i(40)`
        width:14rem;
        margin-right:4rem;
        height:35vh;
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
`,k=o.h2`
  font-size: calc(1em + 0.5vw);
`,R=o.h4`
  font-size: calc(0.8em + 0.3vw);
  font-family: "Karla", sans-serif;
  font-weight: 500;
  ${i(25)`
  font-size:calc(0.7em + 0.3vw);
  `};
  ${i(20)`
  font-size:calc(0.6em + 0.3vw);
  `};
`,_=o.div`
  border-top: 2px solid ${e=>e.theme.body};
  padding-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  ${h}:hover & {
    border-top: 2px solid ${e=>e.theme.text};
  }
`,z=o.span`
  margin-right: 1rem;
  font-size: calc(0.8em + 0.3vw);
  ${i(25)`
  font-size:calc(0.7em);
  `};
`,E=o.footer`
  display: flex;
  justify-content: space-between;
`,T=o(p)`
  background-color: ${e=>e.theme.body};
  color: ${e=>e.theme.text};
  text-decoration: none;
  padding: 0.5rem calc(2rem + 2vw);
  border-radius: 0 0 0 50px;
  font-size: calc(1em + 0.5vw);

  ${h}:hover & {
    background-color: ${e=>e.theme.text};
    color: ${e=>e.theme.body};
  }
`,B=o(p)`
  color: inherit;
  text-decoration: none;

  ${h}:hover & {
    & > * {
      fill: ${e=>e.theme.text};
    }
  }
`,C={hidden:{scale:0},show:{scale:1,transition:{type:"spring",duration:.5}}},L=e=>{const{id:r,name:a,description:s,tags:g,demo:u,github:f}=e.data;return c(h,{variants:C,children:[t(k,{children:a}),t(R,{children:s}),t(_,{children:g.map((b,v)=>c(z,{children:["#",b]},v))}),c(E,{children:[t(T,{to:{pathname:`${u}`},target:"_blank",children:"Visit"}),t(B,{to:{pathname:`${f}`},target:"_blank",children:t(w,{width:30,height:30})})]})]},r)},A=n.lazy(()=>d(()=>import("./SocialIcons-b47d7a96.js"),["assets/SocialIcons-b47d7a96.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css","assets/AllSvgs-7c618cbc.js","assets/motion-c17dc8cf.js"])),W=n.lazy(()=>d(()=>import("./HomeButton-6c13a292.js"),["assets/HomeButton-6c13a292.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css","assets/AllSvgs-7c618cbc.js"])),D=n.lazy(()=>d(()=>import("./LogoComponent-65af8458.js"),["assets/LogoComponent-65af8458.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css"])),V=n.lazy(()=>d(()=>import("./BigTitle-59bc404b.js"),["assets/BigTitle-59bc404b.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css"])),j=o(l.div)`
  background-color: ${e=>e.theme.body};
  position: relative;
  display: flex;
  height: 400vh;
`,I=o(l.ul)`
  position: fixed;
  top: 12rem;
  left: calc(10rem + 15vw);
  user-select: none;
  height: 40vh;
  // /* height:200vh; */
  //border:1px solid white;

  display: flex;

  ${i(50)`
        left:calc(8rem + 15vw);

  `};

  ${i(40)`
  top: 30%;
        
        left:calc(6rem + 15vw);

  `};

  ${i(40)`
        
        left:calc(2rem + 15vw);

  `};
  ${i(25)`
        
        left:calc(1rem + 15vw);

  `};
`,P=o.span`
  display: block;
  position: fixed;
  right: 1rem;
  top: 1rem;
  width: 85px;
  height: 85px;

  z-index: 1;
  ${i(40)`
     width:60px;
         height:60px;   
       svg{
         width:60px;
         height:60px;
       }

  `};
  ${i(25)`
        width:50px;
         height:50px;
        svg{
         width:50px;
         height:50px;
       }

  `};
`,O={hidden:{opacity:0},show:{opacity:1,transition:{staggerChildren:.5,duration:.5}}},M=()=>{const e=n.useRef(null),r=n.useRef(null);return n.useEffect(()=>{let a=e.current;const s=()=>(a.style.transform=`translateX(${-window.pageYOffset}px)`,r.current.style.transform="rotate("+-window.pageYOffset+"deg)");return window.addEventListener("scroll",s),()=>{window.removeEventListener("scroll",s)}},[]),t(y,{theme:m,children:t(n.Suspense,{fallback:t(x,{}),children:c(j,{initial:{opacity:0},animate:{opacity:1,transition:{duration:1}},exit:{opacity:0,transition:{duration:.5}},children:[t(D,{theme:"dark"}),t(W,{}),t(A,{theme:"dark"}),t(I,{ref:e,variants:O,initial:"hidden",animate:"show",children:$.map(a=>t(L,{data:a},a.id))}),t(V,{text:"PROJECTS",top:"10%",right:"20%"}),t(P,{ref:r,children:t(S,{width:85,height:85,fill:m.text})})]},"project")})})};export{M as default};
