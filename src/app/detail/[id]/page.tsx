'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import supabase from '@/supabaseClient';
import { Session } from '@supabase/supabase-js';

import { CustomDetailCard } from '../../../components/common/CustomDetailCard';

import { Spacer, Image } from '@nextui-org/react';
import { useRouter } from 'next/navigation';

export interface StudyPlace {
  id: string;
  place_id: string;
  category: string;
  place_name: string;
  place_type: string;
  photo_url: string;
  rating: number;
  address: string;
  operating_hours: string;
  contact: string;
  fee: string;
  website_url: string;
  notes: string;
}

const Detail = () => {
  const router = useRouter();
  const pathname = usePathname();
  console.log('pathname: ', pathname);

  const [studyPlace, setStudyPlace] = useState<StudyPlace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 현재 URL에서 place_id 추출
  useEffect(() => {
    const fetchStudyPlaceData = async () => {
      if (!pathname) return;

      // URL에서 place_id 추출 (예: '/detail/2fd15f01-31e0-436a-b544-82d53460ec76')
      const placeId = pathname.split('/')[2];
      console.log('placeId: ', placeId);

      try {
        setLoading(true);

        // Supabase에서 해당 place_id를 가진 데이터 가져오기
        let { data, error } = await supabase
          .from('study_places')
          .select('*')
          .eq('place_id', placeId)
          .single();

        if (error) throw error;

        // 데이터를 state에 설정
        setStudyPlace(data);
        console.log('data: ', data);
      } catch (error) {
        console.error('Failed to fetch study place details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudyPlaceData();
  }, [pathname]);

  if (loading) return <p>Loading...</p>;
  if (!studyPlace) return <p>No study place found</p>;

  return (
    <>
      <div className='flex justify-center w-full overflow-hidden mb-8'>
        <Image
          width={500}
          height={200}
          alt='Study Place Detail Image'
          src={studyPlace.photo_url}
        />
      </div>
      <div>
        <main className='mx-20 lg:px-8'>
          <div className='flex items-baseline justify-start pb-2 pt-6'>
            <h1 className='text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-200'>
              Categories
            </h1>
            <div className='pb-4'>
              {/* <div className='ml-52 text-2xl font-bold text-gray-700 dark:text-gray-300'>
                {nickname
                  ? `${nickname}님이 목표와 꿈을 이루시도록 스플이 함께할게요!`
                  : '3초만에 로그인해서 다양한 서비스를 만나보세요!'}
              </div> */}
            </div>
          </div>

          <section aria-labelledby='products-heading' className='pb-24 pt-6'>
            <div className='grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4'>
              <form className='hidden lg:block'>
                <h3 className='sr-only'>Categories</h3>
                <div className='space-y-6 pb-8 text-xl font-medium text-gray-900 dark:text-gray-200'>
                  {/* 여기! */}
                </div>
              </form>

              <div className='lg:col-span-3'>
                <div className='flex flex-wrap'>
                  <React.Fragment>
                    <div className='cursor-pointer transform transition duration-300 ease-in-out hover:scale-105'>
                      <CustomDetailCard place={studyPlace} />
                    </div>
                    <Spacer x={4} />
                  </React.Fragment>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Detail;
