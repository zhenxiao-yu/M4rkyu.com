import{_ as i}from"./index-81b8ab02.js";async function d(t,a=!0){await t.addParticleUpdater("life",async e=>{const{LifeUpdater:r}=await i(()=>import("./LifeUpdater-e0c3344b.js"),["assets/LifeUpdater-e0c3344b.js","assets/ValueWithRandom-ef875296.js","assets/ParticlesComponent-42714cc0.js","assets/index-81b8ab02.js","assets/index-139dcfa0.css"]);return new r(e)},a)}export{d as loadLifeUpdater};