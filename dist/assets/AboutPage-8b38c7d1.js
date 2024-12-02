import{r as h,p as U,g as K,_ as O,s as p,W as X,m as v,j as f,b as G,D as Z,a as r,L as ee}from"./index-81b8ab02.js";import{a as te,b as re,c as ne,M as ie}from"./index.esm-b1fdad2f.js";import{F as ae}from"./index.esm-0d47a9f5.js";import{B as oe}from"./index.esm-ba92961d.js";import{H as se}from"./Helmet-f54e6b7c.js";import{m as R}from"./motion-33849963.js";import"./iconBase-f2c7985c.js";var C={},F={exports:{}};/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/(function(e){(function(){var i={}.hasOwnProperty;function a(){for(var n="",l=0;l<arguments.length;l++){var s=arguments[l];s&&(n=t(n,o(s)))}return n}function o(n){if(typeof n=="string"||typeof n=="number")return n;if(typeof n!="object")return"";if(Array.isArray(n))return a.apply(null,n);if(n.toString!==Object.prototype.toString&&!n.toString.toString().includes("[native code]"))return n.toString();var l="";for(var s in n)i.call(n,s)&&n[s]&&(l=t(l,s));return l}function t(n,l){return l?n?n+" "+l:n+l:n}e.exports?(a.default=a,e.exports=a):window.classNames=a})()})(F);var Y=F.exports;C.__esModule=!0;C.default=void 0;var le=L(h),b=L(U),ce=L(Y);function L(e){return e&&e.__esModule?e:{default:e}}const q=({animate:e=!0,className:i="",layout:a="2-columns",lineColor:o="#FFF",children:t})=>(typeof window=="object"&&document.documentElement.style.setProperty("--line-color",o),le.default.createElement("div",{className:(0,ce.default)(i,"vertical-timeline",{"vertical-timeline--animate":e,"vertical-timeline--two-columns":a==="2-columns","vertical-timeline--one-column-left":a==="1-column"||a==="1-column-left","vertical-timeline--one-column-right":a==="1-column-right"})},t));q.propTypes={children:b.default.oneOfType([b.default.arrayOf(b.default.node),b.default.node]).isRequired,className:b.default.string,animate:b.default.bool,layout:b.default.oneOf(["1-column-left","1-column","2-columns","1-column-right"]),lineColor:b.default.string};var de=q;C.default=de;var N={};function z(){return z=Object.assign||function(e){for(var i=1;i<arguments.length;i++){var a=arguments[i];for(var o in a)Object.prototype.hasOwnProperty.call(a,o)&&(e[o]=a[o])}return e},z.apply(this,arguments)}function ue(e,i){e.prototype=Object.create(i.prototype),e.prototype.constructor=e,A(e,i)}function A(e,i){return A=Object.setPrototypeOf||function(o,t){return o.__proto__=t,o},A(e,i)}function fe(e,i){if(e==null)return{};var a={},o=Object.keys(e),t,n;for(n=0;n<o.length;n++)t=o[n],!(i.indexOf(t)>=0)&&(a[t]=e[t]);return a}var T=new Map,V=new WeakMap,B=0,H=void 0;function he(e){H=e}function me(e){return e?(V.has(e)||(B+=1,V.set(e,B.toString())),V.get(e)):"0"}function pe(e){return Object.keys(e).sort().filter(function(i){return e[i]!==void 0}).map(function(i){return i+"_"+(i==="root"?me(e.root):e[i])}).toString()}function ge(e){var i=pe(e),a=T.get(i);if(!a){var o=new Map,t,n=new IntersectionObserver(function(l){l.forEach(function(s){var d,u=s.isIntersecting&&t.some(function(m){return s.intersectionRatio>=m});e.trackVisibility&&typeof s.isVisible>"u"&&(s.isVisible=u),(d=o.get(s.target))==null||d.forEach(function(m){m(u,s)})})},e);t=n.thresholds||(Array.isArray(e.threshold)?e.threshold:[e.threshold||0]),a={id:i,observer:n,elements:o},T.set(i,a)}return a}function j(e,i,a,o){if(a===void 0&&(a={}),o===void 0&&(o=H),typeof window.IntersectionObserver>"u"&&o!==void 0){var t=e.getBoundingClientRect();return i(o,{isIntersecting:o,target:e,intersectionRatio:typeof a.threshold=="number"?a.threshold:0,time:0,boundingClientRect:t,intersectionRect:t,rootBounds:t}),function(){}}var n=ge(a),l=n.id,s=n.observer,d=n.elements,u=d.get(e)||[];return d.has(e)||d.set(e,u),u.push(i),s.observe(e),function(){u.splice(u.indexOf(i),1),u.length===0&&(d.delete(e),s.unobserve(e)),d.size===0&&(s.disconnect(),T.delete(l))}}var ve=["children","as","triggerOnce","threshold","root","rootMargin","onChange","skip","trackVisibility","delay","initialInView","fallbackInView"];function W(e){return typeof e.children!="function"}var E=function(e){ue(i,e);function i(o){var t;return t=e.call(this,o)||this,t.node=null,t._unobserveCb=null,t.handleNode=function(n){t.node&&(t.unobserve(),!n&&!t.props.triggerOnce&&!t.props.skip&&t.setState({inView:!!t.props.initialInView,entry:void 0})),t.node=n||null,t.observeNode()},t.handleChange=function(n,l){n&&t.props.triggerOnce&&t.unobserve(),W(t.props)||t.setState({inView:n,entry:l}),t.props.onChange&&t.props.onChange(n,l)},t.state={inView:!!o.initialInView,entry:void 0},t}var a=i.prototype;return a.componentDidUpdate=function(t){(t.rootMargin!==this.props.rootMargin||t.root!==this.props.root||t.threshold!==this.props.threshold||t.skip!==this.props.skip||t.trackVisibility!==this.props.trackVisibility||t.delay!==this.props.delay)&&(this.unobserve(),this.observeNode())},a.componentWillUnmount=function(){this.unobserve(),this.node=null},a.observeNode=function(){if(!(!this.node||this.props.skip)){var t=this.props,n=t.threshold,l=t.root,s=t.rootMargin,d=t.trackVisibility,u=t.delay,m=t.fallbackInView;this._unobserveCb=j(this.node,this.handleChange,{threshold:n,root:l,rootMargin:s,trackVisibility:d,delay:u},m)}},a.unobserve=function(){this._unobserveCb&&(this._unobserveCb(),this._unobserveCb=null)},a.render=function(){if(!W(this.props)){var t=this.state,n=t.inView,l=t.entry;return this.props.children({inView:n,entry:l,ref:this.handleNode})}var s=this.props,d=s.children,u=s.as,m=fe(s,ve);return h.createElement(u||"div",z({ref:this.handleNode},m),d)},i}(h.Component);E.displayName="InView";E.defaultProps={threshold:0,triggerOnce:!1,initialInView:!1};function ye(e){var i=e===void 0?{}:e,a=i.threshold,o=i.delay,t=i.trackVisibility,n=i.rootMargin,l=i.root,s=i.triggerOnce,d=i.skip,u=i.initialInView,m=i.fallbackInView,y=h.useRef(),x=h.useState({inView:!!u}),k=x[0],I=x[1],$=h.useCallback(function(_){y.current!==void 0&&(y.current(),y.current=void 0),!d&&_&&(y.current=j(_,function(S,P){I({inView:S,entry:P}),P.isIntersecting&&s&&y.current&&(y.current(),y.current=void 0)},{root:l,rootMargin:n,threshold:a,trackVisibility:t,delay:o},m))},[Array.isArray(a)?a.toString():a,l,n,s,d,t,m,o]);h.useEffect(function(){!y.current&&k.entry&&!s&&!d&&I({inView:!!u})});var g=[$,k.inView,k.entry];return g.ref=g[0],g.inView=g[1],g.entry=g[2],g}const be=Object.freeze(Object.defineProperty({__proto__:null,InView:E,default:E,defaultFallbackInView:he,observe:j,useInView:ye},Symbol.toStringTag,{value:"Module"})),we=K(be);N.__esModule=!0;N.default=void 0;var w=D(h),c=D(U),M=D(Y),_e=we;function D(e){return e&&e.__esModule?e:{default:e}}const Q=({children:e="",className:i="",contentArrowStyle:a=null,contentStyle:o=null,date:t="",dateClassName:n="",icon:l=null,iconClassName:s="",iconOnClick:d=null,onTimelineElementClick:u=null,iconStyle:m=null,id:y="",position:x="",style:k=null,textClassName:I="",intersectionObserverProps:$={rootMargin:"0px 0px -40px 0px",triggerOnce:!0},visible:g=!1})=>w.default.createElement(_e.InView,$,({inView:_,ref:S})=>w.default.createElement("div",{ref:S,id:y,className:(0,M.default)(i,"vertical-timeline-element",{"vertical-timeline-element--left":x==="left","vertical-timeline-element--right":x==="right","vertical-timeline-element--no-children":e===""}),style:k},w.default.createElement(w.default.Fragment,null,w.default.createElement("span",{style:m,onClick:d,className:(0,M.default)(s,"vertical-timeline-element-icon",{"bounce-in":_||g,"is-hidden":!(_||g)})},l),w.default.createElement("div",{style:o,onClick:u,className:(0,M.default)(I,"vertical-timeline-element-content",{"bounce-in":_||g,"is-hidden":!(_||g)})},w.default.createElement("div",{style:a,className:"vertical-timeline-element-content-arrow"}),e,w.default.createElement("span",{className:(0,M.default)(n,"vertical-timeline-element-date")},t)))));Q.propTypes={children:c.default.oneOfType([c.default.arrayOf(c.default.node),c.default.node]),className:c.default.string,contentArrowStyle:c.default.shape({}),contentStyle:c.default.shape({}),date:c.default.node,dateClassName:c.default.string,icon:c.default.element,iconClassName:c.default.string,iconStyle:c.default.shape({}),iconOnClick:c.default.func,onTimelineElementClick:c.default.func,id:c.default.string,position:c.default.string,style:c.default.shape({}),textClassName:c.default.string,visible:c.default.bool,intersectionObserverProps:c.default.shape({root:c.default.object,rootMargin:c.default.string,threshold:c.default.number,triggerOnce:c.default.bool})};var xe=Q;N.default=xe;var J={VerticalTimeline:C.default,VerticalTimelineElement:N.default};const ke="/assets/pfp2-262b49f7.png",Oe="/assets/spaceman-b47252a8.png",Ie=h.lazy(()=>O(()=>import("./SocialIcons-c0666d73.js"),["assets/SocialIcons-c0666d73.js","assets/index-81b8ab02.js","assets/index-139dcfa0.css","assets/AllSvgs-0f0c20e8.js","assets/motion-33849963.js"])),Ve=h.lazy(()=>O(()=>import("./HomeButton-908b3511.js"),["assets/HomeButton-908b3511.js","assets/index-81b8ab02.js","assets/index-139dcfa0.css","assets/AllSvgs-0f0c20e8.js"])),Me=h.lazy(()=>O(()=>import("./LogoComponent-6e5fe017.js"),["assets/LogoComponent-6e5fe017.js","assets/index-81b8ab02.js","assets/index-139dcfa0.css"])),Ee=h.lazy(()=>O(()=>import("./ParticlesComponent-42714cc0.js").then(e=>e.af),["assets/ParticlesComponent-42714cc0.js","assets/index-81b8ab02.js","assets/index-139dcfa0.css"])),Ce=h.lazy(()=>O(()=>import("./BigTitle-4207a5c4.js"),["assets/BigTitle-4207a5c4.js","assets/index-81b8ab02.js","assets/index-139dcfa0.css"])),Ne=p(R.div)`
  background-color: ${e=>e.theme.body};
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
`,$e=X`
  0% { transform: translateY(-10px); }
  50% { transform: translateY(15px) translateX(15px); }
  100% { transform: translateY(-10px); }
`,Se=p(R.div)`
  position: absolute;
  top: 10%;
  right: 5%;
  animation: ${$e} 4s ease infinite;
  width: 20vw;
  img {
    width: 100%;
    height: auto;
  }
`,ze=p(R.div)`
  border: 2px solid ${e=>e.theme.text};
  color: ${e=>e.theme.text};
  padding: 5rem;
  border-radius: 0.5rem;
  width: 65vw;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
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
    width: 66vw;
    max-height: 70vh;
    font-size: calc(0.80rem + 0.4vw);
  `};

  ${v(30)`
    width: 60vw;
    max-height: 75vh;
    font-size: calc(0.75rem + 0vw);
    padding: 1rem;
  `};

  ${v(20)`
    padding: 1rem;
    font-size: calc(0.7rem + 0.8vw);
  `};
`,Ae=p.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 2rem;

  ${v(40)`
    flex-direction: column;
    align-items: center;
  `};
`,Te=p.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;

  & p {
    display: flex;
    align-items: center;
    margin: 0.2rem 0;
    font-size: 0.65rem;
  }

  a{
    text-decoration: none;
  }

  & svg {
    margin-right: 0.5rem;
  }
`,Re=p.img`
  width: 17vw;
  height: auto;
  margin-left: 2rem;
  border-radius: 50%;
  filter: grayscale(100%);
  border: 10px solid ${e=>e.theme.text};

  ${v(40)`
    width: 40vw;
    margin-left: 0;
    margin-top: 1rem;
  `};
`,Le=p.div`
  background: ${e=>e.theme.text};
  color: ${e=>e.theme.body};
`,je=p.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`,De=p.h3`
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
`,Pe=p.h3`
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
`,Be=p.p`
  color: ${e=>e.theme.body};
  font-size: 1.5rem;
  font-weight: semi-bold;
  margin: 0;
`,We=p.ul`
  margin-top: 1rem;
  list-style-type: disc;
  margin-left: 1.25rem;

  ${v(30)`
    margin-left: 1rem;
    margin-top: 0.5rem;
  `};
`,Ue=p.li`
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
`,Fe=({experience:e})=>r(J.VerticalTimelineElement,{contentStyle:{background:"rgb(236, 233, 232)",color:"rgb(8, 9, 10)"},contentArrowStyle:{borderRight:"15px solid rgb(236, 233, 232)"},date:"",iconStyle:{background:e.iconBg},icon:r(ie,{size:24}),children:f(Le,{children:[f(je,{children:[r(De,{children:e.title}),r(Pe,{children:e.date}),r(Be,{children:e.company_name})]}),r(We,{children:e.points.map((i,a)=>r(Ue,{children:i},`experience-point-${a}`))})]})}),Ye=[{title:"Software Developer Intern",company_name:"J.D. Power",iconBg:"rgb(8, 9, 10)",date:"May 2022 - Aug 2023",points:["Designed and developed full-stack systems, specializing in backend data processing using Java, MySQL, Spring Boot, Apache Storm, and Apache Camel.","Managed and optimized complex data systems, created robust full-stack web applications, and improved user interfaces for enhanced user experience."]},{title:"Undergrad Research Assistant",company_name:"Western University",iconBg:"rgb(8, 9, 10)",date:"May 2021 - August 2021",points:["Contributed to the development of Augmented Reality environments for neurosurgical simulation applications using Vuforia and Unity3D.","Assisted in preparing a grant proposal to re-implement surgical training systems using Unreal Engine for deployment on Magic Leap headsets.","Developed a software toolkit for creating virtual worlds on the Magic Leap One AR headset, utilizing patient datasets from CT and MRI scans."]}],Ze=()=>f(G,{theme:Z,children:[f(se,{children:[r("title",{children:"About Me - Mark Yu"}),r("meta",{name:"description",content:"Learn more about Mark Yu, a full-stack web developer and artist based in Ontario, Canada."})]}),r(h.Suspense,{fallback:r(ee,{}),children:f(Ne,{initial:{opacity:0},animate:{opacity:1,transition:{duration:.5}},exit:{opacity:0,transition:{duration:.5}},children:[r(Me,{theme:"dark"}),r(Ve,{}),r(Ie,{theme:"dark"}),r(Ee,{theme:"dark"}),r(Se,{initial:{right:"-20%",top:"100%"},animate:{right:"5%",top:"10%",transition:{duration:2,delay:.5}},children:r("img",{src:Oe,alt:"Spaceman floating"})}),f(ze,{initial:{opacity:0},animate:{opacity:1,transition:{duration:1,delay:1}},children:[f(Ae,{children:[f(Te,{className:"animate__animated animate__zoomInDown animate__delay-1s",children:[f("p",{className:"hvr-icon-forward",children:[r(ae,{className:"hvr-icon",size:"1.3em"}),r("a",{href:"https://discordapp.com/users/m4rkyu",target:"_blank",rel:"noopener noreferrer",children:"DISCORD: m4rkyu"})]}),f("p",{className:"hvr-icon-forward",children:[r(te,{size:"1.3em"}),r("a",{href:"mailto:zyu347@uwo.ca",children:"EMAIL: zyu347@uwo.ca"})]}),f("p",{className:"hvr-icon-forward",children:[r(re,{className:"hvr-icon",size:"1.3em"})," CELL: +1 306 581-5556"]}),f("p",{className:"hvr-icon-forward",children:[r(ne,{className:"hvr-icon",size:"1.3em"})," MAIL: 2382 Brairgrove Cir"]}),f("p",{className:"hvr-icon-forward",children:[r(oe,{className:"hvr-icon",size:"1.3em"})," Oakville, ON L6M 5A3"]})]}),r(Re,{src:ke,alt:"Mark Yu"})]}),f("div",{children:[r("h2",{className:"hvr-skew-forward",children:"Overview"}),f("p",{children:["Welcome to my website! I'm ",r("strong",{children:"Mark Yu"}),", an artist and full-stack web developer based in ",r("u",{children:"Ontario, Canada"}),". I am passionate about combining design and engineering to create software that is both visually captivating and functional, focusing on delivering engaging user experiences."]}),f("p",{children:["Born in ",r("strong",{children:"ChangChun, China"})," in 2001, I moved to ",r("u",{children:r("a",{className:"hvr-sweep-to-top",href:"https://en.wikipedia.org/wiki/Saskatchewan",target:"_blank",rel:"noopener noreferrer",children:"Saskatchewan, Canada"})})," in 2013. During high school, a computer science elective sparked my interest in coding, which led me to study software engineering at ",r("u",{children:r("a",{className:"hvr-sweep-to-top",href:"https://www.uwo.ca/",target:"_blank",rel:"noopener noreferrer",children:"Western University"})}),". This journey laid a strong foundation for my career in software development."]}),r("p",{children:"On this site, you'll find a blend of my artwork, software projects, and blog posts that explore my creative process at the intersection of art and technology."}),r("h2",{className:"hvr-skew-forward",children:"Professional Skills"}),f("p",{children:["As a full-stack developer, I build robust, user-friendly applications that solve real-world problems. My expertise spans technologies like ",r("strong",{children:r("a",{href:"https://reactjs.org/",target:"_blank",rel:"noopener noreferrer",children:"React"})}),", ",r("strong",{children:r("a",{href:"https://www.mysql.com/",target:"_blank",rel:"noopener noreferrer",children:"MySQL"})}),", ",r("strong",{children:r("a",{href:"https://spring.io/projects/spring-boot",target:"_blank",rel:"noopener noreferrer",children:"Spring Boot"})}),", ",r("strong",{children:r("a",{href:"https://storm.apache.org/",target:"_blank",rel:"noopener noreferrer",children:"Apache Storm"})}),", and ",r("strong",{children:r("a",{href:"https://nodejs.org/",target:"_blank",rel:"noopener noreferrer",children:"Node.js"})}),". I have experience creating interactive user interfaces, managing complex data systems, and integrating APIs to deliver seamless experiences. Beyond web development, I enjoy creating games and pursuing creative projects that blend art with technology."]}),r("h2",{className:"hvr-skew-forward",children:"Work Experience"}),r(J.VerticalTimeline,{children:Ye.map((e,i)=>r(Fe,{experience:e},`experience-${i}`))}),r("br",{}),r("h2",{className:"hvr-skew-forward",children:"Personal Interests"}),r("p",{children:"Outside of coding, I love traveling and capturing the beauty around me through painting. Travel and art are major sources of inspiration that fuel my creativity and influence my work. Whether hiking through landscapes or experimenting with different mediums, these experiences enhance my perspective as both a developer and an artist."}),r("h2",{className:"hvr-skew-forward",children:"Current Focus"}),r("p",{children:"I am currently taking a break from traditional work to explore emerging technologies, travel, and work on projects that spark my creativity. This period allows me to experiment and push boundaries. If you're interested in collaborating, I'd love to connect—let's create something extraordinary together!"})]})]}),r(Ce,{text:"ABOUT",top:"10%",left:"5%"})]},"about")})]});export{Ze as default};
