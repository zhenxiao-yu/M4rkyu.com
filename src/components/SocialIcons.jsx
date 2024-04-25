import { Github, Instagram, Facebook, YouTube, Linkedin } from "../assets/svg/AllSvgs";
import styled from "styled-components";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { DarkTheme, mediaQueries } from "../theme/Themes";

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
    svg {
      width: 20px;
      height: 20px;
    }
  `};
`;

const Line = styled(motion.span)`
  width: 2px;
  height: 8rem;
  background-color: ${(props) =>
    props.color === "dark" ? DarkTheme.text : DarkTheme.body};
`;

// Configuration for social media links
const socialLinks = [
  { id: "github", Icon: Github, link: "https://github.com/zhenxiao-yu" },
  { id: "linkedin", Icon: Linkedin, link: "https://www.linkedin.com/in/your-profile" },
  { id: "instagram", Icon: Instagram, link: "https://www.instagram.com/m4rkyu/" },
  { id: "facebook", Icon: Facebook, link: "https://www.facebook.com/mark.yu.3762584" },
  { id: "youtube", Icon: YouTube, link: "https://www.youtube.com/channel/UCUY09EUdbMoyDeWrMBYcUZQ" }
];

const SocialIcons = (props) => {
  const mq = window.matchMedia("(max-width: 40em)").matches;

  return (
    <Icons>
      {socialLinks.map(({ id, Icon, link }, index) => (
        <motion.div
          key={id}
          initial={{ transform: "scale(0)" }}
          animate={{ scale: [0, 1, 1.5, 1] }}
          transition={{ type: "spring", duration: 1, delay: 1 + index * 0.2 }}
        >
          <NavLink
            style={{ color: "inherit" }}
            target="_blank"
            to={{ pathname: link }}
          >
            <Icon
              width={25}
              height={25}
              fill={
                props.theme === "dark" ? `${DarkTheme.text}` : `${DarkTheme.body}`
              }
            />
          </NavLink>
        </motion.div>
      ))}
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
