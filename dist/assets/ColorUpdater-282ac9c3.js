import{r as a,ab as t,ac as r}from"./ParticlesComponent-26f4581c.js";import"./index-ca4d20e1.js";class m{constructor(n){this.container=n}init(n){const e=a(n.options.color,n.id,n.options.reduceDuplicates);e&&(n.color=t(e,n.options.color.animation,this.container.retina.reduceFactor))}isEnabled(n){const{h:e,s:i,l:s}=n.options.color.animation,{color:o}=n;return!n.destroyed&&!n.spawning&&((o==null?void 0:o.h.value)!==void 0&&e.enable||(o==null?void 0:o.s.value)!==void 0&&i.enable||(o==null?void 0:o.l.value)!==void 0&&s.enable)}update(n,e){r(n.color,e)}}export{m as ColorUpdater};
