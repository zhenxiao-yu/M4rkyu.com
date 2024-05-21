import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { mediaQueries } from "../theme/Themes";

const Box = styled(motion(NavLink))`
  backdrop-filter: blur(5px);
  box-shadow: 0 0 1rem 0 rgba(0, 0, 0, 0.2);
  text-decoration: none;
  border-radius: 1rem;
  width: calc(15rem + 15vw);
  height: 30rem;
  border: 2px solid ${(props) => props.theme.text};
  padding: 1rem;
  color: ${(props) => props.theme.text};
  display: flex;
  flex-direction: column;
  z-index: 5;
  cursor: pointer;

  &:hover {
    color: ${(props) => props.theme.body};
    background-color: ${(props) => props.theme.text};
    transition: all 0.3s ease;
  }

  ${mediaQueries(50)`
    width: calc(60vw);
  `};

  ${mediaQueries(30)`
    height: 18rem;
  `};

  ${mediaQueries(25)`
    height: 14rem;
    padding: 0.8rem;
    backdrop-filter: none;
  `};
`;

const Image = styled.div`
  background-image: ${(props) => `url(${props.img})`};
  width: 100%;
  height: 60%;
  border-radius: 0.5rem;
  background-size: cover;
  border: 1px solid transparent;
  background-position: center center;
  ${mediaQueries(25)`
    height: 70%;
  `};

  ${Box}:hover & {
    border: 1px solid ${(props) => props.theme.body};
  }
`;

const Title = styled.h3`
  color: inherit;
  padding: 0.5rem 0;
  padding-top: 1rem;
  font-family: "Poppins", sans-serif;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: calc(0.9em + 0.1vw);

  ${mediaQueries(40)`
    font-size: calc(0.8em + 1vw);
  `};

  ${mediaQueries(25)`
    font-size: calc(0.6em + 1vw);
  `};

  border-bottom: 2px solid ${(props) => props.theme.text};

  ${Box}:hover & {
    border-bottom: 2px solid ${(props) => props.theme.body};
  }
`;

const HashTags = styled.div`
  padding: 0.5rem 0;
  
  max-height: 3rem;
  overflow: hidden;
  text-overflow: ellipsis;
  ${mediaQueries(25)`
    font-size: calc(0.5em + 1vw);
  `};
`;

const Tag = styled.span`
  padding-right: 0.4rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: karla, sans-serif;
  font-weight: 700;
  
  ${mediaQueries(40)`
    font-size: calc(0.7em + 1vw);
  `};

  ${mediaQueries(25)`
    font-size: calc(0.5em + 1vw);
  `};
`;

const Date = styled.span`
  padding: 0.5rem 0;
  ${mediaQueries(25)`
    font-size: calc(0.5em + 1vw);
  `};
`;

const Container = styled(motion.div)``;
const item = {
  hidden: { scale: 0 },
  show: { scale: 1, transition: { type: "spring", duration: 0.5 } },
};

const BlogComponent = (props) => {
  const { name, tags, date, imgSrc, link } = props.blog;
  return (
    <Container variants={item}>
      <Box target="_blank" to={{ pathname: `${link}` }}>
        <Image className="animate__animated animate__backInUp animate__delay-1s" img={imgSrc} />
        <Title>{name}</Title>
        <HashTags>
          {tags.map((t, id) => (
            <Tag key={id}>#{t}</Tag>
          ))}
        </HashTags>
        <Date>{date}</Date>
      </Box>
    </Container>
  );
};

export default BlogComponent;
