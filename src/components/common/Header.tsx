import React from 'react';
import HeaderImg from '../../../public/images/HeaderImg.jpg';

const Header = () => {
  return (
    <div className='flex justify-center w-full overflow-hidden mb-8'>
      <div
        className='rounded-lg bg-cover bg-center bg-no-repeat w-[1000px] h-[400px] p-4 mx-2'
        style={{
          backgroundImage: `url('/images/HeaderImg.jpg')`,
        }}
      ></div>
    </div>
  );
};

export default Header;
