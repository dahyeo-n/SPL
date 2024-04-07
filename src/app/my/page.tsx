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
  const [updatedNickname, setUpdatedNickname] = useState<string>('');
  const [updatedEmail, setUpdatedEmail] = useState<string>('');
  const [updatedUserType, setUpdatedUserType] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<string>('');

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
      setUpdatedNickname(data.nickname);
      setUpdatedEmail(data.email);
      setUpdatedUserType(data.user_type);
      setProfileImage(data.user_profile_image);
    } catch (error) {
      console.error('사용자 프로필을 불러오는 데 실패했습니다: ', error);
    }
  };

  const updateUserProfile = async () => {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        nickname: updatedNickname,
        email: updatedEmail,
        user_type: updatedUserType,
        user_profile_image: profileImage,
      })
      .eq('user_uid', session?.user?.id);

    if (error) {
      console.error('프로필 업데이트에 실패했습니다: ', error);
    } else {
      alert('프로필이 성공적으로 업데이트되었습니다!');
      fetchUserProfile(session?.user?.id!);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadProfileImage = async () => {
    if (!imageFile || !session?.user) return;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${session.user.id}/${Math.random()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('user_avatars')
      .upload(fileName, imageFile);

    if (error) {
      console.error('이미지 업로드에 실패했습니다:', error);
      return;
    }

    const projectStorageUrl = `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/storage/v1`;
    const url = `${projectStorageUrl}/object/public/user_avatars/${encodeURIComponent(
      fileName
    )}`;

    setProfileImage(url);
  };

  useEffect(() => {
    if (imageFile) {
      uploadProfileImage();
    }
  }, [imageFile]);

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
                      backgroundImage: `url(${
                        profileImage || '/default-profile.png'
                      })`,
                    }}
                  ></div>
                </div>
                <input
                  className='mt-1 block w-[300px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                  name='user_profile_image'
                  type='file'
                  onChange={handleImageChange}
                />
                <button
                  className=' w-[300px] mt-2 px-4 py-2 bg-blue-500 text-white rounded-md'
                  onClick={() => imageFile && uploadProfileImage()}
                >
                  이미지 변경하기
                </button>
              </div>
              <div className='lg:col-span-2'>
                <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4 flex flex-wrap'>
                  <label className='text-2xl font-bold ml-3'>닉네임</label>
                  <input
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                    name='nickname'
                    value={updatedNickname}
                    onChange={(e) => setUpdatedNickname(e.target.value)}
                  />
                  <label className='text-2xl font-bold ml-3'>이메일</label>
                  <input
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                    name='email'
                    value={updatedEmail}
                    onChange={(e) => setUpdatedEmail(e.target.value)}
                  />
                  <label className='text-2xl font-bold ml-3'>유형</label>
                  <input
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                    name='user_type'
                    value={updatedUserType}
                    onChange={(e) => setUpdatedUserType(e.target.value)}
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
