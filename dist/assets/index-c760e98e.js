import{d as t}from"./index-ca4d20e1.js";import{i as u,e as o}from"./ParticlesComponent-26f4581c.js";import{O as c}from"./OptionsColor-041a02e6.js";class n{constructor(){this.distance=200,this.duration=.4,this.mix=!1}load(e){if(e){if(e.distance!==void 0&&(this.distance=e.distance),e.duration!==void 0&&(this.duration=e.duration),e.mix!==void 0&&(this.mix=e.mix),e.opacity!==void 0&&(this.opacity=e.opacity),e.color!==void 0){const s=u(this.color)?void 0:this.color;this.color=o(e.color,i=>c.create(s,i))}e.size!==void 0&&(this.size=e.size)}}}class l extends n{constructor(){super(),this.selectors=[]}load(e){super.load(e),e&&e.selectors!==void 0&&(this.selectors=e.selectors)}}class p extends n{load(e){super.load(e),e&&(this.divs=o(e.divs,s=>{const i=new l;return i.load(s),i}))}}async function b(r,e=!0){await r.addInteractor("externalBubble",async s=>{const{Bubbler:i}=await t(()=>import("./Bubbler-4ee61153.js"),["assets/Bubbler-4ee61153.js","assets/ParticlesComponent-26f4581c.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css","assets/ExternalInteractorBase-029fb1b6.js","assets/Ranges-df6116eb.js","assets/OptionsColor-041a02e6.js"]);return new i(s)},e)}export{p as Bubble,n as BubbleBase,l as BubbleDiv,b as loadExternalBubbleInteraction};
