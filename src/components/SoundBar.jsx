import { useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { mediaQueries } from "../theme/Themes";

// music file
import music from "../assets/audio/u-said-it-v13-1167.mp3";

const Box = styled.div`
  display: flex;
  cursor: pointer;
  position: fixed;
  left: 8rem;
  top: 2.6rem;
  z-index: 10;

  & > *:nth-child(1) {
    animation-delay: 0.2s;
  }
  & > *:nth-child(2) {
    animation-delay: 0.3s;
  }
  & > *:nth-child(3) {
    animation-delay: 0.4s;
  }
  & > *:nth-child(4) {
    animation-delay: 0.5s;
  }
  & > *:nth-child(5) {
    animation-delay: 0.6s;
  }
  & > *:nth-child(6) {
    animation-delay: 0.7s;
  }
  & > *:nth-child(7) {
    animation-delay: 0.8s;
  }
  & > *:nth-child(8) {
    animation-delay: 0.9s;
  }
  & > *:nth-child(9) {
    animation-delay: 1s;
  }

  ${mediaQueries(40)`
      left:1rem;
      top:5rem;
      scale:0.9;
  `};
`;

const play = keyframes`
0%{
    transform:scaleY(1);
}
50%{
    transform:scaleY(2);
}
100%{
    transform:scaleY(1);
}
`;
const Line = styled.span`
  background: ${(props) => props.theme.text};
  border: 1px solid ${(props) => props.theme.body};
  animation: ${play} 1s ease infinite;
  animation-play-state: ${(props) => (props.click ? "running" : "paused")};
  height: 1rem;
  width: 3px;
  margin: 0 0.15rem;

  ${mediaQueries(40)`
      height:0.5rem;
      width: 2px;
      margin: 0 0.1rem;
  `};
`;

// sound bar functional component
const SoundBar = () => {
  // click state initially set to false
  const [click, setClick] = useState(false);
  //toggle between play & pause when clicked
  const handleClick = () => {
    setClick(!click);
    if (!click) {
      ref.current.play();
    } else {
      ref.current.pause();
    }
  };

  const ref = useRef(null);

  return (
     <Box onClick={() => handleClick()}>
        {Array.from({ length: 9 }).map((_, index) => (
            <Line key={index} click={click} />
        ))}
        <audio src={music} ref={ref} loop />
    </Box>
  );
};

export default SoundBar;
