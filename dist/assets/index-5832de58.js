import{_ as o}from"./index-784aae70.js";async function i(t,a=!0){await t.addParticleUpdater("outModes",async e=>{const{OutOfCanvasUpdater:r}=await o(()=>import("./OutOfCanvasUpdater-5686355f.js"),["assets/OutOfCanvasUpdater-5686355f.js","assets/ParticlesComponent-7a47f6d3.js","assets/index-784aae70.js","assets/index-85df3ed2.css"]);return new r(e)},a)}export{i as loadOutModesUpdater};