'use client';

import React, { useEffect, useState } from 'react';
import supabase from '@/supabaseClient';
import useBearsStore from '@/zustand/bearsStore';
import { useRouter } from 'next/navigation';

import useStudyPlaces from '@/hooks/useStudyPlaces';
import useUserSession from '@/hooks/useUserSession';

import Header from '@/components/common/Header';
import CustomMainCard from '../components/common/CustomMainCard';
import SkeletonCard from '../components/common/SkeletonCard';

import { Spacer } from '@nextui-org/react';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';

const Main: React.FC = () => {
  const [selectedState, setSelectedState] = useState({
    category: '',
    placeType: '',
  });

  const router = useRouter();

  const { nickname, setNickname } = useBearsStore();

  // useStudyPlaces 훅을 사용하여 전체 데이터를 가져옴
  const { data: allStudyPlaces, isLoading: placesLoading } = useStudyPlaces();

  // useSession 훅을 사용하여 세션 데이터를 가져옴
  const {
    data: session,
    isLoading: sessionLoading,
    refetch: refetchSession,
  } = useUserSession();

  // 가져온 데이터에서 필터링 적용
  const filteredStudyPlaces = allStudyPlaces?.filter((place) => {
    const matchesCategory = selectedState.category
      ? place.category?.includes(selectedState.category)
      : true;
    const matchesPlaceType = selectedState.placeType
      ? place.place_type?.includes(selectedState.placeType)
      : true;
    return matchesCategory && matchesPlaceType;
  });

  // 세션이 변경됐을 때 사용자 프로필 정보를 가져옴
  useEffect(() => {
    if (session?.user && typeof session.user.email === 'string') {
      const provider = session.user.app_metadata.provider;
      const isSocialLogin =
        provider === 'kakao' || provider === 'google' || provider === 'github';

      // 소셜 로그인 사용자인지 확인 후, 프로필 저장 or 업데이트
      if (isSocialLogin) {
        saveOrUpdateUserProfile(session.user, provider);
      }

      fetchUserProfile(session.user.email);
    } else {
      setNickname(null);
    }
  }, [session]);

  useEffect(() => {
    // 세션 상태 변경 감지
    const { data } = supabase.auth.onAuthStateChange(() => {
      refetchSession(); // 세션 다시 가져옴
    });

    // cleanup 함수를 사용해 로그아웃 시, 즉시 반영
    return () => {
      data.subscription?.unsubscribe();
    };
  }, [refetchSession]);

  // 이메일을 이용하여 사용자 프로필 정보를 가져오고, 가져온 닉네임을 상태로 설정
  const fetchUserProfile = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('nickname')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;
      if (data) setNickname(data.nickname);
    } catch (error) {
      console.error('사용자 프로필을 불러오는 데 실패했습니다: ', error);
    }
  };

  const saveOrUpdateUserProfile = async (user: any, provider: string) => {
    const { data: existingProfiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('nickname, user_profile_image')
      .eq('email', user.email) // 이메일을 기준으로 프로필 조회
      .maybeSingle();

    if (profileError) {
      console.error('프로필 조회 에러: ', profileError);
      return;
    }

    let nickname = user.user_metadata?.name || user.email.split('@')[0];
    let profileImageUrl =
      existingProfiles?.user_profile_image || '/images/default-profile.jpg';

    if (existingProfiles) return;

    // 프로필이 존재하지 않으면 새로운 프로필 생성
    if (!existingProfiles) {
      const { data: existingNicknames } = await supabase
        .from('user_profiles')
        .select('nickname')
        .eq('nickname', nickname);

      // 소셜 로그인 사용자의 프로필 이미지와 닉네임 저장
      // 닉네임이 이미 존재하면 고유한 닉네임으로 업데이트
      if (existingNicknames && existingNicknames.length > 0) {
        nickname += `_${Date.now()}`;
      }

      profileImageUrl = user.user_metadata?.avatar_url || profileImageUrl;
    }

    try {
      const { data, error } = await supabase.from('user_profiles').upsert(
        {
          user_uid: user.id,
          nickname,
          email: user.email,
          user_type: provider,
          user_profile_image: profileImageUrl,
        },
        {
          onConflict: 'email',
        }
      );

      if (error) {
        console.error('프로필 저장 에러: ', error);
        return;
      }

      console.log('프로필 데이터: ', data);
    } catch (error) {
      console.error('프로필 저장 중 예외 발생: ', error);
    }
  };

  const handleCategorySelection = (category: string) => {
    if (category !== selectedState.category) {
      window.history.pushState({}, '', `?category=${category}`);
      setSelectedState({ category, placeType: '' });
    }
  };

  const handlePlaceTypeSelection = (placeType: string) => {
    if (placeType !== selectedState.placeType) {
      window.history.pushState({}, '', `?placeType=${placeType}`);
      setSelectedState({ category: '', placeType });
    }
  };

  useEffect(() => {
    const loadFromURL = () => {
      const params = new URLSearchParams(window.location.search);
      const category = params.get('category') || '';
      const placeType = params.get('placeType') || '';

      if (
        category !== selectedState.category ||
        placeType !== selectedState.placeType
      ) {
        setSelectedState({ category, placeType });
      }
    };

    window.addEventListener('popstate', loadFromURL);
    loadFromURL();

    return () => {
      window.removeEventListener('popstate', loadFromURL);
    };
  }, [selectedState.category, selectedState.placeType]);

  const renderSkeletonCards = (count: number) => {
    return Array.from({ length: count }, (_, index) => (
      <SkeletonCard key={index} />
    ));
  };

  // 세션 및 데이터 로딩 상태 관리
  const isLoading = sessionLoading || placesLoading;

  const categories = [
    { label: '전체', value: '' },
    { label: '스터디룸', value: '스터디룸' },
    { label: '스터디카페', value: '스터디카페' },
    { label: '일반카페', value: '일반카페' },
    { label: '북카페', value: '북카페' },
    { label: '노트북 이용', value: '노트북 이용' },
    { label: '조용하고 한적한', value: '조용하고 한적한' },
    { label: '세련되고 깔끔한', value: '세련되고 깔끔한' },
    { label: '뷰 맛집', value: '뷰 맛집' },
  ];

  return (
    <>
      <Header />
      <ToastContainer />
      <div>
        <main className='mx-20 lg:px-8'>
          <section aria-labelledby='products-heading' className='pb-24 pt-6'>
            <div className='grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4'>
              <form className='hidden lg:block'>
                <h1 className='pb-8 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-200'>
                  Categories
                </h1>
                <div className='space-y-6 pb-8 text-xl font-medium text-gray-900 dark:text-gray-200'>
                  {categories.map((category) => (
                    <div key={category.value}>
                      <button
                        type='button'
                        onClick={() => {
                          if (category.value === '') {
                            window.history.pushState({}, '', '/');
                            setSelectedState({ category: '', placeType: '' });
                          } else if (
                            [
                              '스터디룸',
                              '스터디카페',
                              '일반카페',
                              '북카페',
                            ].includes(category.value)
                          ) {
                            handlePlaceTypeSelection(category.value);
                          } else {
                            handleCategorySelection(category.value);
                          }
                        }}
                        className={`relative overflow-hidden before:absolute before:inset-x-0 before:bottom-0 before:h-[2px] before:bg-crimson before:scale-x-0 hover:before:scale-x-100 before:transition-transform ${
                          (category.value === '' &&
                            selectedState.category === '' &&
                            selectedState.placeType === '') ||
                          (category.value !== '' &&
                            (selectedState.category === category.value ||
                              selectedState.placeType === category.value))
                            ? 'text-gray-900 dark:text-gray-200'
                            : 'text-gray-400 dark:text-gray-500'
                        } hover:text-gray-900 hover:dark:text-gray-200 transform transition-transform duration-300 hover:translate-x-1`}
                      >
                        {category.label}
                      </button>
                    </div>
                  ))}
                </div>
              </form>

              {isLoading ? (
                <div className='lg:col-span-3'>
                  <div className='flex flex-wrap'>{renderSkeletonCards(9)}</div>
                </div>
              ) : (
                <div className='lg:col-span-3'>
                  <div className='pt-2 pb-8'>
                    <div className='text-2xl font-bold text-gray-700 dark:text-gray-300'>
                      {session && nickname ? (
                        `${nickname}님이 목표와 꿈을 이루시도록 스플이 함께할게요!`
                      ) : session ? (
                        `님이 목표와 꿈을 이루시도록 스플이 함께할게요!`
                      ) : (
                        <>
                          3초만에{' '}
                          <Link href='/sign/signin'>
                            <span className='text-indigo-500 underline decoration-indigo-500'>
                              로그인
                            </span>
                          </Link>{' '}
                          하셔서 다양한 서비스를 만나보세요!
                        </>
                      )}
                    </div>
                  </div>
                  <div className='flex flex-wrap'>
                    {filteredStudyPlaces?.map((place) => (
                      <React.Fragment key={place.place_id}>
                        <div
                          className='cursor-pointer transform transition duration-300 ease-in-out hover:scale-105'
                          onClick={() =>
                            router.push(`/detail/${place.place_id}`)
                          }
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
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Main;
