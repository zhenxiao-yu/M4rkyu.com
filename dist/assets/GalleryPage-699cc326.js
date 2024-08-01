import{r as n,d as N,q as I,o as M,e as z,f as O,R as f,s as _,a as t,j as h,_ as y,F as P,h as E}from"./index-784aae70.js";import{m as C}from"./motion-861d08e4.js";import{T}from"./index-be9a518a.js";import{G as j}from"./iconBase-bc493976.js";const R=o=>{const[e,i]=n.useState([]),[r,s]=n.useState(null);return n.useEffect(()=>{const l=N(O,o),u=I(l,M("date","desc")),c=z(u,a=>{const m=a.docs.map(v=>({...v.data(),id:v.id}));i(m)},a=>{console.error("Error fetching documents: ",a),s(a.message)});return()=>{c()}},[o]),{docs:e,error:r}};function x(){return x=Object.assign||function(o){for(var e=1;e<arguments.length;e++){var i=arguments[e];for(var r in i)Object.prototype.hasOwnProperty.call(i,r)&&(o[r]=i[r])}return o},x.apply(this,arguments)}function B(o,e){o.prototype=Object.create(e.prototype),o.prototype.constructor=o,b(o,e)}function b(o,e){return b=Object.setPrototypeOf||function(r,s){return r.__proto__=s,r},b(o,e)}var w=function(o){B(e,o);function e(){return o.apply(this,arguments)||this}var i=e.prototype;return i.getColumns=function(){var s=this.props,l=s.children,u=s.columnsCount,c=Array.from({length:u},function(){return[]}),a=0;return f.Children.forEach(l,function(m){m&&f.isValidElement(m)&&(c[a%u].push(m),a++)}),c},i.renderColumns=function(){var s=this.props.gutter;return this.getColumns().map(function(l,u){return f.createElement("div",{key:u,style:{display:"flex",flexDirection:"column",justifyContent:"flex-start",alignContent:"stretch",flex:1,width:0,gap:s}},l.map(function(c){return c}))})},i.render=function(){var s=this.props,l=s.gutter,u=s.className,c=s.style;return f.createElement("div",{style:x({display:"flex",flexDirection:"row",justifyContent:"center",alignContent:"stretch",boxSizing:"border-box",width:"100%",gap:l},c),className:u},this.renderColumns())},e}(f.Component);w.propTypes={};w.defaultProps={columnsCount:3,gutter:"0",className:null,style:{}};var D=1,S=typeof window<"u"?n.useLayoutEffect:n.useEffect,W=function(){var e=n.useState(!1),i=e[0],r=e[1];return S(function(){r(!0)},[]),i},$=function(){var e=W(),i=n.useState(window.innerWidth),r=i[0],s=i[1],l=n.useCallback(function(){e&&s(window.innerWidth)},[e]);return S(function(){if(e)return window.addEventListener("resize",l),l(),function(){return window.removeEventListener("resize",l)}},[e,l]),r},k=function(e){var i=e.columnsCountBreakPoints,r=i===void 0?{350:1,750:2,900:3}:i,s=e.children,l=e.className,u=l===void 0?null:l,c=e.style,a=c===void 0?null:c,m=$(),v=n.useMemo(function(){var p=Object.keys(r).sort(function(g,L){return g-L}),d=p.length>0?r[p[0]]:D;return p.forEach(function(g){g<m&&(d=r[g])}),d},[m,r]);return f.createElement("div",{className:u,style:a},f.Children.map(s,function(p,d){return f.cloneElement(p,{key:d,columnsCount:v})}))};k.propTypes={};const A=_(C.div)`
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
`,H=_.div`
  position: relative;
  max-width: 90%;
  max-height: 90%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    max-width: 90%;
    max-height: 80%;
    padding: 0.5rem;
  }

  @media (max-width: 480px) {
    max-width: 90%;
    max-height: 70%;
    padding: 0.25rem;
  }
`,G=_(C.img)`
  max-width: 100%;
  max-height: 100%;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
`,V=_.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.5);
  padding: 0.5rem;
  border-radius: 5px;
  pointer-events: none;
`,F=({setSelectedImg:o,selectedImg:e})=>t(A,{className:"backdrop",onClick:r=>{r.target.classList.contains("backdrop")&&o(null)},initial:{opacity:0},animate:{opacity:1},children:h(H,{children:[t(G,{src:e,alt:"enlarged pic",initial:{y:"-100vh"},animate:{y:0}}),t(V,{children:"M4rkyu.com"})]})});function U(o){return j({tag:"svg",attr:{viewBox:"0 0 20 20",fill:"currentColor","aria-hidden":"true"},child:[{tag:"path",attr:{fillRule:"evenodd",d:"M4.293 15.707a1 1 0 010-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414 0zm0-6a1 1 0 010-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L10 5.414 5.707 9.707a1 1 0 01-1.414 0z",clipRule:"evenodd"}}]})(o)}const q=n.lazy(()=>y(()=>import("./Anchor-fcd0c77d.js"),["assets/Anchor-fcd0c77d.js","assets/index-784aae70.js","assets/index-85df3ed2.css","assets/AllSvgs-a237324b.js"])),J=n.lazy(()=>y(()=>import("./SocialIcons-03ceccf8.js"),["assets/SocialIcons-03ceccf8.js","assets/index-784aae70.js","assets/index-85df3ed2.css","assets/AllSvgs-a237324b.js","assets/motion-861d08e4.js"])),K=n.lazy(()=>y(()=>import("./HomeButton-4ee5a9b5.js"),["assets/HomeButton-4ee5a9b5.js","assets/index-784aae70.js","assets/index-85df3ed2.css","assets/AllSvgs-a237324b.js"])),Q=n.lazy(()=>y(()=>import("./LogoComponent-b7f74ae8.js"),["assets/LogoComponent-b7f74ae8.js","assets/index-784aae70.js","assets/index-85df3ed2.css"])),X=n.lazy(()=>y(()=>import("./BigTitle-458c9346.js"),["assets/BigTitle-458c9346.js","assets/index-784aae70.js","assets/index-85df3ed2.css"])),Y=()=>t("div",{className:"fallback",children:t("p",{children:"Loading content, please wait..."})}),Z=n.memo(Q),ee=n.memo(K),te=n.memo(J),ne=n.memo(q),oe=n.memo(X),ue=()=>{const[o,e]=n.useState(null),{docs:i}=R("images"),[r,s]=n.useState({}),[l,u]=n.useState(""),c=n.useRef(!1);n.useEffect(()=>{c.current=!0},[]);const a=n.useCallback(p=>{s(d=>({...d,[p]:!1}))},[]),m=n.useCallback(p=>{const d=p.target.value;if(u(d),d&&c.current){const g=document.getElementById(d);g&&g.scrollIntoView({behavior:"smooth"})}},[]),v=n.useCallback(p=>i.filter(d=>d.section===p),[i]);return h(P,{children:[o&&t(F,{selectedImg:o,setSelectedImg:e}),h("div",{className:"container",children:[h(n.Suspense,{fallback:t(Y,{}),children:[t(Z,{}),t(ee,{}),t(te,{}),t(ne,{number:0}),t(oe,{text:"Gallery",left:"25rem",top:"15rem"})]}),t(ae,{selectedImg:o,handleScrollToSection:m}),l?E.map((p,d)=>l===`section-${d}`&&t(ie,{index:d,section:p,filterDocs:v,docs:i,setSelectedImg:e,handleImageLoad:a,loading:r},d)):t(re,{})]})]})},ae=({selectedImg:o,handleScrollToSection:e})=>t("div",{className:`dropdown-container ${o?"hidden":""}`,children:h("select",{onChange:e,children:[t("option",{value:"",children:"Select a section..."}),E.map((i,r)=>t("option",{value:`section-${r}`,children:i.header},r))]})}),re=()=>h("div",{className:"hero-section",children:[t(U,{size:"3rem"}),t("h1",{children:"Welcome to My Gallery"}),t(T,{words:["<p>Explore various sections to see different collections of images.</p>"],loop:0,typeSpeed:50,deleteSpeed:50,delaySpeed:1500,cursor:!0,"aria-label":"<p>Explore various sections to see different collections of images.</p>"})]}),ie=({index:o,section:e,filterDocs:i,setSelectedImg:r})=>{const[s,l]=n.useState({}),u=n.useCallback(a=>{l(m=>({...m,[a]:!1}))},[]),c=n.useCallback(a=>{l(m=>({...m,[a]:"error"}))},[]);return h("div",{className:"section-container",id:`section-${o}`,children:[t("div",{className:"section-header",children:t("h2",{className:"animate__animated animate__zoomIn",children:e.header})}),t("h3",{className:"animate__animated animate__backInUp",children:e.subheader}),i(e.header).length===0?t("div",{className:"empty-message",children:t("h3",{children:"Oops! No images available at the moment"})}):t(k,{columnsCountBreakPoints:{350:2,750:4,900:6},children:t(w,{gutter:"10px",children:i(e.header).map(a=>h(C.div,{className:"image-box animate__animated animate__zoomInUp",layout:!0,whileHover:{opacity:1},onClick:()=>r(a.url),initial:"hidden",animate:"visible",exit:"exit",variants:{hidden:{opacity:0,scale:.8,y:50},visible:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.8,y:-50}},transition:{duration:.5},children:[h("div",{className:"image-container",children:[s[a.id]!==!1&&t("div",{className:"loader"}),t("img",{src:a.url,loading:"lazy",alt:`Gallery Image ${a.id}`,onLoad:()=>u(a.id),onError:()=>c(a.id),style:{display:s[a.id]?"none":"block"}})]}),h("div",{className:"image-info",children:[t("h4",{children:a==null?void 0:a.title}),t("p",{children:a==null?void 0:a.date})]})]},a.id))})})]})};export{ue as default};
