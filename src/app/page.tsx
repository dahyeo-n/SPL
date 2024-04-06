'use client';

import React, { useEffect, useState } from 'react';
import supabase from '@/supabaseClient';
import { Session } from '@supabase/supabase-js';

import Header from '@/components/common/Header';
import { CustomMainCard } from '../components/common/CustomMainCard';

import { useRouter } from 'next/navigation';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPlaceType, setSelectedPlaceType] = useState<string>('');
  const [session, setSession] = useState<Session | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const getUserSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(data.session);
        console.log('로그인 데이터: ', data);
      } catch (error) {
        alert('Session 처리에 오류가 발생했습니다.');
        console.log(error);
      }
    };

    getUserSession();
  }, [router]);

  useEffect(() => {
    if (session?.user && typeof session.user.email === 'string') {
      fetchUserProfile(session.user.email);
    }
  }, [session?.user]);

  const fetchUserProfile = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('nickname')
        .eq('email', email)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setNickname(data.nickname);
      }
    } catch (error) {
      console.error('사용자 프로필을 불러오는 데 실패했습니다:', error);
    }
  };

  const fetchStudyPlaces = async (category: string, placeType: string) => {
    let query = supabase
      .from('study_places')
      .select('*')
      .order('rating', { ascending: false });

    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    if (placeType) {
      query = query.ilike('place_type', `%${placeType}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('데이터를 불러오는 데 실패했습니다:', error);
    } else {
      setStudyPlaces(data || []);
    }
  };

  useEffect(() => {
    fetchStudyPlaces(selectedCategory, selectedPlaceType);
  }, [selectedCategory, selectedPlaceType]);

  const handleCategorySelection = (category: string) => {
    setSelectedCategory(category);
    setSelectedPlaceType('');
    fetchStudyPlaces(category, '');
  };

  const handlePlaceTypeSelection = (placeType: string) => {
    setSelectedPlaceType(placeType);
    setSelectedCategory('');
    fetchStudyPlaces('', placeType);
  };

  return (
    <>
      <Header />
      <div>
        <main className='mx-20 lg:px-8'>
          {/* <div className='flex items-baseline justify-between pb-2 pt-6'> */}
          <div className='flex items-baseline justify-start pb-2 pt-6'>
            <h1 className='text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-200'>
              Categories
            </h1>

            {/* <button
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
            </button> */}
            <div className='pb-4'>
              {/* flex items-center justify-start */}
              <div className='ml-52 text-2xl font-bold text-gray-700 dark:text-gray-300'>
                {nickname
                  ? `${nickname}님이 목표와 꿈을 이루시도록 스플이 함께할게요!`
                  : '3초만에 로그인해서 다양한 서비스를 만나보세요!'}
              </div>
            </div>
          </div>

          <section aria-labelledby='products-heading' className='pb-24 pt-6'>
            <div className='grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4'>
              <form className='hidden lg:block'>
                <h3 className='sr-only'>Categories</h3>
                <div className='space-y-6 pb-8 text-xl font-medium text-gray-900 dark:text-gray-200'>
                  {/* 필터 처리 로직 완성되면 map으로 돌릴 거임 */}
                  <div>
                    <button>추천</button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handleCategorySelection('')}
                    >
                      전체
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handlePlaceTypeSelection('스터디룸')}
                    >
                      스터디룸
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handlePlaceTypeSelection('스터디카페')}
                    >
                      스터디카페
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handlePlaceTypeSelection('일반카페')}
                    >
                      일반카페
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handlePlaceTypeSelection('북카페')}
                    >
                      북카페
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handleCategorySelection('노트북 이용')}
                    >
                      노트북 이용
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handleCategorySelection('조용하고 한적한')}
                    >
                      조용하고 한적한
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handleCategorySelection('세련되고 깔끔한')}
                    >
                      세련되고 깔끔한
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handleCategorySelection('뷰 맛집')}
                    >
                      뷰 맛집
                    </button>
                  </div>
                </div>
              </form>

              <div className='lg:col-span-3'>
                <div className='flex flex-wrap'>
                  {studyPlaces.map((place) => (
                    <React.Fragment key={place.id}>
                      <div
                        className='cursor-pointer transform transition duration-300 ease-in-out hover:scale-105'
                        onClick={() => router.push(`/detail/${place.place_id}`)}
                      >
                        <CustomMainCard
                          place={place}
                          onCardClick={(id: string) =>
                            router.push(`/detail/${id}`)
                          }
                        />
                      </div>
                      <Spacer x={4} />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Main;
