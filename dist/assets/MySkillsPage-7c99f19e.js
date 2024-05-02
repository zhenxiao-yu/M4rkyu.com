import{r,d as l,s as c,m as t,c as e,e as d,l as m,L as g,j as o}from"./index-ca4d20e1.js";import{D as p,a as v}from"./AllSvgs-7c618cbc.js";import{m as h}from"./motion-c17dc8cf.js";const f=r.lazy(()=>l(()=>import("./SocialIcons-b47d7a96.js"),["assets/SocialIcons-b47d7a96.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css","assets/AllSvgs-7c618cbc.js","assets/motion-c17dc8cf.js"])),u=r.lazy(()=>l(()=>import("./HomeButton-6c13a292.js"),["assets/HomeButton-6c13a292.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css","assets/AllSvgs-7c618cbc.js"])),_=r.lazy(()=>l(()=>import("./LogoComponent-65af8458.js"),["assets/LogoComponent-65af8458.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css"])),b=r.lazy(()=>l(()=>import("./ParticlesComponent-26f4581c.js").then(i=>i.af),["assets/ParticlesComponent-26f4581c.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css"])),y=r.lazy(()=>l(()=>import("./BigTitle-59bc404b.js"),["assets/BigTitle-59bc404b.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css"])),w=c(h.div)`
  background-color: ${i=>i.theme.body};
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
  justify-content: space-evenly;
  align-items: center;

  ${t(50)`
            flex-direction:column;  
            padding:8rem 0;
height:auto;
            &>*:nth-child(5){
              margin-bottom:5rem;
            }
  `};
  ${t(30)`
           
            &>*:nth-child(5){
              margin-bottom:4rem;
            }
           
  `};
`,s=c(h.div)`
  border: 2px solid ${i=>i.theme.text};
  color: ${i=>i.theme.text};
  background-color: ${i=>i.theme.body};
  padding: 2rem;
  width: 30vw;
  height: 60vh;
  z-index: 3;
  line-height: 1.5;

  ${t(60)`
            height: 55vh;
  `};

  ${t(50)`
              width: 50vw;
              height: max-content;

  `};

  font-family: "Poppins", sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    color: ${i=>i.theme.body};
    background-color: ${i=>i.theme.text};
  }
`,a=c.h2`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: calc(1em + 1vw);

  ${t(60)`
          font-size:calc(0.8em + 1vw);
  `};

  ${t(50)`
          font-size:calc(1em + 2vw);
          margin-bottom:1rem;
  `};

  ${t(30)`
                      font-size:calc(1em + 1vw);
  `};
  ${t(25)`
                      font-size:calc(0.8em + 1vw);
                      svg{
                        width:30px;
                        height:30px;
                      }
  `};

  ${s}:hover & {
    & > * {
      fill: ${i=>i.theme.body};
    }
  }

  & > *:first-child {
    margin-right: 1rem;
  }
`,n=c.div`
  color: ${i=>i.theme.text};
  font-size: calc(0.6em + 1vw);
  padding: 0.5rem 0;
  ${s}:hover & {
    color: ${i=>i.theme.body};
  }

  ${t(50)`
            font-size: calc(0.8em + 1vw);

  `};

  ${t(30)`
                      font-size:calc(0.7em + 1vw);

              

  `};

  ${t(25)`
                      font-size:calc(0.5em + 1vw);

              

  `};

  strong {
    margin-bottom: 1rem;
    text-transform: uppercase;
  }
  ul,
  p {
    margin-left: 2rem;
  }
`,D=()=>e(d,{theme:m,children:e(r.Suspense,{fallback:e(g,{}),children:o(w,{initial:{opacity:0},animate:{opacity:1,transition:{duration:1}},exit:{opacity:0,transition:{duration:.5}},children:[e(_,{theme:"light"}),e(u,{}),e(f,{theme:"light"}),e(b,{theme:"light"}),o(s,{children:[o(a,{children:[e(p,{width:40,height:40})," Designer"]}),e(n,{children:"I love to create design which speaks, Keep it clean, minimal and simple."}),o(n,{children:[e("strong",{children:"I like to Design"})," ",e("br",{}),o("ul",{children:[e("li",{children:"Web Design"}),e("li",{children:"Mobile Apps"})]})]}),o(n,{children:[e("strong",{children:"Tools"})," ",e("br",{}),e("ul",{children:e("li",{children:"Figma"})})]})]}),o(s,{children:[o(a,{children:[e(v,{width:40,height:40})," Frontend Developer"]}),e(n,{children:"I value business or brand for which i'm creating, thus i enjoy bringing new ideas to life."}),o(n,{children:[e("strong",{children:"Skills"})," ",e("br",{}),e("p",{children:"Html, Css, Js, React, Redux, Sass, Bootstrap, Tailwind, Firebase etc."})]}),o(n,{children:[e("strong",{children:"Tools"})," ",e("br",{}),e("p",{children:"VScode, Github, Codepen etc."})]})]}),e(y,{text:"Skills",top:"80%",right:"30%"})]},"skills")})});export{D as default};
