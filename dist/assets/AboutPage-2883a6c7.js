import{r as m,p as U,g as J,_ as O,s as p,W as K,m as v,j as f,b as X,D as Z,a as i,L as ee}from"./index-784aae70.js";import{a as te,b as ne,c as ie,M as re}from"./index.esm-2c23ab51.js";import{F as ae}from"./index.esm-d8d07341.js";import{G as oe}from"./iconBase-bc493976.js";import{H as se}from"./Helmet-d4594485.js";import{m as R}from"./motion-861d08e4.js";var C={},F={exports:{}};/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/(function(e){(function(){var r={}.hasOwnProperty;function a(){for(var n="",l=0;l<arguments.length;l++){var s=arguments[l];s&&(n=t(n,o(s)))}return n}function o(n){if(typeof n=="string"||typeof n=="number")return n;if(typeof n!="object")return"";if(Array.isArray(n))return a.apply(null,n);if(n.toString!==Object.prototype.toString&&!n.toString.toString().includes("[native code]"))return n.toString();var l="";for(var s in n)r.call(n,s)&&n[s]&&(l=t(l,s));return l}function t(n,l){return l?n?n+" "+l:n+l:n}e.exports?(a.default=a,e.exports=a):window.classNames=a})()})(F);var Y=F.exports;C.__esModule=!0;C.default=void 0;var le=D(m),b=D(U),ce=D(Y);function D(e){return e&&e.__esModule?e:{default:e}}const H=({animate:e=!0,className:r="",layout:a="2-columns",lineColor:o="#FFF",children:t})=>(typeof window=="object"&&document.documentElement.style.setProperty("--line-color",o),le.default.createElement("div",{className:(0,ce.default)(r,"vertical-timeline",{"vertical-timeline--animate":e,"vertical-timeline--two-columns":a==="2-columns","vertical-timeline--one-column-left":a==="1-column"||a==="1-column-left","vertical-timeline--one-column-right":a==="1-column-right"})},t));H.propTypes={children:b.default.oneOfType([b.default.arrayOf(b.default.node),b.default.node]).isRequired,className:b.default.string,animate:b.default.bool,layout:b.default.oneOf(["1-column-left","1-column","2-columns","1-column-right"]),lineColor:b.default.string};var de=H;C.default=de;var N={};function S(){return S=Object.assign||function(e){for(var r=1;r<arguments.length;r++){var a=arguments[r];for(var o in a)Object.prototype.hasOwnProperty.call(a,o)&&(e[o]=a[o])}return e},S.apply(this,arguments)}function ue(e,r){e.prototype=Object.create(r.prototype),e.prototype.constructor=e,A(e,r)}function A(e,r){return A=Object.setPrototypeOf||function(o,t){return o.__proto__=t,o},A(e,r)}function fe(e,r){if(e==null)return{};var a={},o=Object.keys(e),t,n;for(n=0;n<o.length;n++)t=o[n],!(r.indexOf(t)>=0)&&(a[t]=e[t]);return a}var T=new Map,V=new WeakMap,B=0,q=void 0;function me(e){q=e}function he(e){return e?(V.has(e)||(B+=1,V.set(e,B.toString())),V.get(e)):"0"}function pe(e){return Object.keys(e).sort().filter(function(r){return e[r]!==void 0}).map(function(r){return r+"_"+(r==="root"?he(e.root):e[r])}).toString()}function ge(e){var r=pe(e),a=T.get(r);if(!a){var o=new Map,t,n=new IntersectionObserver(function(l){l.forEach(function(s){var d,u=s.isIntersecting&&t.some(function(h){return s.intersectionRatio>=h});e.trackVisibility&&typeof s.isVisible>"u"&&(s.isVisible=u),(d=o.get(s.target))==null||d.forEach(function(h){h(u,s)})})},e);t=n.thresholds||(Array.isArray(e.threshold)?e.threshold:[e.threshold||0]),a={id:r,observer:n,elements:o},T.set(r,a)}return a}function L(e,r,a,o){if(a===void 0&&(a={}),o===void 0&&(o=q),typeof window.IntersectionObserver>"u"&&o!==void 0){var t=e.getBoundingClientRect();return r(o,{isIntersecting:o,target:e,intersectionRatio:typeof a.threshold=="number"?a.threshold:0,time:0,boundingClientRect:t,intersectionRect:t,rootBounds:t}),function(){}}var n=ge(a),l=n.id,s=n.observer,d=n.elements,u=d.get(e)||[];return d.has(e)||d.set(e,u),u.push(r),s.observe(e),function(){u.splice(u.indexOf(r),1),u.length===0&&(d.delete(e),s.unobserve(e)),d.size===0&&(s.disconnect(),T.delete(l))}}var ve=["children","as","triggerOnce","threshold","root","rootMargin","onChange","skip","trackVisibility","delay","initialInView","fallbackInView"];function W(e){return typeof e.children!="function"}var E=function(e){ue(r,e);function r(o){var t;return t=e.call(this,o)||this,t.node=null,t._unobserveCb=null,t.handleNode=function(n){t.node&&(t.unobserve(),!n&&!t.props.triggerOnce&&!t.props.skip&&t.setState({inView:!!t.props.initialInView,entry:void 0})),t.node=n||null,t.observeNode()},t.handleChange=function(n,l){n&&t.props.triggerOnce&&t.unobserve(),W(t.props)||t.setState({inView:n,entry:l}),t.props.onChange&&t.props.onChange(n,l)},t.state={inView:!!o.initialInView,entry:void 0},t}var a=r.prototype;return a.componentDidUpdate=function(t){(t.rootMargin!==this.props.rootMargin||t.root!==this.props.root||t.threshold!==this.props.threshold||t.skip!==this.props.skip||t.trackVisibility!==this.props.trackVisibility||t.delay!==this.props.delay)&&(this.unobserve(),this.observeNode())},a.componentWillUnmount=function(){this.unobserve(),this.node=null},a.observeNode=function(){if(!(!this.node||this.props.skip)){var t=this.props,n=t.threshold,l=t.root,s=t.rootMargin,d=t.trackVisibility,u=t.delay,h=t.fallbackInView;this._unobserveCb=L(this.node,this.handleChange,{threshold:n,root:l,rootMargin:s,trackVisibility:d,delay:u},h)}},a.unobserve=function(){this._unobserveCb&&(this._unobserveCb(),this._unobserveCb=null)},a.render=function(){if(!W(this.props)){var t=this.state,n=t.inView,l=t.entry;return this.props.children({inView:n,entry:l,ref:this.handleNode})}var s=this.props,d=s.children,u=s.as,h=fe(s,ve);return m.createElement(u||"div",S({ref:this.handleNode},h),d)},r}(m.Component);E.displayName="InView";E.defaultProps={threshold:0,triggerOnce:!1,initialInView:!1};function ye(e){var r=e===void 0?{}:e,a=r.threshold,o=r.delay,t=r.trackVisibility,n=r.rootMargin,l=r.root,s=r.triggerOnce,d=r.skip,u=r.initialInView,h=r.fallbackInView,y=m.useRef(),x=m.useState({inView:!!u}),k=x[0],M=x[1],$=m.useCallback(function(_){y.current!==void 0&&(y.current(),y.current=void 0),!d&&_&&(y.current=L(_,function(z,j){M({inView:z,entry:j}),j.isIntersecting&&s&&y.current&&(y.current(),y.current=void 0)},{root:l,rootMargin:n,threshold:a,trackVisibility:t,delay:o},h))},[Array.isArray(a)?a.toString():a,l,n,s,d,t,h,o]);m.useEffect(function(){!y.current&&k.entry&&!s&&!d&&M({inView:!!u})});var g=[$,k.inView,k.entry];return g.ref=g[0],g.inView=g[1],g.entry=g[2],g}const be=Object.freeze(Object.defineProperty({__proto__:null,InView:E,default:E,defaultFallbackInView:me,observe:L,useInView:ye},Symbol.toStringTag,{value:"Module"})),we=J(be);N.__esModule=!0;N.default=void 0;var w=P(m),c=P(U),I=P(Y),_e=we;function P(e){return e&&e.__esModule?e:{default:e}}const Q=({children:e="",className:r="",contentArrowStyle:a=null,contentStyle:o=null,date:t="",dateClassName:n="",icon:l=null,iconClassName:s="",iconOnClick:d=null,onTimelineElementClick:u=null,iconStyle:h=null,id:y="",position:x="",style:k=null,textClassName:M="",intersectionObserverProps:$={rootMargin:"0px 0px -40px 0px",triggerOnce:!0},visible:g=!1})=>w.default.createElement(_e.InView,$,({inView:_,ref:z})=>w.default.createElement("div",{ref:z,id:y,className:(0,I.default)(r,"vertical-timeline-element",{"vertical-timeline-element--left":x==="left","vertical-timeline-element--right":x==="right","vertical-timeline-element--no-children":e===""}),style:k},w.default.createElement(w.default.Fragment,null,w.default.createElement("span",{style:h,onClick:d,className:(0,I.default)(s,"vertical-timeline-element-icon",{"bounce-in":_||g,"is-hidden":!(_||g)})},l),w.default.createElement("div",{style:o,onClick:u,className:(0,I.default)(M,"vertical-timeline-element-content",{"bounce-in":_||g,"is-hidden":!(_||g)})},w.default.createElement("div",{style:a,className:"vertical-timeline-element-content-arrow"}),e,w.default.createElement("span",{className:(0,I.default)(n,"vertical-timeline-element-date")},t)))));Q.propTypes={children:c.default.oneOfType([c.default.arrayOf(c.default.node),c.default.node]),className:c.default.string,contentArrowStyle:c.default.shape({}),contentStyle:c.default.shape({}),date:c.default.node,dateClassName:c.default.string,icon:c.default.element,iconClassName:c.default.string,iconStyle:c.default.shape({}),iconOnClick:c.default.func,onTimelineElementClick:c.default.func,id:c.default.string,position:c.default.string,style:c.default.shape({}),textClassName:c.default.string,visible:c.default.bool,intersectionObserverProps:c.default.shape({root:c.default.object,rootMargin:c.default.string,threshold:c.default.number,triggerOnce:c.default.bool})};var xe=Q;N.default=xe;var G={VerticalTimeline:C.default,VerticalTimelineElement:N.default};function ke(e){return oe({tag:"svg",attr:{fill:"currentColor",viewBox:"0 0 16 16"},child:[{tag:"path",attr:{fillRule:"evenodd",d:"M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5z"}}]})(e)}const Oe="/assets/pfp2-262b49f7.png",Me="/assets/spaceman-b47252a8.png",Ve=m.lazy(()=>O(()=>import("./SocialIcons-03ceccf8.js"),["assets/SocialIcons-03ceccf8.js","assets/index-784aae70.js","assets/index-85df3ed2.css","assets/AllSvgs-a237324b.js","assets/motion-861d08e4.js"])),Ie=m.lazy(()=>O(()=>import("./HomeButton-4ee5a9b5.js"),["assets/HomeButton-4ee5a9b5.js","assets/index-784aae70.js","assets/index-85df3ed2.css","assets/AllSvgs-a237324b.js"])),Ee=m.lazy(()=>O(()=>import("./LogoComponent-b7f74ae8.js"),["assets/LogoComponent-b7f74ae8.js","assets/index-784aae70.js","assets/index-85df3ed2.css"])),Ce=m.lazy(()=>O(()=>import("./ParticlesComponent-7a47f6d3.js").then(e=>e.af),["assets/ParticlesComponent-7a47f6d3.js","assets/index-784aae70.js","assets/index-85df3ed2.css"])),Ne=m.lazy(()=>O(()=>import("./BigTitle-458c9346.js"),["assets/BigTitle-458c9346.js","assets/index-784aae70.js","assets/index-85df3ed2.css"])),$e=p(R.div)`
  background-color: ${e=>e.theme.body};
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
`,ze=K`
  0% { transform: translateY(-10px); }
  50% { transform: translateY(15px) translateX(15px); }
  100% { transform: translateY(-10px); }
`,Se=p(R.div)`
  position: absolute;
  top: 10%;
  right: 5%;
  animation: ${ze} 4s ease infinite;
  width: 20vw;
  img {
    width: 100%;
    height: auto;
  }
`,Ae=p(R.div)`
  border: 2px solid ${e=>e.theme.text};
  color: ${e=>e.theme.text};
  padding: 5rem;
  border-radius: 0.5rem;
  width: 70vw;
  max-height: 68vh;
  overflow-y: auto;
  z-index: 3;
  line-height: 2.2;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  font-size: calc(0.75rem + 0.5vw);
  backdrop-filter: blur(6px);
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-family: "Poppins", sans-serif;
  letter-spacing: 1.2px;
  font-weight: 400;

  & h2 {
    font-size: 1.4em;
    margin-bottom: 1rem;
    color: ${e=>e.theme.text};
  }

  & p {
    margin-bottom: 1.5rem;
  }

  & a {
    color: ${e=>e.theme.text};
  }

  &::-webkit-scrollbar {
    width: 0.4rem;
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-image: linear-gradient(180deg, #733bdb 0%, #5ac6a5 52%, #ffffff 100%);
    border-radius: 2rem;
  }

  ${v(40)`
    width: 70vw;
    max-height: 70vh;
    font-size: calc(0.95rem + 0.4vw);
  `};

  ${v(30)`
    width: 65vw;
    max-height: 78vh;
    font-size: calc(0.95rem + 0vw);
    padding: 1.5rem;
  `};

  ${v(20)`
    padding: 1rem;
    font-size: calc(0.8rem + 0.8vw);
  `};
`,Te=p.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 2rem;

  ${v(40)`
    flex-direction: column;
    align-items: center;
  `};
`,Re=p.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;

  & p {
    display: flex;
    align-items: center;
    margin: 0.3rem 0;
    font-size: 0.85rem;
  }

  a{
    text-decoration: none;
  }

  & svg {
    margin-right: 0.5rem;
  }
`,De=p.img`
  width: 17vw;
  height: auto;
  margin-left: 2rem;
  border-radius: 50%;
  border: 10px solid ${e=>e.theme.text};

  ${v(40)`
    width: 40vw;
    margin-left: 0;
    margin-top: 1rem;
  `};
`,Le=p.div`
  background: ${e=>e.theme.text};
  color: ${e=>e.theme.body};
`,Pe=p.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`,je=p.h3`
  color: ${e=>e.theme.body};
  font-size: 1.3rem;
  font-weight: bold;
  line-height: 0.9rem;

  ${v(40)`
    font-size: 16px;
    line-height: 0.9rem;
  `};

  ${v(30)`
    font-size: 14px;
    line-height: 0.9rem;
  `};
`,Be=p.h3`
  color: ${e=>e.theme.body};
  font-size: 1.1rem;
  margin-top: 0.9rem;
  font-weight: 400;
  line-height: 1.3rem;

  ${v(40)`
   font-size: 0.8rem;
    line-height: 1.1rem;
  `};

  ${v(30)`
    font-size: 0.75rem;
    line-height: 0.95rem;
  `};
`,We=p.p`
  color: ${e=>e.theme.body};
  font-size: 1.5rem;
  font-weight: semi-bold;
  margin: 0;
`,Ue=p.ul`
  margin-top: 1rem;
  list-style-type: disc;
  margin-left: 1.25rem;

  ${v(30)`
    margin-left: 1rem;
    margin-top: 0.5rem;
  `};
`,Fe=p.li`
  color: ${e=>e.theme.body};
  font-size: 15px;
  padding-left: 0.25rem;
  letter-spacing: wider;

  ${v(40)`
    font-size: 12px;
    line-height: 0.9rem;
  `};

  ${v(30)`
    font-size: 10px;
  `};
`,Ye=({experience:e})=>i(G.VerticalTimelineElement,{contentStyle:{background:"rgb(236, 233, 232)",color:"rgb(8, 9, 10)"},contentArrowStyle:{borderRight:"15px solid rgb(236, 233, 232)"},date:"",iconStyle:{background:e.iconBg},icon:i(re,{size:24}),children:f(Le,{children:[f(Pe,{children:[i(je,{children:e.title}),i(Be,{children:e.date}),i(We,{children:e.company_name})]}),i(Ue,{children:e.points.map((r,a)=>i(Fe,{children:r},`experience-point-${a}`))})]})}),He=[{title:"Software Developer Intern",company_name:"J.D. Power",iconBg:"rgb(8, 9, 10)",date:"May 2022 - Aug 2023",points:["Designed and developed full-stack systems, specializing in backend data processing using Java, MySQL, Spring Boot, Apache Storm, and Apache Camel.","Managed and optimized complex data systems, created robust full-stack web applications, and improved user interfaces for enhanced user experience."]},{title:"Undergrad Research Assistant",company_name:"Western University",iconBg:"rgb(8, 9, 10)",date:"May 2021 - August 2021",points:["Contributed to the development of Augmented Reality environments for neurosurgical simulation applications using Vuforia and Unity3D.","Assisted in preparing a grant proposal to re-implement surgical training systems using Unreal Engine for deployment on Magic Leap headsets.","Developed a software toolkit for creating virtual worlds on the Magic Leap One AR headset, utilizing patient datasets from CT and MRI scans."]}],Ze=()=>f(X,{theme:Z,children:[f(se,{children:[i("title",{children:"About Me - Mark Yu"}),i("meta",{name:"description",content:"Learn more about Mark Yu, a full-stack web developer and artist based in Ontario, Canada."})]}),i(m.Suspense,{fallback:i(ee,{}),children:f($e,{initial:{opacity:0},animate:{opacity:1,transition:{duration:.5}},exit:{opacity:0,transition:{duration:.5}},children:[i(Ee,{theme:"dark"}),i(Ie,{}),i(Ve,{theme:"dark"}),i(Ce,{theme:"dark"}),i(Se,{initial:{right:"-20%",top:"100%"},animate:{right:"5%",top:"10%",transition:{duration:2,delay:.5}},children:i("img",{src:Me,alt:"Spaceman floating"})}),f(Ae,{initial:{opacity:0},animate:{opacity:1,transition:{duration:1,delay:1}},children:[f(Te,{children:[f(Re,{className:"animate__animated animate__zoomInDown animate__delay-1s",children:[f("p",{className:"hvr-icon-forward",children:[i(ae,{className:"hvr-icon",size:"1.3em"}),i("a",{href:"https://discordapp.com/users/m4rkyu",target:"_blank",rel:"noopener noreferrer",children:"DISCORD: m4rkyu"})]}),f("p",{className:"hvr-icon-forward",children:[i(te,{size:"1.3em"}),i("a",{href:"mailto:zyu347@uwo.ca",children:"EMAIL: zyu347@uwo.ca"})]}),f("p",{className:"hvr-icon-forward",children:[i(ne,{className:"hvr-icon",size:"1.3em"})," CELL: +1 306 581-5556"]}),f("p",{className:"hvr-icon-forward",children:[i(ie,{className:"hvr-icon",size:"1.3em"})," MAIL: 2382 Brairgrove Cir"]}),f("p",{className:"hvr-icon-forward",children:[i(ke,{className:"hvr-icon",size:"1.3em"})," Oakville, ON L6M 5A3"]})]}),i(De,{src:Oe,alt:"Mark Yu"})]}),f("div",{children:[i("h2",{className:"hvr-skew-forward",children:"Overview"}),f("p",{children:["Welcome to my website! I'm ",i("strong",{children:"Mark Yu"}),", an artist and full-stack web developer based in ",i("u",{children:"Ontario, Canada"}),". My passion lies in blending design and engineering to create software that is both visually stunning and highly functional."]}),f("p",{children:["I was born in ",i("strong",{children:"China"})," and immigrated to ",i("u",{children:i("a",{className:"hvr-sweep-to-top",href:"https://en.wikipedia.org/wiki/Saskatchewan",target:"_blank",rel:"noopener noreferrer",children:"Saskatchewan, Canada"})})," in 2013. During high school, a computer science elective sparked my interest in web design and coding. This newfound passion led me to study software engineering at ",i("u",{children:i("a",{className:"hvr-sweep-to-top",href:"https://www.uwo.ca/",target:"_blank",rel:"noopener noreferrer",children:"Western University"})})," and pursue a career in software development."]}),i("h2",{className:"hvr-skew-forward",children:"Professional Skills"}),f("p",{children:["As a full-stack web developer, I thrive on building robust, user-friendly applications. My expertise spans a wide range of front-end and back-end technologies, including ",i("strong",{children:"React"}),", ",i("strong",{children:"MySQL"}),", ",i("strong",{children:"Spring Boot"}),", ",i("strong",{children:"Apache Storm"}),", and ",i("strong",{children:"Node.js"}),". Beyond websites, I also enjoy developing games and working on various creative projects."]}),i("h2",{className:"hvr-skew-forward",children:"Personal Interests"}),i("p",{children:"When I'm not immersed in the digital world, you'll find me exploring new places and capturing the beauty of the world through my paintings. Travel and art are my greatest inspirations, constantly sparking my creativity and driving my passion for innovation."}),i("h2",{className:"hvr-skew-forward",children:"Work Experience"}),i(G.VerticalTimeline,{children:He.map((e,r)=>i(Ye,{experience:e},`experience-${r}`))}),i("br",{}),i("h2",{className:"hvr-skew-forward",children:"Current Focus"}),i("p",{children:"Currently, I'm taking a break from traditional employment to delve into new technologies, travel, and work on personal projects that ignite my creativity. My focus is on crafting intuitive and visually captivating digital experiences that redefine user interaction with technology."}),i("h2",{className:"hvr-skew-forward",children:"Passion and Expertise"}),i("p",{children:"I am passionate about using my skills and creativity to tackle real-world challenges with innovative solutions. My expertise includes managing complex data systems, designing 2D/3D games, developing full-stack web applications, and enhancing user interfaces. If you're interested in collaboration and exchanging ideas, let's connect and explore the potential of technology together. Reach out, and let's create something remarkable!"})]})]}),i(Ne,{text:"ABOUT",top:"10%",left:"5%"})]},"about")})]});export{Ze as default};
