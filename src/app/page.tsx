'use client';

import React, { useEffect, useState } from 'react';
import supabase from '@/supabaseClient';

import Header from '@/components/common/Header';
import { CustomCard } from '../components/common/CustomCard';

import { Spacer } from '@nextui-org/react';

interface StudyPlace {
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

const Main: React.FC = () => {
  const [studyPlaces, setStudyPlaces] = useState<StudyPlace[]>([]);

  // 데이터 불러오는 함수
  const fetchStudyPlaces = async () => {
    const { data, error } = await supabase
      .from('study_places')
      .select('*')
      .order('rating', { ascending: false });

    console.log('Study Place Data: ', data);

    if (error) {
      console.error('데이터를 불러오는 데 실패했습니다:', error);
    } else {
      setStudyPlaces(data || []);
    }
  };

  // 컴포넌트가 마운트 될 때 데이터를 불러옴
  useEffect(() => {
    fetchStudyPlaces();
  }, []);

  return (
    <>
      <Header />
      <div>
        <div>
          <main className='mx-20 lg:px-8'>
            {/* <div className='flex items-baseline justify-between border-b border-gray-200 pb-6'> */}
            <div className='flex items-baseline justify-between pb-2 pt-6'>
              <h1 className='text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-200'>
                Categories
              </h1>

              <button
                type='button'
                className='-m-2 ml-5 p-2 text-gray-400 hover:text-gray-500 sm:ml-7 lg:hidden'
              >
                <span className='sr-only'>Filters</span>
                <svg
                  className='h-5 w-5'
                  aria-hidden='true'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </div>

            <section aria-labelledby='products-heading' className='pb-24 pt-6'>
              <h2 id='products-heading' className='sr-only'>
                Products
              </h2>

              <div className='grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4'>
                <form className='hidden lg:block'>
                  <h3 className='sr-only'>Categories</h3>
                  <ul
                    role='list'
                    className='space-y-6 pb-8 text-xl font-medium text-gray-900 dark:text-gray-200'
                  >
                    <li>
                      <a href='#'>추천</a>
                    </li>
                    <li>
                      <a href='#'>전체</a>
                    </li>
                    <li>
                      <a href='#'>스터디룸</a>
                    </li>
                    <li>
                      <a href='#'>스터디카페</a>
                    </li>
                    <li>
                      <a href='#'>노트북 이용</a>
                    </li>
                    <li>
                      <a href='#'>조용하고 한적한</a>
                    </li>
                    <li>
                      <a href='#'>세련되고 깔끔한</a>
                    </li>
                  </ul>
                </form>

                <div className='lg:col-span-3'>
                  <div className='flex flex-wrap'>
                    {studyPlaces.map((place) => (
                      <React.Fragment key={place.id}>
                        <CustomCard place={place} />
                        <Spacer x={4} />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
};

export default Main;
