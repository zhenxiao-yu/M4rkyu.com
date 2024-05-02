import{s as o,m as n,D as e,j as d,c as t,N as h}from"./index-ca4d20e1.js";import{G as k,L as p,I as u,F as g,Y as w}from"./AllSvgs-7c618cbc.js";import{m as a}from"./motion-c17dc8cf.js";const y=o.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 2rem;
  z-index: 3;
  & > *:not(:last-child) {
    margin: 0.5rem 0;
    ${n(20)`
      margin: 0.3rem 0;
    `};
  }
  ${n(40)`
    left: 1rem;
    svg {
      width: 20px;
      height: 20px;
    }
  `};
`,b=o(a.span)`
  width: 2px;
  height: 8rem;
  background-color: ${i=>i.color==="dark"?e.text:e.body};
`,f=[{id:"github",Icon:k,link:"https://github.com/zhenxiao-yu"},{id:"linkedin",Icon:p,link:"https://www.linkedin.com/in/your-profile"},{id:"instagram",Icon:u,link:"https://www.instagram.com/m4rkyu/"},{id:"facebook",Icon:g,link:"https://www.facebook.com/mark.yu.3762584"},{id:"youtube",Icon:w,link:"https://www.youtube.com/channel/UCUY09EUdbMoyDeWrMBYcUZQ"}],$=i=>{const s=window.matchMedia("(max-width: 40em)").matches;return d(y,{children:[f.map(({id:r,Icon:m,link:c},l)=>t(a.div,{initial:{transform:"scale(0)"},animate:{scale:[0,1,1.5,1]},transition:{type:"spring",duration:1,delay:1+l*.2},children:t(h,{style:{color:"inherit"},target:"_blank",to:{pathname:c},children:t(m,{width:25,height:25,fill:i.theme==="dark"?`${e.text}`:`${e.body}`})})},r)),t(b,{initial:{height:0},animate:{height:s?"5rem":"8rem"},color:i.theme,transition:{type:"spring",duration:1,delay:.8}})]})};export{$ as default};
