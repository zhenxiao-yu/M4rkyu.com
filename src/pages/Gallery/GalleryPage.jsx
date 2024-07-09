// GalleryPage.jsx
import React from 'react';
import Img1 from '../../assets/gallery/img1.jpg';
import Img2 from '../../assets/gallery/img2.jpg';
import Img3 from '../../assets/gallery/img3.jpg';
import Img4 from '../../assets/gallery/img4.jpg';
import Img5 from '../../assets/gallery/img5.jpg';
import Img6 from '../../assets/gallery/img6.jpg';
import Img7 from '../../assets/gallery/img7.jpg';
import Img8 from '../../assets/gallery/img8.jpg';
import Img9 from '../../assets/gallery/img9.jpg';
import Img10 from '../../assets/gallery/img10.jpg';
import Img11 from '../../assets/gallery/img11.jpg';

import { lazy, Suspense, useEffect, useState } from "react";
import './GalleryPage.css'
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
import styled from 'styled-components';
import { motion } from 'framer-motion';
const AnchorComponent = lazy(() => import("../../components/Anchor"));
const SocialIcons = lazy(() => import("../../components/SocialIcons"));
const HomeButton = lazy(() => import("../../components/HomeButton"));
const LogoComponent = lazy(() => import("../../components/LogoComponent"));
const BigTitle = lazy(() => import("../../components/BigTitle"));


const GalleryWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2em;
  padding: 10px;
  background-color: #ece9e8;
  opacity: 1;
  background-image: radial-gradient(#08090a 1.1px, #ece9e8 1.1px);
  background-size: 22px 22px;
`;

const Container = styled.div`
  background-color: #ece9e8;
  opacity: 1;
  background-image: radial-gradient(#08090a 1.1px, #ece9e8 1.1px);
  background-size: 22px 22px;
  width: 100%;
  height: auto;
  position: relative;
  padding-bottom: 5rem;
`;

const ImageBox = styled(motion.div)`
  overflow: hidden;
  border-radius: 15px;
  cursor: pointer;
  border: 4px solid #ece9e8;

  img {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.3s ease-in-out;

    &:hover {
      transform: scale(1.1);
    }
  }
`;

const GalleryPage = () => {

  const [number, setNumber] = useState(0);

  useEffect(() => {
    let num = (window.innerHeight - 70) / 30;
    setNumber(parseInt(num));
  }, []);


  
  const data = [
    { id: 1, imgSrc: Img1, title: '', subtitle: '', date: '' },
    { id: 2, imgSrc: Img2, title: '', subtitle: '', date: '' },
    { id: 3, imgSrc: Img3, title: '', subtitle: '', date: '' },
    { id: 4, imgSrc: Img4, title: '', subtitle: '', date: '' },
    { id: 5, imgSrc: Img5, title: '', subtitle: '', date: '' },
    { id: 6, imgSrc: Img6, title: '', subtitle: '', date: '' },
    { id: 7, imgSrc: Img7, title: '', subtitle: '', date: '' },
    { id: 8, imgSrc: Img8, title: '', subtitle: '', date: '' },
    { id: 9, imgSrc: Img9, title: '', subtitle: '', date: '' },
    { id: 10, imgSrc: Img10, title: '', subtitle: '', date: '' },
    { id: 11, imgSrc: Img11, title: '', subtitle: '', date: '' },
    { id: 12, imgSrc: Img4, title: '', subtitle: '', date: '' },
    { id: 13, imgSrc: Img5, title: '', subtitle: '', date: '' },
    { id: 14, imgSrc: Img6, title: '', subtitle: '', date: '' },
    { id: 15, imgSrc: Img7, title: '', subtitle: '', date: '' },
    { id: 16, imgSrc: Img8, title: '', subtitle: '', date: '' },
    { id: 17, imgSrc: Img10, title: '', subtitle: '', date: '' },
    { id: 18, imgSrc: Img11, title: '', subtitle: '', date: '' },
    { id: 19, imgSrc: Img4, title: '', subtitle: '', date: '' },
    { id: 20, imgSrc: Img5, title: '', subtitle: '', date: '' },
    { id: 21, imgSrc: Img6, title: '', subtitle: '', date: '' },
    { id: 22, imgSrc: Img7, title: '', subtitle: '', date: '' },
    { id: 23, imgSrc: Img8, title: '', subtitle: '', date: '' },
  ];

  return (
    <>
      <Container>
          <LogoComponent />
          <HomeButton />
          <SocialIcons />
          <AnchorComponent number={number} />
          <BigTitle text="Posts" top="5rem" left="5rem" />
        </Container>
      <GalleryWrapper>
        <ResponsiveMasonry
                  columnsCountBreakPoints={{350: 1, 750: 3, 900: 6}}
              >
                  <Masonry gutter="2rem">
        {data.map((item) => (
          <ImageBox
            key={item.id}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <img src={item.imgSrc} alt={`Gallery Image ${item.id}`} />
            {item.title}
          </ImageBox>
        ))}
          </Masonry>
          
          </ResponsiveMasonry>
        </GalleryWrapper>
      </>
  );
};

export default GalleryPage;
