import{d as o}from"./index-ca4d20e1.js";import{s as r}from"./ParticlesComponent-26f4581c.js";class u{constructor(){this.quantity=2}load(t){if(!t)return;const e=t.quantity;e!==void 0&&(this.quantity=r(e))}}async function c(n,t=!0){await n.addInteractor("externalRemove",async e=>{const{Remover:a}=await o(()=>import("./Remover-a54ae23f.js"),["assets/Remover-a54ae23f.js","assets/ExternalInteractorBase-029fb1b6.js","assets/ParticlesComponent-26f4581c.js","assets/index-ca4d20e1.js","assets/index-50bb1a96.css"]);return new a(e)},t)}export{u as Remove,c as loadExternalRemoveInteraction};
