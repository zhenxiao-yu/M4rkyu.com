import{s as n,m as e,D as a,j as l,a as i,N as d}from"./index-81b8ab02.js";import{L as u,c as p,d as g,I as w,F as k,Y as f}from"./AllSvgs-0f0c20e8.js";import{m as o}from"./motion-33849963.js";const y=n.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 1.5rem;
  z-index: 3;
  & > *:not(:last-child) {
    margin: 0.5rem 0;
    ${e(20)`
      margin: 0.3rem 0;
    `};
  }
  ${e(40)`
    left: 1rem;
    svg {
      width: 20px;
      height: 20px;
    }
  `};

`,x=n(o.span)`
  width: 3px;
  height: calc(2.5rem + 1vw);  // Responsive height
  background-color: ${t=>t.color==="dark"?a.text:a.body};

  ${e(50)`
    height: calc(2rem + 0.5vw);  // Adjust height for smaller screens
  `}

  ${e(30)`
    height: calc(1.5rem + 0.5vw);  // Further adjustment for even smaller screens
  `}

  ${e(20)`
    height: calc(1rem + 0.5vw);  // Further adjustment for the smallest screens
  `}
`,b=[{id:"linkedin",Icon:u,link:"https://www.linkedin.com/in/zhenxiao-yu-a586a2211/"},{id:"github",Icon:p,link:"https://github.com/zhenxiao-yu"},{id:"spotify",Icon:g,link:"https://open.spotify.com/user/317xma3mkahx2sgwksrv72bvlywm?si=d87d26fee3e84210"},{id:"instagram",Icon:w,link:"https://www.instagram.com/m4rkyu/"},{id:"facebook",Icon:k,link:"https://www.facebook.com/mark.yu.3762584"},{id:"youtube",Icon:f,link:"https://www.youtube.com/channel/UCUY09EUdbMoyDeWrMBYcUZQ"}],j=t=>{const s=window.matchMedia("(max-width: 40em)").matches;return l(y,{children:[b.map(({id:r,Icon:m,link:c},h)=>i(o.div,{initial:{transform:"scale(0)"},animate:{scale:[0,1,1.5,1]},transition:{type:"spring",duration:1,delay:1+h*.2},children:i(d,{style:{color:"inherit"},target:"_blank",to:{pathname:c},children:i(m,{width:25,height:25,fill:t.theme==="dark"?`${a.text}`:`${a.body}`})})},r)),i(x,{initial:{height:0},animate:{height:s?"6rem":"3rem"},color:t.theme,transition:{type:"spring",duration:1,delay:.8}})]})};export{j as default};
