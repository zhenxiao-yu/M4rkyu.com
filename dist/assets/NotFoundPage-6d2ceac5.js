import{W as e,s as o,a as t,j as n,N as i}from"./index-81b8ab02.js";import{m as r}from"./motion-33849963.js";const a=e`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`,s=o.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  // opacity:0.4;
  background-size: 58px 58px;
  animation: ${a} 1s ease-in-out;
`,c=o(r.div)`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  margin: 1rem;
`,d=o.h1`
  font-size: 3rem;
  color: rgb(8,9,10);
  margin-bottom: 1rem;
`,m=o.p`
  font-size: 1.25rem;
  color: #6c757d;
  margin-bottom: 2rem;
`,l=o(i)`
  font-size: 1rem;
  color: #007bff;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`,g=()=>t(s,{children:n(c,{initial:{y:-100,opacity:0},animate:{y:0,opacity:1},transition:{duration:.5},children:[t(d,{children:"404 Not Found"}),t(m,{children:"Sorry, the page you are looking for does not exist."}),t(l,{to:"/",children:"Go back to Home"})]})});export{g as default};
