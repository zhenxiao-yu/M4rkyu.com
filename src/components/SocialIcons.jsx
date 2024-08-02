import { Github, Instagram, Facebook, YouTube, Linkedin, Spotify} from "../assets/svg/AllSvgs";
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
  left: 1.5rem;
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
  width: 3px;
  height: calc(2.5rem + 1vw);  // Responsive height
  background-color: ${(props) =>
    props.color === "dark" ? DarkTheme.text : DarkTheme.body};

  ${mediaQueries(50)`
    height: calc(2rem + 0.5vw);  // Adjust height for smaller screens
  `}

  ${mediaQueries(30)`
    height: calc(1.5rem + 0.5vw);  // Further adjustment for even smaller screens
  `}

  ${mediaQueries(20)`
    height: calc(1rem + 0.5vw);  // Further adjustment for the smallest screens
  `}
`;

// Configuration for social media links
const socialLinks = [
  { id: "linkedin", Icon: Linkedin, link: "www.linkedin.com/in/zhenxiao-yu-a586a2211" },
  { id: "github", Icon: Github, link: "https://github.com/zhenxiao-yu" },
  { id: "spotify", Icon: Spotify, link: "https://open.spotify.com/user/317xma3mkahx2sgwksrv72bvlywm?si=d87d26fee3e84210" },
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
        animate={{ height: mq ? "6rem" : "3rem" }}
        color={props.theme}
        transition={{ type: "spring", duration: 1, delay: 0.8 }}
      />
    </Icons>
  );
};

export default SocialIcons;
