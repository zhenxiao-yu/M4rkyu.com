import { Home } from "../assets/svg/AllSvgs";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { mediaQueries } from "../theme/Themes";

const HomeBtn = styled.button`
  position: fixed;
  top: 2rem;
  left: 50%;
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

  ${mediaQueries(40)`
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
`;

//home button
const HomeButton = () => {
  return (
    <HomeBtn>
      <NavLink to="/">
        <Home width={30} height={30} fill="currentColor" />
      </NavLink>
    </HomeBtn>
  );
};

export default HomeButton;
