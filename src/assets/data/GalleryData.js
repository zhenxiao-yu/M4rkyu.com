// src/data/galleryData.js
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

const data = [
  { id: 1, imgSrc: Img1, title: 'Nature 1', subtitle: 'Subtitle 1', date: '' },
  { id: 2, imgSrc: Img2, title: 'Nature 2', subtitle: 'Subtitle 2', date: '' },
  { id: 3, imgSrc: Img3, title: 'Nature 3', subtitle: 'Subtitle 3', date: '' },
  { id: 4, imgSrc: Img4, title: 'Nature 4', subtitle: 'Subtitle 4', date: '' },
  { id: 5, imgSrc: Img5, title: 'Nature 5', subtitle: 'Subtitle 5', date: '' },
  { id: 6, imgSrc: Img6, title: 'Architecture 1', subtitle: 'Subtitle 6', date: '' },
  { id: 7, imgSrc: Img7, title: 'Architecture 2', subtitle: 'Subtitle 7', date: '' },
  { id: 8, imgSrc: Img8, title: 'Architecture 3', subtitle: 'Subtitle 8', date: '' },
  { id: 9, imgSrc: Img9, title: 'Architecture 4', subtitle: 'Subtitle 9', date: '' },
  { id: 10, imgSrc: Img10, title: 'Architecture 5', subtitle: 'Subtitle 10', date: '' },
  { id: 11, imgSrc: Img11, title: 'Urban Life 1', subtitle: 'Subtitle 11', date: '' },
  { id: 12, imgSrc: Img4, title: 'Urban Life 2', subtitle: 'Subtitle 12', date: '' },
  { id: 13, imgSrc: Img5, title: 'Urban Life 3', subtitle: 'Subtitle 13', date: '' },
  { id: 14, imgSrc: Img6, title: 'Urban Life 4', subtitle: 'Subtitle 14', date: '' },
  { id: 15, imgSrc: Img7, title: 'Urban Life 5', subtitle: 'Subtitle 15', date: '' },
  { id: 16, imgSrc: Img8, title: 'Abstract 1', subtitle: 'Subtitle 16', date: '' },
  { id: 17, imgSrc: Img10, title: 'Abstract 2', subtitle: 'Subtitle 17', date: '' },
  { id: 18, imgSrc: Img11, title: 'Abstract 3', subtitle: 'Subtitle 18', date: '' },
  { id: 19, imgSrc: Img4, title: 'Abstract 4', subtitle: 'Subtitle 19', date: '' },
  { id: 20, imgSrc: Img5, title: 'Abstract 5', subtitle: 'Subtitle 20', date: '' },
  { id: 21, imgSrc: Img6, title: 'Misc 1', subtitle: 'Subtitle 21', date: '' },
  { id: 22, imgSrc: Img7, title: 'Misc 2', subtitle: 'Subtitle 22', date: '' },
  { id: 23, imgSrc: Img8, title: 'Misc 3', subtitle: 'Subtitle 23', date: '' },
];

const sections = [
  {
    header: 'ShangHai',
    subheader: 'Traveling in 2024',
    images: data.slice(0, 0)
  },
  {
    header: 'Black and White',
    subheader: 'Marvels of human engineering',
    images: data.slice(5, 10)
  },
  {
    header: 'ChangChun',
    subheader: 'My Hometown',
    images: data.slice(10, 15)
  },
  {
    header: 'Abstract',
    subheader: 'Artistic expressions and abstract views',
    images: data.slice(15, 20)
  },
  {
    header: 'Miscellaneous',
    subheader: 'A mix of different subjects',
    images: data.slice(20, 23)
  },
];

export { data, sections };
