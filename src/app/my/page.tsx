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
          <section aria-labelledby='products-heading' className='pb-24 pt-6'>
            <div className='grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4'>
              <form className='hidden lg:block'>
                <div className='mt-2 space-y-6 pb-8 text-xl font-medium text-gray-900 dark:text-gray-200'>
                  <div>
                    <button
                      type='button'
                      // onClick={() => handleCategorySelection('')}
                    >
                      내 프로필 정보
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      // onClick={() => handlePlaceTypeSelection('스터디룸')}
                    >
                      내가 스크랩한 장소
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      // onClick={() => handlePlaceTypeSelection('스터디카페')}
                    >
                      내가 작성한 댓글
                    </button>
                  </div>
                </div>
              </form>

              <div className='lg:col-span-3'>
                <div className='pb-4'>
                  {/* flex items-center justify-start */}
                  <div className='pb-4 text-3xl font-bold text-gray-700 dark:text-gray-300'>
                    {userProfile?.nickname}님의 프로필 정보
                  </div>
                </div>
                <div className='flex flex-wrap'>
                  <div className='text-2xl font-bold ml-3'>
                    {userProfile?.nickname}
                  </div>
                  <input
                    name='nickname'
                    value={userProfile?.nickname || ''}
                    onChange={handleUserProfileInputChange}
                  />
                  <div className='text-2xl font-bold ml-3'>
                    {userProfile?.email}
                  </div>
                  <input
                    name='email'
                    value={userProfile?.email}
                    onChange={handleUserProfileInputChange}
                  />
                  <div className='text-2xl font-bold ml-3'>
                    {userProfile?.user_type}
                  </div>
                  <input
                    name='nickname'
                    value={userProfile?.user_type}
                    onChange={handleUserProfileInputChange}
                  />
                  <div className='flex justify-center w-full overflow-hidden mb-8'>
                    <div
                      className='rounded-lg bg-cover bg-center bg-no-repeat w-[1000px] p-4 mx-2'
                      style={{
                        height: '500px',
                        backgroundImage: `url(${userProfile?.user_profile_image})`,
                      }}
                    >
                      <div>
                        <input
                          name='user_profile_image'
                          value={userProfile?.user_profile_image || ''}
                          onChange={handleUserProfileInputChange}
                        />
                        <button onClick={updateUserProfile}>
                          프로필 저장하기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default My;
