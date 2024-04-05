'use client';

import React from 'react';
import { Card } from '@nextui-org/react';

export const CustomDetailCard = ({ place }) => (
  <Card className='w-[480px] p-4 mx-2 mb-10' radius='2xl'>
    <div className='space-y-1 pt-2'>
      <div className='text-3xl font-bold mb-4'>{place.place_name}</div>
      <div className='text-lg'>[평점] {place.rating ?? '없음'}</div>
      <div className='text-lg'>[위치] {place.place_name}</div>
      <div className='text-lg'>[운영시간] {place.operating_hours}</div>
      <div className='text-lg'>[연락처] {place.constact}</div>
      <div className='text-lg'>[이용료] {place.fee ?? '없음'}</div>
      <div className='text-lg'>[Site URL] {place.website_url ?? '없음'}</div>
      <div className='text-lg'>[비고] {place.notes ?? '없음'}</div>
    </div>
  </Card>
);
