import{Remove as n}from"./index-6424a823.js";import{E as a}from"./ExternalInteractorBase-029fb1b6.js";import{H as m}from"./ParticlesComponent-26f4581c.js";import"./index-ca4d20e1.js";const s="remove";class u extends a{constructor(t){super(t),this.handleClickMode=r=>{const e=this.container,o=e.actualOptions;if(!o.interactivity.modes.remove||r!==s)return;const i=m(o.interactivity.modes.remove.quantity);e.particles.removeQuantity(i)}}clear(){}init(){}interact(){}isEnabled(){return!0}loadModeOptions(t,...r){t.remove||(t.remove=new n);for(const e of r)t.remove.load(e==null?void 0:e.remove)}reset(){}}export{u as Remover};
