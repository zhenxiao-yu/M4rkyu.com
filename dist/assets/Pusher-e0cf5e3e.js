import{Push as a}from"./index-1f7242ed.js";import{H as p,a8 as c}from"./ParticlesComponent-26f4581c.js";import{E as d}from"./ExternalInteractorBase-029fb1b6.js";import"./index-ca4d20e1.js";const h="push",l=0;class v extends d{constructor(e){super(e),this.handleClickMode=r=>{if(r!==h)return;const t=this.container,o=t.actualOptions,n=o.interactivity.modes.push;if(!n)return;const s=p(n.quantity);if(s<=l)return;const i=c([void 0,...n.groups]),u=i!==void 0?t.actualOptions.particles.groups[i]:void 0;t.particles.push(s,t.interactivity.mouse,u,i)}}clear(){}init(){}interact(){}isEnabled(){return!0}loadModeOptions(e,...r){e.push||(e.push=new a);for(const t of r)e.push.load(t==null?void 0:t.push)}reset(){}}export{v as Pusher};