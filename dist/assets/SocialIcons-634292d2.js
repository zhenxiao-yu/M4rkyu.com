import{s as n,m as e,D as a,a as d,b as t,N as h}from"./index-d572a681.js";import{c as k,L as u,I as p,F as g,Y as w}from"./AllSvgs-6435270f.js";import{m as o}from"./motion-ce1830e7.js";const b=n.div`
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

`,y=n(o.span)`
  width: 3px;
  height: 3.5rem;
  background-color: ${i=>i.color==="dark"?a.text:a.body};
`,x=[{id:"github",Icon:k,link:"https://github.com/zhenxiao-yu"},{id:"linkedin",Icon:u,link:"https://www.linkedin.com/in/mark-yu-a586a2211/"},{id:"instagram",Icon:p,link:"https://www.instagram.com/m4rkyu/"},{id:"facebook",Icon:g,link:"https://www.facebook.com/mark.yu.3762584"},{id:"youtube",Icon:w,link:"https://www.youtube.com/channel/UCUY09EUdbMoyDeWrMBYcUZQ"}],$=i=>{const s=window.matchMedia("(max-width: 40em)").matches;return d(b,{children:[x.map(({id:r,Icon:m,link:c},l)=>t(o.div,{initial:{transform:"scale(0)"},animate:{scale:[0,1,1.5,1]},transition:{type:"spring",duration:1,delay:1+l*.2},children:t(h,{style:{color:"inherit"},target:"_blank",to:{pathname:c},children:t(m,{width:25,height:25,fill:i.theme==="dark"?`${a.text}`:`${a.body}`})})},r)),t(y,{initial:{height:0},animate:{height:s?"8rem":"5rem"},color:i.theme,transition:{type:"spring",duration:1,delay:.8}})]})};export{$ as default};
