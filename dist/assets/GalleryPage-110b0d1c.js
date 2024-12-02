import{r as a,c as N,q as I,o as O,d as $,e as z,R as w,s as _,a as n,j as g,w as P,_ as x,F as j,f as S}from"./index-81b8ab02.js";import{H as R}from"./Helmet-f54e6b7c.js";import{m as b}from"./motion-33849963.js";import{T}from"./index-4021e6fb.js";import{G as W}from"./iconBase-f2c7985c.js";const D=e=>{const[t,o]=a.useState([]),[i,s]=a.useState(null);return a.useEffect(()=>{const l=N(z,e),c=I(l,O("date","desc")),u=$(c,m=>{const r=m.docs.map(p=>({...p.data(),id:p.id}));o(r)},m=>{console.error("Error fetching documents: ",m),s(m.message)});return()=>{u()}},[e]),{docs:t,error:i}};function C(){return C=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var o=arguments[t];for(var i in o)Object.prototype.hasOwnProperty.call(o,i)&&(e[i]=o[i])}return e},C.apply(this,arguments)}function H(e,t){e.prototype=Object.create(t.prototype),e.prototype.constructor=e,E(e,t)}function E(e,t){return E=Object.setPrototypeOf||function(i,s){return i.__proto__=s,i},E(e,t)}var k=function(e){H(t,e);function t(){return e.apply(this,arguments)||this}var o=t.prototype;return o.getColumns=function(){var s=this.props,l=s.children,c=s.columnsCount,u=Array.from({length:c},function(){return[]}),m=0;return w.Children.forEach(l,function(r){r&&w.isValidElement(r)&&(u[m%c].push(r),m++)}),u},o.renderColumns=function(){var s=this.props.gutter;return this.getColumns().map(function(l,c){return w.createElement("div",{key:c,style:{display:"flex",flexDirection:"column",justifyContent:"flex-start",alignContent:"stretch",flex:1,width:0,gap:s}},l.map(function(u){return u}))})},o.render=function(){var s=this.props,l=s.gutter,c=s.className,u=s.style;return w.createElement("div",{style:C({display:"flex",flexDirection:"row",justifyContent:"center",alignContent:"stretch",boxSizing:"border-box",width:"100%",gap:l},u),className:c},this.renderColumns())},t}(w.Component);k.propTypes={};k.defaultProps={columnsCount:3,gutter:"0",className:null,style:{}};var B=1,L=typeof window<"u"?a.useLayoutEffect:a.useEffect,G=function(){var t=a.useState(!1),o=t[0],i=t[1];return L(function(){i(!0)},[]),o},A=function(){var t=G(),o=a.useState(window.innerWidth),i=o[0],s=o[1],l=a.useCallback(function(){t&&s(window.innerWidth)},[t]);return L(function(){if(t)return window.addEventListener("resize",l),l(),function(){return window.removeEventListener("resize",l)}},[t,l]),i},M=function(t){var o=t.columnsCountBreakPoints,i=o===void 0?{350:1,750:2,900:3}:o,s=t.children,l=t.className,c=l===void 0?null:l,u=t.style,m=u===void 0?null:u,r=A(),p=a.useMemo(function(){var d=Object.keys(i).sort(function(f,y){return f-y}),h=d.length>0?i[d[0]]:B;return d.forEach(function(f){f<r&&(h=i[f])}),h},[r,i]);return w.createElement("div",{className:c,style:m},w.Children.map(s,function(d,h){return w.cloneElement(d,{key:h,columnsCount:p})}))};M.propTypes={};const F=_(b.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`,U=_(b.div)`
  position: relative;
  width: ${e=>e.width}px;
  height: ${e=>e.height}px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg,#0000 18.75%,#090a0b 0 31.25%,#0000 0),
      repeating-linear-gradient(45deg,#090a0b -6.25% 6.25%,#ece9e8 0 18.75%);
  background-size: 20px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  overflow: hidden;

  @media (max-width: 768px) {
    width: ${e=>e.width*.9}px;
    height: ${e=>e.height*.9}px;
  }

  @media (max-width: 480px) {
    width: ${e=>e.width*.8}px;
    height: ${e=>e.height*.8}px;
  }
`,V=_.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`,q=_(b.img)`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 5px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
`,Y=_.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.5);
  padding: 0.5rem;
  border-radius: 5px;
  pointer-events: none;
`,J=({setSelectedImg:e,selectedImg:t})=>{const[o,i]=a.useState({width:0,height:0}),s=c=>{c.target.classList.contains("backdrop")&&e(null)},l=c=>{const{naturalWidth:u,naturalHeight:m}=c.target,r=window.innerWidth*.9,p=window.innerHeight*.9;let d=u,h=m;if(d>r){const f=r/d;d=r,h=h*f}if(h>p){const f=p/h;h=p,d=d*f}i({width:d,height:h})};return n(F,{className:"backdrop",onClick:s,initial:{opacity:0},animate:{opacity:1},children:n(U,{width:o.width,height:o.height,initial:{y:"-150vh"},animate:{y:0},children:g(V,{children:[n(q,{src:t,alt:"enlarged pic",onLoad:l}),n(Y,{children:"M4rkyu.com"})]})})})};function K(e){return W({tag:"svg",attr:{viewBox:"0 0 20 20",fill:"currentColor","aria-hidden":"true"},child:[{tag:"path",attr:{fillRule:"evenodd",d:"M4.293 15.707a1 1 0 010-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414 0zm0-6a1 1 0 010-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L10 5.414 5.707 9.707a1 1 0 01-1.414 0z",clipRule:"evenodd"}}]})(e)}const Q=a.lazy(()=>x(()=>import("./Anchor-306058f6.js"),["assets/Anchor-306058f6.js","assets/index-81b8ab02.js","assets/index-139dcfa0.css","assets/AllSvgs-0f0c20e8.js"])),X=a.lazy(()=>x(()=>import("./SocialIcons-c0666d73.js"),["assets/SocialIcons-c0666d73.js","assets/index-81b8ab02.js","assets/index-139dcfa0.css","assets/AllSvgs-0f0c20e8.js","assets/motion-33849963.js"])),Z=a.lazy(()=>x(()=>import("./HomeButton-908b3511.js"),["assets/HomeButton-908b3511.js","assets/index-81b8ab02.js","assets/index-139dcfa0.css","assets/AllSvgs-0f0c20e8.js"])),ee=a.lazy(()=>x(()=>import("./LogoComponent-6e5fe017.js"),["assets/LogoComponent-6e5fe017.js","assets/index-81b8ab02.js","assets/index-139dcfa0.css"])),te=a.lazy(()=>x(()=>import("./BigTitle-4207a5c4.js"),["assets/BigTitle-4207a5c4.js","assets/index-81b8ab02.js","assets/index-139dcfa0.css"])),ne=()=>n("div",{className:"fallback",children:n("p",{children:"Loading content, please wait..."})}),oe=a.memo(ee),re=a.memo(Z),ae=a.memo(X),ie=a.memo(Q),se=a.memo(te),le=({match:e,history:t})=>{const o=e.params.section,[i,s]=a.useState(null),{docs:l}=D("images"),[c,u]=a.useState({}),[m,r]=a.useState(o||""),p=a.useRef(!1);a.useEffect(()=>{p.current=!0},[]),a.useEffect(()=>{o&&r(o)},[o]);const d=a.useCallback(y=>{u(v=>({...v,[y]:!1}))},[]),h=a.useCallback(y=>{const v=y.target.value;v&&(r(v),t.push(`/gallery/${v}`))},[t]),f=a.useCallback(y=>l.filter(v=>v.section===y),[l]);return g(j,{children:[g(R,{children:[n("title",{children:"Gallery - Mark Yu"}),n("link",{rel:"canonical",href:`https://www.m4rkyu.com/gallery/${o}`}),n("meta",{property:"og:title",content:`Gallery - ${o||"Mark Yu"}`}),n("meta",{property:"og:description",content:"Explore the gallery of Mark Yu, showcasing various sections of images."}),n("meta",{property:"og:url",content:`https://www.m4rkyu.com/gallery/${o}`}),n("meta",{name:"twitter:card",content:"summary_large_image"})]}),i&&n(J,{selectedImg:i,setSelectedImg:s}),g("div",{className:"container",children:[g(a.Suspense,{fallback:n(ne,{}),children:[n(oe,{}),n(re,{}),n(ae,{}),n(ie,{number:0}),n(se,{text:"Gallery",left:"25rem",top:"15rem"})]}),n(de,{selectedImg:i,handleScrollToSection:h}),m?S.map((y,v)=>m===y.header.toLowerCase()&&n(ce,{index:v,section:y,filterDocs:f,docs:l,setSelectedImg:s,handleImageLoad:d,loading:c},v)):n(ue,{})]})]})},ce=({index:e,section:t,filterDocs:o,docs:i,setSelectedImg:s,handleImageLoad:l,loading:c})=>{const u=a.useRef({}),m=a.useCallback(r=>{setLoading(p=>({...p,[r]:"error"}))},[]);return a.useEffect(()=>{const r=new IntersectionObserver(d=>{d.forEach(h=>{if(h.isIntersecting){const f=h.target;f.src=f.dataset.src,r.unobserve(f)}})},{threshold:.1});return Object.values(u.current).forEach(d=>{d&&r.observe(d)}),()=>r.disconnect()},[i]),g("div",{className:"section-container",id:`section-${e}`,children:[n("div",{className:"section-header",children:n("h2",{className:"animate__animated animate__zoomIn",children:t.header})}),n("h3",{className:"animate__animated animate__backInUp",children:t.subheader}),o(t.header).length===0?n("div",{className:"empty-message",children:n("h3",{children:"Oops! No images available at the moment"})}):n(M,{columnsCountBreakPoints:{350:2,750:4,900:6},children:n(k,{gutter:"10px",children:o(t.header).map(r=>g(b.div,{className:"image-box animate__animated animate__zoomInUp",layout:!0,whileHover:{opacity:1},onClick:()=>s(r.url),initial:"hidden",animate:"visible",exit:"exit",variants:{hidden:{opacity:0,scale:.8,y:50},visible:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.8,y:-50}},transition:{duration:.5},children:[g("div",{className:"image-container",children:[c[r.id]!==!1&&n("div",{className:"loader"}),n("img",{ref:p=>u.current[r.id]=p,"data-src":r.url,alt:`Gallery Image ${r.title||"No title"}`,onLoad:()=>l(r.id),onError:()=>m(r.id),style:{display:c[r.id]?"none":"block"}})]}),g("div",{className:"image-info",children:[n("h4",{children:r.title}),n("p",{children:r.date})]})]},r.id))})})]})},de=({selectedImg:e,handleScrollToSection:t})=>n("div",{className:`dropdown-container ${e?"hidden":""}`,children:g("select",{onChange:t,children:[n("option",{value:"",children:"Select a section..."}),S.map((o,i)=>n("option",{value:o.header.toLowerCase(),children:o.header},i))]})}),ue=()=>g("div",{className:"hero-section",children:[n(K,{size:"3rem"}),n("h1",{children:"Welcome to My Gallery"}),n(T,{words:["<p>Explore various sections to see different collections of images.</p>"],loop:0,typeSpeed:50,deleteSpeed:50,delaySpeed:1500,cursor:!0,"aria-label":"<p>Explore various sections to see different collections of images.</p>"})]}),ye=P(le);export{ye as default};
