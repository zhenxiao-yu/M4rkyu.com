import React, { lazy, Suspense, useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { sections } from '../../assets/data/GalleryData';
import './GalleryPage.css';
import WatermarkedImage from '../../components/Watermark/WatermarkedImage';

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

const MemoWatermarkedImage = memo(WatermarkedImage);
const MemoLogoComponent = memo(LogoComponent);
const MemoHomeButton = memo(HomeButton);
const MemoSocialIcons = memo(SocialIcons);
const MemoAnchorComponent = memo(AnchorComponent);
const MemoBigTitle = memo(BigTitle);

const debounce = (func, delay) => {
  let debounceTimer;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
};

const GalleryPage = () => {
  const [number, setNumber] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const num = (window.innerHeight - 70) / 30;
      setNumber(parseInt(num));
    };

    const debouncedHandleResize = debounce(handleResize, 100);
    handleResize();
    window.addEventListener('resize', debouncedHandleResize);
    return () => window.removeEventListener('resize', debouncedHandleResize);
  }, []);

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: -50 }
  };

  const handleScrollToSection = (event) => {
    const sectionId = event.target.value;
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="container">
        <Suspense fallback={<FallbackComponent />}>
          <MemoLogoComponent />
          <MemoHomeButton />
          <MemoSocialIcons />
          <MemoAnchorComponent number={number} />
          <MemoBigTitle text="Gallery" left="25rem" top="15rem" />
        </Suspense>

        <div className="dropdown-container">
          <select onChange={handleScrollToSection}>
            <option value="">Select a section...</option>
            {sections.map((section, index) => (
              <option key={index} value={`section-${index}`}>
                {section.header}
              </option>
            ))}
          </select>
        </div>

        {sections.length === 0 ? (
          <div className="empty-message">
            <h2>No sections available in the gallery at the moment.</h2>
          </div>
        ) : (
          sections.map((section, index) => (
            <div className="section-container" id={`section-${index}`} key={index}>
              <h2 className="animate__animated animate__zoomIn">{section.header}</h2>
              <h3 className="animate__animated animate__backInUp">{section.subheader}</h3>
              {section.images.length === 0 ? (
                <div className="empty-message">
                  <h3>Oops! No images available at the moment</h3>
                </div>
              ) : (
                <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 4, 900: 6 }}>
                  <Masonry gutter="15px">
                    {section.images.map((item) => (
                      <motion.div
                        className="image-box animate__animated animate__zoomInUp"
                        key={item.id}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={imageVariants}
                        transition={{ duration: 0.5 }}
                        whileInView="visible"
                        viewport={{ once: true }}
                      >
                        <MemoWatermarkedImage src={item.imgSrc} alt={`Gallery Image ${item.id}`} />
                        <div className="image-info">
                          <h4>{item.title}</h4>
                          <p>{item.date}</p>
                        </div>
                      </motion.div>
                    ))}
                  </Masonry>
                </ResponsiveMasonry>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default GalleryPage;
