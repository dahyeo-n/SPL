'use client';

import React from 'react';
import { Card } from '@nextui-org/react';

export const CustomMainCard = ({ place, onCardClick }) => (
  <div onClick={() => onCardClick(place.place_id)}>
    <Card className='w-[300px] p-4 mx-2 mb-10' radius='2xl'>
      <div
        className='h-40 rounded-lg bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: `url(${place.photo_url})` }}
      ></div>
      <div className='space-y-1 pt-2'>
        <div className='text-xl font-bold pt-2'>{place.place_name}</div>
        <div className='text-lg'>[평점] {place.rating ?? '없음'}</div>
        <div className='text-lg'>[위치] {place.place_name}</div>
        <div className='text-lg'>[운영시간] {place.operating_hours}</div>
      </div>
    </Card>
  </div>
);
