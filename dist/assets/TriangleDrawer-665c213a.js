import{P as o}from"./PolygonDrawerBase-cb810a7d.js";import"./ParticlesComponent-7a47f6d3.js";import"./index-784aae70.js";const n=1.66,a=3,i=2;class d extends o{getCenter(t,e){return{x:-e,y:e/n}}getSidesCount(){return a}getSidesData(t,e){const r=e*i;return{count:{denominator:2,numerator:3},length:r}}}export{d as TriangleDrawer};