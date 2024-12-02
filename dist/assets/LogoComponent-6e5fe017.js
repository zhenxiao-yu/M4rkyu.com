import{s as o,D as t,m as i,a as r}from"./index-81b8ab02.js";const s=o.h1`
  display: inline-block;
  // Set the color based on the theme prop
  color: ${e=>e.color==="dark"?t.text:t.body};
  font-family: "Pacifico", cursive; // Use Pacifico font with cursive style
  position: fixed; // Fix the position on the screen
  left: 2rem; // Set left margin
  top: 2rem; // Set top margin
  z-index: 10; // Ensure the logo is above other elements
  user-select: none; // Prevent text selection
  // Media query for screens smaller than 40em
  ${i(40)`
      font-size:1.8em; // Adjust font size
      left:1rem; // Adjust left margin
      top:2rem; // Maintain top margin
  `};
`,a=e=>r(s,{color:e.theme,children:"MY"});export{a as default};
