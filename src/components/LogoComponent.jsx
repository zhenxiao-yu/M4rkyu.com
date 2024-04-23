import styled from "styled-components";
import { DarkTheme, mediaQueries } from "../theme/Themes";

const Logo = styled.h1`
  display: inline-block;
  color: ${(props) => props.color === "dark" ? DarkTheme.text : DarkTheme.body};
  font-family: "Pacifico", cursive;
  position: fixed;
  left: 2rem;
  top: 2rem;
  z-index: 3;
  user-select: none;
  ${mediaQueries(40)`
      font-size:1.8em;
      left:1rem;
      top:2rem;
  `};
`;

const LogoComponent = (props) => {
  return <Logo color={props.theme}>MY</Logo>;
};

export default LogoComponent;
