'use client';

import React, { useEffect, useState } from 'react';
import supabase from '@/supabaseClient';
import { Session } from '@supabase/supabase-js';

import { useRouter } from 'next/navigation';

interface UserProfile {
  user_uid: string;
  nickname: string;
  email: string;
  user_type: string;
  created_at: string;
  user_profile_image: string;
}

const My: React.FC = () => {
  // const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

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
    if (session?.user) {
      fetchUserProfile(session.user.id);
    }
  }, [session?.user]);

  const fetchUserProfile = async (user_uid: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_uid', user_uid)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('사용자 프로필을 불러오는 데 실패했습니다: ', error);
    }
  };

  // useEffect(() => {
  //   fetchStudyPlaces(selectedCategory, selectedPlaceType);
  // }, [selectedCategory, selectedPlaceType]);

  // const handleCategorySelection = (category: string) => {
  //   setSelectedCategory(category);
  //   setSelectedPlaceType('');
  //   fetchStudyPlaces(category, '');
  // };

  // const handlePlaceTypeSelection = (placeType: string) => {
  //   setSelectedPlaceType(placeType);
  //   setSelectedCategory('');
  //   fetchStudyPlaces('', placeType);
  // };

  const handleUserProfileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setUserProfile((prev) => ({ ...prev!, [name]: value }));
  };

  const updateUserProfile = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        nickname: userProfile?.nickname,
        user_profile_image: userProfile?.user_profile_image,
      })
      .eq('user_uid', session?.user?.id);

    if (error) {
      console.error('프로필 업데이트에 실패했습니다: ', error);
    } else {
      alert('프로필이 성공적으로 업데이트되었습니다!');
    }
  };

  return (
    <>
      <div>
        <main className='mx-20 lg:px-8'>
          <div className='flex items-baseline justify-start pb-2 pt-6'>
            <h1 className='text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-200'>
              Categories
            </h1>
            <div className='pb-4'>
              <div className='ml-52 text-2xl font-bold text-gray-700 dark:text-gray-300'>
                {userProfile?.nickname}님의 프로필 정보
              </div>
            </div>
          </div>

          <section aria-labelledby='products-heading' className='pb-24 pt-6'>
            <div className='grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4'>
              <div className='lg:col-span-1 mt-2 space-y-6 pb-8 text-xl font-medium text-gray-900 dark:text-gray-200'>
                <div>
                  <button
                  // onClick={() => handleCategorySelection('')}
                  >
                    내 프로필 정보
                  </button>
                </div>
                <div>
                  <button
                  // onClick={() => handlePlaceTypeSelection('스터디룸')}
                  >
                    내가 스크랩한 장소
                  </button>
                </div>
                <div>
                  <button
                  // onClick={() => handlePlaceTypeSelection('스터디카페')}
                  >
                    내가 작성한 댓글
                  </button>
                </div>
              </div>
              <div className='lg:col-span-1'>
                <div className='w-full overflow-hidden mb-8'>
                  <div
                    className='rounded-lg bg-cover bg-center bg-no-repeat w-[300px] h-[300px] p-4'
                    style={{
                      backgroundImage: `url(${userProfile?.user_profile_image})`,
                    }}
                  ></div>
                </div>
                <input
                  className='mt-1 block w-[300px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                  name='user_profile_image'
                  value={userProfile?.user_profile_image || ''}
                  onChange={handleUserProfileInputChange}
                />
                <button
                  className=' w-[300px] mt-2 px-4 py-2 bg-blue-500 text-white rounded-md'
                  onClick={updateUserProfile}
                >
                  이미지 변경하기
                </button>
              </div>
              <div className='lg:col-span-2'>
                <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4 flex flex-wrap'>
                  <div className='text-2xl font-bold ml-3'>닉네임</div>
                  <input
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                    name='nickname'
                    value={userProfile?.nickname || ''}
                    onChange={handleUserProfileInputChange}
                  />
                  <div className='text-2xl font-bold ml-3'>이메일</div>
                  <input
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                    name='email'
                    value={userProfile?.email}
                    onChange={handleUserProfileInputChange}
                  />
                  <div className='text-2xl font-bold ml-3'>유형</div>
                  <input
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                    name='nickname'
                    value={userProfile?.user_type}
                    onChange={handleUserProfileInputChange}
                  />
                </div>
              </div>
              <div className='lg:col-span-4 flex justify-end'>
                <button
                  className=' w-[250px] my-4 px-4 py-2 bg-blue-500 text-white rounded-md'
                  onClick={updateUserProfile}
                >
                  프로필 저장하기
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default My;
