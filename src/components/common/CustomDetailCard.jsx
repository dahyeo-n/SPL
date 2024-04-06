'use client';

import React from 'react';
import { Card, CardHeader, Button } from '@nextui-org/react';

export const CustomDetailCard = ({ place, isScrapped, onScrap, onUnscrap }) => {
  const handleScrapClick = () => {
    if (isScrapped) {
      onUnscrap();
    } else {
      onScrap();
    }
  };

  return (
    <Card className='w-full p-4 mx-2 mb-10 pb-7' radius='2xl'>
      <div className='space-y-2'>
        <CardHeader className='justify-between'>
          <div className='text-3xl font-bold'>{place.place_name}</div>
          <Button
            className={
              isScrapped
                ? 'bg-transparent text-foreground border-default-200'
                : ''
            }
            color='primary'
            radius='full'
            size='sm'
            variant={isScrapped ? 'bordered' : 'solid'}
            onPress={handleScrapClick}
          >
            {isScrapped ? (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='w-6 h-6'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='m3 3 1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 0 1 1.743-1.342 48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664 19.5 19.5'
                />
              </svg>
            ) : (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='w-6 h-6'
              >
                <path
                  fillRule='evenodd'
                  d='M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z'
                  clipRule='evenodd'
                />
              </svg>
            )}
          </Button>
        </CardHeader>
        <div className='text-lg ml-3'>[평점] {place.rating ?? '없음'}</div>
        <div className='text-lg ml-3'>[위치] {place.place_name}</div>
        <div className='text-lg ml-3'>[운영시간] {place.operating_hours}</div>
        <div className='text-lg ml-3'>[연락처] {place.contact}</div>
        <div className='text-lg ml-3'>[이용료] {place.fee ?? '없음'}</div>
        <div className='text-lg ml-3'>
          [Site URL] {place.website_url ?? '없음'}
        </div>
        <div className='text-lg ml-3'>[비고] {place.notes ?? '없음'}</div>
      </div>
    </Card>
  );
};
