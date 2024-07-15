import React from 'react';
import './WatermarkedImage.css';

const WatermarkedImage = ({ src, alt }) => {
  return (
    <div className="watermarked-image-container">
      <img src={src} alt={alt} className="watermarked-image" />
      <div className="watermark">m4rkyu.com</div>
    </div>
  );
};

export default WatermarkedImage;
