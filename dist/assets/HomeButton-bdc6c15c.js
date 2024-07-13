import{s as t,m as e,b as o,N as r}from"./index-d572a681.js";import{H as i}from"./AllSvgs-6435270f.js";const a=t.button`
  position: fixed;
  top: 2rem;
  left: 50.6%;
  transform: translate(-50%, 0);
  scale: 1;
  background-color: var(--body-color-light);
  padding: 0.5rem;
  border-radius: 50%;
  color: var(--text-color-light);
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

  ${e(40)`
   width: 4rem;
   height: 4rem;
   position: fixed;
   top: 88%;
   left: 88%;
      svg{
        width:20px;
        height:20px;
      }

  `};
`,l=()=>o(a,{children:o(r,{to:"/",children:o(i,{width:30,height:30,fill:"currentColor"})})});export{l as default};
