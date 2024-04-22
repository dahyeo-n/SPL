import React from 'react';
import EmblaCarousel from '../common/EmblaCarousel';
import { EmblaOptionsType } from 'embla-carousel';

const OPTIONS: EmblaOptionsType = { loop: true };
const SLIDES = [
  '/images/HeaderImg.jpg',
  '/images/HeaderImg.jpg',
  '/images/HeaderImg.jpg',
  '/images/HeaderImg.jpg',
  '/images/HeaderImg.jpg',
];

const Header: React.FC = () => {
  return (
    <div className='flex justify-center w-full overflow-hidden mb-2'>
      {/* <div
        className='rounded-lg bg-cover bg-center bg-no-repeat w-[1000px] h-[400px] p-4 mx-2'
        style={{
          backgroundImage: `url('/images/HeaderImg.jpg')`,
        }}
      ></div> */}
      <EmblaCarousel slides={SLIDES} options={OPTIONS} />
    </div>
  );
};

export default Header;
