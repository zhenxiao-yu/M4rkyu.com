import React, { lazy, Suspense, useEffect, useState, memo, useRef, useCallback } from 'react';
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

const GalleryPage = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const { docs } = useFirestore('images');
  const [loading, setLoading] = useState({});
  const [selectedSection, setSelectedSection] = useState('');
  const allSectionsLoaded = useRef(false);

  useEffect(() => {
    allSectionsLoaded.current = true;
  }, []);

  const handleImageLoad = useCallback((id) => {
    setLoading((prev) => ({ ...prev, [id]: false }));
  }, []);

  const handleScrollToSection = useCallback((event) => {
    const sectionId = event.target.value;
    setSelectedSection(sectionId);
    if (sectionId && allSectionsLoaded.current) {
      const sectionElement = document.getElementById(sectionId);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const filterDocs = useCallback(
    (sectionHeader) => docs.filter((doc) => doc.section === sectionHeader),
    [docs]
  );

  return (
    <>
      {selectedImg && <Modal selectedImg={selectedImg} setSelectedImg={setSelectedImg} />}
      <div className="container">
        <Suspense fallback={<FallbackComponent />}>
          <MemoLogoComponent />
          <MemoHomeButton />
          <MemoSocialIcons />
          <MemoAnchorComponent number={0} />
          <MemoBigTitle text="Gallery" left="25rem" top="15rem" />
        </Suspense>

        <div className={`dropdown-container ${selectedImg ? 'hidden' : ''}`}>
          <select onChange={handleScrollToSection}>
            <option value="">Select a section...</option>
            {sections.map((section, index) => (
              <option key={index} value={`section-${index}`}>
                {section.header}
              </option>
            ))}
          </select>
        </div>

        {!selectedSection ? (
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
        ) : (
          sections.map((section, index) => (
            selectedSection === `section-${index}` && (
              <div className="section-container" id={`section-${index}`} key={index}>
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
                            {loading[doc.id] && <div className="loader"></div>}
                            <img
                              src={doc.url}
                              alt={`Gallery Image ${doc.id}`}
                              onLoad={() => handleImageLoad(doc.id)}
                              style={{ opacity: loading[doc.id] ? 0 : 1 }}
                            />
                          </div>
                          <div className="image-info">
                            <h4>{doc?.title}</h4>
                            <p>{doc?.date}</p>
                          </div>
                        </motion.div>
                      ))}
                    </Masonry>
                  </ResponsiveMasonry>
                )}
              </div>
            )
          ))
        )}
      </div>
    </>
  );
};

export default GalleryPage;
