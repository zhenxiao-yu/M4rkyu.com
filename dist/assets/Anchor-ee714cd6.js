import{s as o,m,r as i,a as d,b as e}from"./index-d572a681.js";import{A as c,d as u}from"./AllSvgs-6435270f.js";const p=o.div`
  position: relative;
  ${m(40)`
    display:none;
  `};
`,w=o.div`
  position:absolute;
  top:0;
  right:2rem;
}
`,y=o.div`
  position: fixed;
  top: 0;
  right: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  transform: translateY(-100%);
  .chain {
    transform: rotate(135deg);
  }
`,b=f=>{const s=i.useRef(null),t=i.useRef(null);return i.useEffect(()=>{const r=()=>{let n=window.pageYOffset,l=window.innerHeight,a=document.body.offsetHeight,h=Math.max(a-(n+l))*100/(a-l);s.current.style.transform=`translateY(${-h}%)`,window.pageYOffset>5?t.current.style.display="none":t.current.style.display="block"};return window.addEventListener("scroll",r),()=>window.removeEventListener("scroll",r)},[]),d(p,{children:[e(w,{ref:t,className:"hidden",children:e(c,{width:70,height:70,fill:"currentColor"})}),d(y,{ref:s,children:[[...Array(f.number)].map((r,n)=>e(u,{style:{padding:"0.1rem 0"},width:25,height:25,fill:"currentColor",className:"chain"},n)),e(c,{width:70,height:70,fill:"currentColor"})]})]})};export{b as default};
