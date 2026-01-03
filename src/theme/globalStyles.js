import { createGlobalStyle } from "styled-components";

/*
font-family: 'Source Sans Pro', sans-serif;
font-family: 'Ubuntu Mono', monospace;
font-family: "Poppins", sans-serif;
*/

const GlobalStyle = createGlobalStyle`
*,*::before,*::after,h1,h2,h3,h4,h5,h6{
margin:0;
padding:0;


}

h1,h2,h3,h4,h5,h6{
display:inline-block;

}

  body {
    margin: 0;
    padding: 5rem 0 6rem;
    overflow-x:hidden;
    font-family: "Poppins", sans-serif;
    scroll-behavior: smooth;
  }
`;

export default GlobalStyle;
