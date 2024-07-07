import styled from "styled-components";
import { DarkTheme, mediaQueries } from "../theme/Themes";

// Styled component for the logo
const Logo = styled.h1`
  display: inline-block;
  // Set the color based on the theme prop
  color: ${(props) => props.color === "dark" ? DarkTheme.text : DarkTheme.body};
  font-family: "Pacifico", cursive; // Use Pacifico font with cursive style
  position: fixed; // Fix the position on the screen
  left: 2rem; // Set left margin
  top: 2rem; // Set top margin
  z-index: 10; // Ensure the logo is above other elements
  user-select: none; // Prevent text selection
  // Media query for screens smaller than 40em
  ${mediaQueries(40)`
      font-size:1.8em; // Adjust font size
      left:1rem; // Adjust left margin
      top:2rem; // Maintain top margin
  `};
`;

// Functional component for the logo
const LogoComponent = (props) => {
  return <Logo color={props.theme}>MY</Logo>;
};

export default LogoComponent;
