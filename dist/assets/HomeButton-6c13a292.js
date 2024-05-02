import{s as t,m as o,c as e,N as r}from"./index-ca4d20e1.js";import{H as i}from"./AllSvgs-7c618cbc.js";const n=t.button`
  position: fixed;
  top: 2rem;
  left: 50%;
  transform: translate(-50%, 0);
  scale: 1;
  background-color: var(--body-color-light);
  padding: 0.5rem;
  border-radius: 50%;
  border: 3px solid black;
  width: 3rem;
  height: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255,224,27,0.7);
    box-shadow: 0 0 7px 6px rgba(255,224,27, 0.3);
    scale: 1.1;
  }

  & > *:first-child {
    text-decoration: none;
    color: inherit;
  }

  ${o(40)`
   width: 3rem;
   height: 3rem;
   position: fixed;
   top: 92%;
   left: 90%;
      svg{
        width:20px;
        height:20px;
      }

  `};
`,d=()=>e(n,{children:e(r,{to:"/",children:e(i,{width:30,height:30,fill:"currentColor"})})});export{d as default};
