import styled from "styled-components";
import { lazy, Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";

// Blog data
import { Blogs } from "../../assets/data/BlogData";

// Components
import BlogComponent from "../../components/BlogComponent";
import Loading from "../../components/Loading";
import { mediaQueries } from "../../theme/Themes";

// Lazy-loaded components
const AnchorComponent = lazy(() => import("../../components/Anchor"));
const SocialIcons = lazy(() => import("../../components/SocialIcons"));
const HomeButton = lazy(() => import("../../components/HomeButton"));
const LogoComponent = lazy(() => import("../../components/LogoComponent"));
const BigTitle = lazy(() => import("../../components/BigTitle"));

const MainContainer = styled(motion.main)`
  background-attachment: fixed;
  background-position: center;
  user-select: none;
  overflow: hidden;
`;

const Container = styled.section`
  background-color: #ece9e8;
  opacity: 1;
  background-image: radial-gradient(#08090a 1.1px, rgb(236, 233, 232) 1.1px);
  background-size: 22px 22px;
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
  grid-template-columns: repeat(3, minmax(calc(10rem + 15vw), 1fr));
  grid-gap: calc(0.3rem + 2vw);

  ${mediaQueries(30)`
    grid-template-columns: repeat(1, 1fr);
  `};

  ${mediaQueries(50)`
    grid-template-columns: repeat(1, 1fr);
  `};

  ${mediaQueries(60)`
    grid-template-columns: repeat(1, 1fr);
  `};
`;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      duration: 0.5,
    },
  },
};

const BlogPage = () => {
  const [number, setNumber] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      let num = (window.innerHeight - 70) / 30;
      setNumber(parseInt(num));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sorting Blogs by date
  const sortedBlogs = Blogs.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      <Helmet>
        <title>Blog Page</title>
        <meta name="description" content="A collection of blogs sorted by date." />
        <meta name="keywords" content="blog, articles, tech, development" />
        <link rel="canonical" href="http://yourwebsite.com/blog" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "http://yourwebsite.com/blog"
            },
            "headline": "Blog Page",
            "description": "A collection of blogs sorted by date.",
            "author": {
              "@type": "Person",
              "name": "Your Name"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Your Website",
              "logo": {
                "@type": "ImageObject",
                "url": "http://yourwebsite.com/logo.jpg"
              }
            },
            "datePublished": "2024-07-10",
            "image": "http://yourwebsite.com/featured-image.jpg"
          })}
        </script>
      </Helmet>
      <Suspense fallback={<Loading />}>
        <MainContainer
          variants={containerVariants}
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
              <Grid variants={containerVariants} initial="hidden" animate="show">
                {sortedBlogs.map((blog) => (
                  <motion.div
                    key={blog.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <BlogComponent blog={blog} />
                  </motion.div>
                ))}
              </Grid>
            </Center>
            <BigTitle text="Posts" top="5rem" left="5rem" />
          </Container>
        </MainContainer>
      </Suspense>
    </>
  );
};

export default BlogPage;
