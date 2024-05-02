import { useRef, useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { mediaQueries } from "../theme/Themes";
import { GiPerspectiveDiceSixFacesRandom  } from "react-icons/gi";

// music file
import song1 from "../assets/audio/Pinegrove - Angelina.mp3";
import song2 from "../assets/audio/There Is a Light That Never Goes Out (2011 Remaster).mp3";
import song3 from "../assets/audio/Out of Tune.mp3";
import song4 from "../assets/audio/Rick Astley - Never Gonna Give You Up (Official Music Video).mp3";

const Box = styled.div`
  display: flex;
  cursor: pointer;
  position: fixed;
  left: 8rem;
  top: 2.6rem;
  z-index: 10;

  & > *:nth-child(1) { animation-delay: 0.2s; }
  & > *:nth-child(2) { animation-delay: 0.3s; }
  & > *:nth-child(3) { animation-delay: 0.4s; }
  & > *:nth-child(4) { animation-delay: 0.5s; }
  & > *:nth-child(5) { animation-delay: 0.6s; }
  & > *:nth-child(6) { animation-delay: 0.7s; }
  & > *:nth-child(7) { animation-delay: 0.8s; }
  & > *:nth-child(8) { animation-delay: 0.9s; }
  & > *:nth-child(9) { animation-delay: 1s; }

  ${mediaQueries(40)`
      left:1rem;
      top:5rem;
      scale:0.9;
  `};
`;

const play = keyframes`
  0% { transform: scaleY(1); }
  50% { transform: scaleY(2); }
  100% { transform: scaleY(1); }
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

const NextButton = styled.button`
  position: fixed;
  left: 14.5rem;
  top: 2.1rem;
  cursor: pointer;
  background: ${(props) => props.theme.body};
  color: ${(props) => props.theme.text};
  border: 4px solid ${(props) => props.theme.text};
  padding: 5px 6px 4px 6px;
  scale: 1.2;
  border-radius: 50%;
  &:hover {
    scale: 1.4;
    transition: all 0.3s ease-in-out;
  }

  ${mediaQueries(40)`
      left: 0.7rem;
      top: 1.8rem;
      scale: 1.1;
  `};
`;

const SoundBar = () => {
  const [click, setClick] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const songs = [song1, song2, song3, song4];
  const ref = useRef(null);

  // useEffect(() => {
  //   playSong(currentSongIndex);
  // }, [currentSongIndex]);

  const playSong = (index) => {
    ref.current.src = songs[index];
    ref.current.play().then(() => {
      setClick(true);
    }).catch(error => {
      console.error("Playback failed:", error);
      setClick(false);
    });
  };

  const handleClick = () => {
    if (!click) {
      ref.current.play();
      setClick(true);
    } else {
      ref.current.pause();
      setClick(false);
    }
  };

  const handleNext = () => {
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIndex);
  };

  return (
    <div>
      <Box onClick={handleClick}>
        {Array.from({ length: 9 }).map((_, index) => (
          <Line key={index} click={click} />
        ))}
        <audio ref={ref} loop />
        <NextButton onClick={handleNext}>
          <GiPerspectiveDiceSixFacesRandom /> 
        </NextButton>
      </Box>
    </div>
  );
};

export default SoundBar;