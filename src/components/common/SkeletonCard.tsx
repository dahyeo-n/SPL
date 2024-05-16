// components/SkeletonCard.tsx
import React from 'react';
import { Card, Skeleton } from '@nextui-org/react';

const SkeletonCard: React.FC = () => {
  return (
    <Card className='w-[335px] space-y-5 p-4' radius='lg'>
      <Skeleton className='rounded-lg'>
        <div className='h-48 rounded-lg bg-default-300'></div>
      </Skeleton>
      <div className='space-y-3'>
        <Skeleton className='w-3/5 h-6 rounded-lg' />
        <Skeleton className='w-4/5 h-5 rounded-lg' />
        <Skeleton className='w-full h-16 rounded-lg' />
      </div>
    </Card>
  );
};

export default SkeletonCard;
