import { Github, Instagram, Facebook, YouTube, Linkedin } from "../pages/AllSvgs";

import styled from "styled-components";
import { motion } from "framer-motion";

import { NavLink } from "react-router-dom";
import { DarkTheme, mediaQueries } from "../pages/Themes";

// define common style for social media icons
const Icons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 2rem;
  z-index: 3;
  & > *:not(:last-child) {
    margin: 0.5rem 0;
    ${mediaQueries(20)`
      margin: 0.3rem 0;
  `};
  }

  ${mediaQueries(40)`
  left: 1rem;
      svg{
        width:20px;
        height:20px
      }

  `};
`;

const Line = styled(motion.span)`
  width: 2px;
  height: 8rem;
  background-color: ${(props) =>
    props.color === "dark" ? DarkTheme.text : DarkTheme.body};
`;
const SocialIcons = (props) => {
  const mq = window.matchMedia("(max-width: 40em)").matches;

  return (
    <Icons>

      {/* github */}
      <motion.div
        initial={{ transform: "scale(0)" }}
        animate={{ scale: [0, 1, 1.5, 1] }}
        transition={{ type: "spring", duration: 1, delay: 1 }}
      >
        <NavLink
          style={{ color: "inherit" }}
          target="_blank"
          to={{ pathname: "https://github.com/zhenxiao-yu" }}
        >
          <Github
            width={25}
            height={25}
            fill={
              props.theme === "dark" ? `${DarkTheme.text}` : `${DarkTheme.body}`
            }
          />
        </NavLink>
      </motion.div>

      {/* linkedin */}
      <motion.div
        initial={{ transform: "scale(0)" }}
        animate={{ scale: [0, 1, 1.5, 1] }}
        transition={{ type: "spring", duration: 1, delay: 1.2 }}
      >
        <NavLink
          style={{ color: "inherit" }}
          target="_blank"
          to={{ pathname: "" }}
        >
          <Linkedin
            width={25}
            height={25}
            fill={
              props.theme === "dark" ? `${DarkTheme.text}` : `${DarkTheme.body}`
            }
          />
        </NavLink>
      </motion.div>

       {/* instagram */}
       <motion.div
        initial={{ transform: "scale(0)" }}
        animate={{ scale: [0, 1, 1.5, 1] }}
        transition={{ type: "spring", duration: 1, delay: 1.2 }}
      >
        <NavLink
          style={{ color: "inherit" }}
          target="_blank"
          to={{ pathname: "https://www.instagram.com/m4rkyu/" }}
        >
          <Instagram
            width={25}
            height={25}
            fill={
              props.theme === "dark" ? `${DarkTheme.text}` : `${DarkTheme.body}`
            }
          />
        </NavLink>
      </motion.div>

      {/* facebook */}
      <motion.div
        initial={{ transform: "scale(0)" }}
        animate={{ scale: [0, 1, 1.5, 1] }}
        transition={{ type: "spring", duration: 1, delay: 1.4 }}
      >
        <NavLink
          style={{ color: "inherit" }}
          target="_blank"
          to={{ pathname: "https://www.facebook.com/mark.yu.3762584" }}
        >
          <Facebook
            width={25}
            height={25}
            fill={
              props.theme === "dark" ? `${DarkTheme.text}` : `${DarkTheme.body}`
            }
          />
        </NavLink>
      </motion.div>
      
      {/* youtube chanel */}
      <motion.div
        initial={{ transform: "scale(0)" }}
        animate={{ scale: [0, 1, 1.5, 1] }}
        transition={{ type: "spring", duration: 1, delay: 1.6 }}
      >
        <NavLink
          style={{ color: "inherit" }}
          target="_blank"
          to={{
            pathname:
              "https://www.youtube.com/channel/UCUY09EUdbMoyDeWrMBYcUZQ",
          }}
        >
          <YouTube
            width={25}
            height={25}
            fill={
              props.theme === "dark" ? `${DarkTheme.text}` : `${DarkTheme.body}`
            }
          />
        </NavLink>
      </motion.div>

      {/* line decoration */}
      <Line
        initial={{ height: 0 }}
        animate={{ height: mq ? "5rem" : "8rem" }}
        color={props.theme}
        transition={{ type: "spring", duration: 1, delay: 0.8 }}
      />
    </Icons>
  );
};

export default SocialIcons;
