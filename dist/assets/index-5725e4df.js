import{_ as e}from"./index-784aae70.js";import{O as s}from"./OptionsColor-0f13378d.js";import"./ParticlesComponent-7a47f6d3.js";class r{constructor(){this.blink=!1,this.consent=!1,this.opacity=1}load(i){i&&(i.blink!==void 0&&(this.blink=i.blink),i.color!==void 0&&(this.color=s.create(this.color,i.color)),i.consent!==void 0&&(this.consent=i.consent),i.opacity!==void 0&&(this.opacity=i.opacity))}}class a{constructor(){this.distance=100,this.links=new r}load(i){i&&(i.distance!==void 0&&(this.distance=i.distance),this.links.load(i.links))}}async function u(n,i=!0){await n.addInteractor("externalGrab",async o=>{const{Grabber:t}=await e(()=>import("./Grabber-a0e39532.js"),["assets/Grabber-a0e39532.js","assets/CanvasUtils-c0d880c6.js","assets/ParticlesComponent-7a47f6d3.js","assets/index-784aae70.js","assets/index-85df3ed2.css","assets/ExternalInteractorBase-029fb1b6.js","assets/OptionsColor-0f13378d.js"]);return new t(o)},i)}export{a as Grab,r as GrabLinks,u as loadExternalGrabInteraction};