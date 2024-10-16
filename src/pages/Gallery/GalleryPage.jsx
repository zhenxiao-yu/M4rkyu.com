import React, { lazy, Suspense, useEffect, useState, memo, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';  // Import withRouter
import { motion } from 'framer-motion';
import useFirestore from '../../hooks/useFirebase';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { sections } from '../../assets/data/GalleryData';
import Modal from '../../components/Modal';
import './GalleryPage.css';
import { Typewriter } from 'react-simple-typewriter';
import { HiChevronDoubleUp } from "react-icons/hi";

const AnchorComponent = lazy(() => import('../../components/Anchor'));
const SocialIcons = lazy(() => import('../../components/SocialIcons'));
const HomeButton = lazy(() => import('../../components/HomeButton'));
const LogoComponent = lazy(() => import('../../components/LogoComponent'));
const BigTitle = lazy(() => import('../../components/BigTitle'));

const FallbackComponent = () => (
  <div className="fallback">
    <p>Loading content, please wait...</p>
  </div>
);

const MemoLogoComponent = memo(LogoComponent);
const MemoHomeButton = memo(HomeButton);
const MemoSocialIcons = memo(SocialIcons);
const MemoAnchorComponent = memo(AnchorComponent);
const MemoBigTitle = memo(BigTitle);

const GalleryPage = ({ match, history }) => {  // Get history from props using withRouter
  const section = match.params.section;  // Get the section from match.params
  const [selectedImg, setSelectedImg] = useState(null);
  const { docs } = useFirestore('images');
  const [loading, setLoading] = useState({});
  const [selectedSection, setSelectedSection] = useState(section || '');

  const allSectionsLoaded = useRef(false);

  useEffect(() => {
    allSectionsLoaded.current = true;
  }, []);

  useEffect(() => {
    if (section) {
      setSelectedSection(section);  // Automatically set the section based on the URL parameter
    }
  }, [section]);

  const handleImageLoad = useCallback((id) => {
    setLoading((prev) => ({ ...prev, [id]: false }));
  }, []);

  // Function to handle the dropdown and change URL
  const handleScrollToSection = useCallback((event) => {
    const selectedSection = event.target.value;
    if (selectedSection) {
      setSelectedSection(selectedSection);
      history.push(`/gallery/${selectedSection}`);  // Navigate to the section URL
    }
  }, [history]);

  const filterDocs = useCallback(
    (sectionHeader) => docs.filter((doc) => doc.section === sectionHeader),
    [docs]
  );

  return (
    <>
      <Helmet>
        <title>Gallery - Mark Yu</title>
        <link rel="canonical" href={`https://www.m4rkyu.com/gallery/${section}`} />
        <meta property="og:title" content={`Gallery - ${section || 'Mark Yu'}`} />
        <meta property="og:description" content="Explore the gallery of Mark Yu, showcasing various sections of images." />
        <meta property="og:url" content={`https://www.m4rkyu.com/gallery/${section}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {selectedImg && <Modal selectedImg={selectedImg} setSelectedImg={setSelectedImg} />}
      <div className="container">
        <Suspense fallback={<FallbackComponent />}>
          <MemoLogoComponent />
          <MemoHomeButton />
          <MemoSocialIcons />
          <MemoAnchorComponent number={0} />
          <MemoBigTitle text="Gallery" left="25rem" top="15rem" />
        </Suspense>

        {/* Dropdown to select sections */}
        <Dropdown selectedImg={selectedImg} handleScrollToSection={handleScrollToSection} />

        {!selectedSection ? (
          <HeroSection />
        ) : (
          sections.map((section, index) => (
            selectedSection === section.header.toLowerCase() && (
              <Section 
                key={index}
                index={index}
                section={section}
                filterDocs={filterDocs}
                docs={docs}
                setSelectedImg={setSelectedImg}
                handleImageLoad={handleImageLoad}
                loading={loading}
              />
            )
          ))
        )}
      </div>
    </>
  );
};
const Section = ({ index, section, filterDocs, docs, setSelectedImg, handleImageLoad, loading }) => {
  const imgRefs = useRef({});

  const handleImageError = useCallback((id) => {
    setLoading((prev) => ({ ...prev, [id]: 'error' }));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);
          }
        });
      },
      { threshold: 0.1 }
    );

    const images = Object.values(imgRefs.current);
    images.forEach((img) => {
      if (img) observer.observe(img);
    });

    return () => observer.disconnect();
  }, [docs]);

  return (
    <div className="section-container" id={`section-${index}`}>
      <div className="section-header">
        <h2 className="animate__animated animate__zoomIn">{section.header}</h2>
      </div>
      <h3 className="animate__animated animate__backInUp">{section.subheader}</h3>
      {filterDocs(section.header).length === 0 ? (
        <div className="empty-message">
          <h3>Oops! No images available at the moment</h3>
        </div>
      ) : (
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 750: 4, 900: 6 }}>
          <Masonry gutter="10px">
            {filterDocs(section.header).map((doc) => (
              <motion.div
                className="image-box animate__animated animate__zoomInUp"
                key={doc.id}
                layout
                whileHover={{ opacity: 1 }}
                onClick={() => setSelectedImg(doc.url)}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0, scale: 0.8, y: 50 },
                  visible: { opacity: 1, scale: 1, y: 0 },
                  exit: { opacity: 0, scale: 0.8, y: -50 },
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="image-container">
                  {loading[doc.id] !== false && <div className="loader"></div>}
                  <img
                    ref={(el) => (imgRefs.current[doc.id] = el)}  // Assign ref for each image
                    data-src={doc.url}  // Lazy load using data-src
                    alt={`Gallery Image ${doc.title || 'No title'}`}
                    onLoad={() => handleImageLoad(doc.id)}
                    onError={() => handleImageError(doc.id)}
                    style={{ display: loading[doc.id] ? 'none' : 'block' }}
                  />
                </div>
                <div className="image-info">
                  <h4>{doc.title}</h4>
                  <p>{doc.date}</p>
                </div>
              </motion.div>
            ))}
          </Masonry>
        </ResponsiveMasonry>
      )}
    </div>
  );
};

// Dropdown component
const Dropdown = ({ selectedImg, handleScrollToSection }) => (
  <div className={`dropdown-container ${selectedImg ? 'hidden' : ''}`}>
    <select onChange={handleScrollToSection}>
      <option value="">Select a section...</option>
      {sections.map((section, index) => (
        <option key={index} value={section.header.toLowerCase()}>
          {section.header}
        </option>
      ))}
    </select>
  </div>
);

const HeroSection = () => (
  <div className="hero-section">
    <HiChevronDoubleUp size="3rem"/>
    <h1>Welcome to My Gallery</h1>
    <Typewriter
      words={['<p>Explore various sections to see different collections of images.</p>']}
      loop={0}
      typeSpeed={50}
      deleteSpeed={50}
      delaySpeed={1500}
      cursor
      aria-label="<p>Explore various sections to see different collections of images.</p>"
    />
  </div>
);

export default withRouter(GalleryPage);  // Wrap GalleryPage with withRouter to access history
