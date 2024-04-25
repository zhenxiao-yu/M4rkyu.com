import styled from "styled-components";
import { lazy, Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";

//background image
import img from "../../assets/Images/blogBG.png";
//blog data
import { Blogs } from "../../assets/data/BlogData";


import BlogComponent from "../../components/BlogComponent";
import Loading from "../../components/Loading";
import { mediaQueries } from "../../theme/Themes";

const AnchorComponent = lazy(() => import("../../components/Anchor"));
const SocialIcons = lazy(() => import("../../components/SocialIcons"));
const HomeButton = lazy(() => import("../../components/HomeButton"));
const LogoComponent = lazy(() => import("../../components/LogoComponent"));
const BigTitle = lazy(() => import("../../components/BigTitle"));

const MainContainer = styled(motion.div)`
  background-image: url(${img});
  background-size: cover;
  background-repeat: repeat;
  background-attachment: fixed;
  background-position: center;
  user-select: none;
`;

// Utility function to convert hex color to RGBA
const hexToRgba = (hex, opacity) => {
  const trimmedHex = hex.replace('#', '');
  const r = parseInt(trimmedHex.substring(0, 2), 16);
  const g = parseInt(trimmedHex.substring(2, 4), 16);
  const b = parseInt(trimmedHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const Container = styled.div`
  background-color: ${props => props.theme.body};
  width: 100%;
  height: auto;
  position: relative;
  padding-bottom: 5rem;
`;

const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 10rem;
  ${mediaQueries(30)`
    padding-top: 7rem;
  `};
`;

const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, minmax(calc(10rem + 15vw), 1fr));
  grid-gap: calc(0.3rem + 2vw);
  ${mediaQueries(50)`
    grid-template-columns: 100%;
  `};
`;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.5,
      duration: 0.5,
    },
  },
};

const BlogPage = () => {
  const [number, setNumber] = useState(0);

  useEffect(() => {
    let num = (window.innerHeight - 70) / 30;
    setNumber(parseInt(num));
  }, []);
  return (
    <Suspense fallback={<Loading />}>
      <MainContainer
        variants={container}
        initial="hidden"
        animate="show"
        exit={{ opacity: 0, transition: { duration: 0.5 } }}
      >
        <Container>
          <LogoComponent />
          <HomeButton />
          <SocialIcons />
          <AnchorComponent number={number} />

          <Center>
            <Grid variants={container} initial="hidden" animate="show">
              {Blogs.map((blog) => (
                <BlogComponent key={blog.id} blog={blog} />
              ))}
            </Grid>
          </Center>

          <BigTitle text="BLOG" top="5rem" left="5rem" />
        </Container>
      </MainContainer>
    </Suspense>
  );
};

export default BlogPage;
