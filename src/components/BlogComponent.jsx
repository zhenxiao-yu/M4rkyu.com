import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { mediaQueries } from "../theme/Themes";
import { MdDateRange } from "react-icons/md";

const Box = styled(motion(NavLink))`
  backdrop-filter: blur(5px);
  box-shadow: 0 0 1rem 0 rgba(0, 0, 0, 0.2);
  text-decoration: none;
  border-radius: 1rem;
  width: calc(15rem + 15vw);
  height: 20rem;
  border: 3px groove ${(props) => props.theme.text};
  padding: 1rem;
  color: ${(props) => props.theme.text};
  display: flex;
  flex-direction: column;
  z-index: 4;
  cursor: pointer;

  &:hover {
    color: ${(props) => props.theme.body};
    background-color: ${(props) => props.theme.text};
    transition: all 0.3s ease;
    box-shadow: 0 0.5rem 1rem 0 rgba(8, 9, 10, 0.8);
  }

  ${mediaQueries(50)`
    width: calc(50vw + 6rem);
  `};

  ${mediaQueries(30)`
    height: 20rem;
    width: calc(40vw + 6rem);
    padding: 0.8rem;
  `};

  ${mediaQueries(25)`
    height: 16rem;
    padding: 0.6rem;
    backdrop-filter: none;
  `};
`;

const Image = styled.div`
  background-image: ${(props) => `url(${props.img})`};
  width: 100%;
  height: 80%;
  border-radius: 0.5rem;
  background-size: cover;
  border: 2px solid rgb(8, 9, 10);
  background-position: center center;

  ${mediaQueries(50)`
    height: 40%;
  `};

  ${mediaQueries(25)`
    height: 50%;
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
    white-space: normal;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  `};

  ${mediaQueries(25)`
    font-size: calc(0.6em + 1vw);
    white-space: normal;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
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
  display: flex;
  flex-wrap: wrap;

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
  font-weight: 500;

  ${mediaQueries(25)`
    font-size: calc(0.7em + 1vw);
  `};
`;

const Container = styled(motion.div)``;

const item = {
  hidden: { scale: 0, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: "spring", duration: 0.5 } },
};

const BlogComponent = (props) => {
  const { name, tags, date, imgSrc, link } = props.blog;
  return (
    <Container
      initial="hidden"
      animate="show"
      whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
      variants={item}
    >
      <Box target="_blank" to={{ pathname: `${link}` }}>
        <Image className="animate__animated animate__bounceIn animate__delay-1s" img={imgSrc} />
        <Title>{name}</Title>
        <HashTags>
          {tags.map((t, id) => (
            <Tag key={id}>#{t}</Tag>
          ))}
        </HashTags>
        <Date>
          <MdDateRange size="0.95em" /> {date}
        </Date>
      </Box>
    </Container>
  );
};

export default BlogComponent;
