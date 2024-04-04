import React from 'react';
import { Image } from '@nextui-org/react';

const Header = () => {
  return (
    <div className='flex justify-center w-full overflow-hidden mb-8'>
      <Image
        width={500}
        height={200}
        alt='NextUI hero Image with delay'
        src='https://app.requestly.io/delay/5000/https://nextui-docs-v2.vercel.app/images/hero-card-complete.jpeg'
      />
    </div>
  );
};

export default Header;
