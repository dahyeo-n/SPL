import React from 'react';
import EmblaCarousel from '../common/EmblaCarousel';
import { EmblaOptionsType } from 'embla-carousel';
import Link from 'next/link';

const OPTIONS: EmblaOptionsType = { loop: true };
const SLIDES = ['/images/HeaderImg.jpg', '/images/spl-survey.jpg'];

const Header: React.FC = () => {
  return (
    <div className='relative flex justify-center w-full overflow-hidden mb-2'>
      <EmblaCarousel slides={SLIDES} options={OPTIONS} />
      {SLIDES.map(
        (slide, index) =>
          slide === '/images/spl-survey.jpg' && (
            <Link
              key={index}
              href='https://docs.google.com/forms/d/e/1FAIpQLSfiOnRAbYliuYfR8g0FHFNd7tygTFHp2ERvyVztuQU_IYoYhw/viewform?usp=sharing'
              className='absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black px-4 py-2 rounded-md'
              style={{ zIndex: 10 }}
            >
              SPL 설문 시작하기
            </Link>
          )
      )}
    </div>
  );
};

export default Header;
