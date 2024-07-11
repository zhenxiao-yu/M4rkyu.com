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
  width: 100%;
  min-height: 100vh;
`;

const Container = styled.section`
  background-color: #ece9e8;
  opacity: 1;
  background-image: radial-gradient(#08090a 1.1px, rgb(236, 233, 232) 1.1px);
  background-size: 22px 22px;
  width: 100%;
  min-height: 100vh;
  position: relative;
  padding-bottom: 5rem;
  overflow: auto;
`;

const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-top: 5rem;

  ${mediaQueries(30)`
    padding-top: 3rem;
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

const SearchBar = styled(motion.input)`
  width: 80%;
  padding: 0.6rem 1rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
  border: 3px solid rgba(8, 9, 10, 0.5);
  border-radius: 15px;
  font-size: 1.2rem;
  font-family: "Poppins", sans-serif;

  &:focus {
    outline: none;
    border-color: rgba(8, 9, 10, 0.8);
  }

  ${mediaQueries(50)`
    width: 70%;
    font-size: 13px;
  `};

  ${mediaQueries(30)`
    width: 70%;
    font-size: 10px;
  `};
`;

const NoResults = styled.div`
  margin-top: 20%;
  font-size: 1.5rem;
  color: #08090a;
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
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filtering Blogs by search query
  const filteredBlogs = sortedBlogs.filter(
    (blog) =>
      blog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              <SearchBar
                type="text"
                placeholder="&#128270; Search blogs by title or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                initial={{ width: "30%" }}
                animate={{ width: "50%" }}
                transition={{ duration: 0.5 }}
              />
              {filteredBlogs.length > 0 ? (
                <Grid variants={containerVariants} initial="hidden" animate="show" exit="hidden">
                  {filteredBlogs.map((blog) => (
                    <motion.div
                      key={blog.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <BlogComponent blog={blog} />
                    </motion.div>
                  ))}
                </Grid>
              ) : (
                <NoResults>No results found</NoResults>
              )}
            </Center>
            <BigTitle text="Posts" top="5rem" left="5rem" />
          </Container>
        </MainContainer>
      </Suspense>
    </>
  );
};

export default BlogPage;
