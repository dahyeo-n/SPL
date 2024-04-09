import React from 'react';

const Header = () => {
  return (
    <div className='flex justify-center w-full overflow-hidden mb-8'>
      <div
        className='rounded-lg bg-cover bg-center bg-no-repeat w-[1000px] h-[400px] p-4 mx-2'
        style={{
          backgroundImage: `url(https://app.requestly.io/delay/5000/https://nextui-docs-v2.vercel.app/images/hero-card-complete.jpeg)`,
        }}
      ></div>
    </div>
  );
};

export default Header;
