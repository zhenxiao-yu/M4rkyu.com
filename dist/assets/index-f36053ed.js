import{_ as n}from"./index-784aae70.js";async function e(a,o=!0){const{PolygonDrawer:t}=await n(()=>import("./PolygonDrawer-8965ee9d.js"),["assets/PolygonDrawer-8965ee9d.js","assets/PolygonDrawerBase-cb810a7d.js","assets/ParticlesComponent-7a47f6d3.js","assets/index-784aae70.js","assets/index-85df3ed2.css"]);await a.addShape("polygon",new t,o)}async function i(a,o=!0){const{TriangleDrawer:t}=await n(()=>import("./TriangleDrawer-665c213a.js"),["assets/TriangleDrawer-665c213a.js","assets/PolygonDrawerBase-cb810a7d.js","assets/ParticlesComponent-7a47f6d3.js","assets/index-784aae70.js","assets/index-85df3ed2.css"]);await a.addShape("triangle",new t,o)}async function _(a,o=!0){await e(a,o),await i(a,o)}export{e as loadGenericPolygonShape,_ as loadPolygonShape,i as loadTriangleShape};
