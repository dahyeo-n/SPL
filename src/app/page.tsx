'use client';

import React, { useCallback, useEffect, useState } from 'react';
import supabase from '@/supabaseClient';
import { Session } from '@supabase/supabase-js';

import Header from '@/components/common/Header';
import { CustomMainCard } from '../components/common/CustomMainCard';

import { useRouter } from 'next/navigation';

import { Spacer } from '@nextui-org/react';
import { ToastContainer, toast } from 'react-toastify';
import Link from 'next/link';

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
  const [session, setSession] = useState<Session | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedState, setSelectedState] = useState({
    category: '',
    placeType: '',
  });

  const router = useRouter();

  useEffect(() => {
    const getUserSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data?.session?.user) {
          const provider = data.session.user.app_metadata.provider;

          const isSocialLogin =
            provider === 'kakao' ||
            provider === 'google' ||
            provider === 'github';

          if (isSocialLogin) {
            saveOrUpdateUserProfile(data?.session?.user, provider);
          }
        }

        setSession(data.session);
        console.log('로그인 데이터: ', data);
      } catch (error) {
        toast.error('Session 처리에 오류가 발생했습니다.');
        console.log(error);
      }
    };

    getUserSession();
  }, [router]);

  const saveOrUpdateUserProfile = async (user: any, provider: string) => {
    const { data: existingProfiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('nickname, user_profile_image')
      .eq('email', user.email)
      .maybeSingle();

    if (profileError) {
      console.error('프로필 조회 에러: ', profileError);
      return;
    }

    let nickname = user.user_metadata?.name || user.email.split('@')[0];
    let profileImageUrl =
      existingProfiles?.user_profile_image || '/images/default-profile.jpg';

    if (existingProfiles) return;

    if (!existingProfiles) {
      const { data: existingNicknames } = await supabase
        .from('user_profiles')
        .select('nickname')
        .eq('nickname', nickname);

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

  useEffect(() => {
    if (session?.user && typeof session.user.email === 'string') {
      fetchUserProfile(session.user.email);
    }
  }, [session?.user]);

  const fetchUserProfile = async (email: string) => {
    if (!session?.user || typeof session.user.email !== 'string') {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('nickname')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setNickname(data.nickname);
      }
    } catch (error) {
      console.error('사용자 프로필을 불러오는 데 실패했습니다: ', error);
    }
  };

  const handleCategorySelection = (category: string) => {
    if (category !== selectedState.category) {
      window.history.pushState({}, '', `?category=${category}`);
      // await fetchStudyPlaces(category, selectedState.placeType);
      setSelectedState({ category, placeType: '' });
    }
  };

  const handlePlaceTypeSelection = (placeType: string) => {
    if (placeType !== selectedState.placeType) {
      window.history.pushState({}, '', `?placeType=${placeType}`);
      // await fetchStudyPlaces(selectedState.category, placeType);
      setSelectedState({ category: '', placeType });
    }
  };

  useEffect(() => {
    fetchStudyPlaces(selectedState.category, selectedState.placeType);
  }, [selectedState.category, selectedState.placeType]);

  const fetchStudyPlaces = useCallback(
    async (category: string, placeType: string) => {
      setLoading(true);

      let query = supabase
        .from('study_places')
        .select('*')
        // .select('id, name, category, place_type, rating') // 필요한 필드만 선택
        .order('rating', { ascending: false });

      if (category) {
        query = query.ilike('category', `%${category}%`);
      }

      if (placeType) {
        query = query.ilike('place_type', `%${placeType}%`);
      }

      try {
        const { data, error } = await query;
        if (error) throw error;
        setStudyPlaces(data || []); // 데이터 설정
      } catch (error) {
        console.error('데이터 조회 실패: ', error);
        toast.error('데이터를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false); // 데이터 로딩 완료
      }
    },
    []
  );

  // 현재 페이지의 URL 저장
  // const [currentUrl, setCurrentUrl] = useState(window.location.href);

  // 윈도우의 popstate 이벤트 리스너를 설정하여 URL 변경을 감지
  useEffect(() => {
    const loadFromURL = () => {
      // const url = new URL(currentUrl);
      // const category = url.searchParams.get('category') || '';
      // const placeType = url.searchParams.get('placeType') || '';

      // // 파싱한 쿼리 스트링으로 데이터 로딩 함수 호출
      // fetchStudyPlaces(category, placeType);
      const params = new URLSearchParams(window.location.search);
      const category = params.get('category') || '';
      const placeType = params.get('placeType') || '';

      if (
        category !== selectedState.category ||
        placeType !== selectedState.placeType
      ) {
        setSelectedState({ category, placeType });
        fetchStudyPlaces(category, placeType);
      }
    };

    window.addEventListener('popstate', loadFromURL);

    // 초기 로딩 및 URL 변경 감지
    loadFromURL();

    return () => {
      window.removeEventListener('popstate', loadFromURL);
    };
  }, [selectedState.category, selectedState.placeType]);

  //   const handlePopState = () => {
  //     setCurrentUrl(window.location.href);
  //   };

  //   window.addEventListener('popstate', handlePopState);

  //   // 컴포넌트 언마운트 시 이벤트 리스너 제거
  //   return () => {
  //     window.removeEventListener('popstate', handlePopState);
  //   };
  // }, [currentUrl, fetchStudyPlaces]);

  // useEffect(() => {
  //   // URL에서 쿼리 스트링 파라미터 파싱
  //   const params = new URLSearchParams(window.location.search);
  //   const urlCategory = params.get('category') || '';
  //   const urlPlaceType = params.get('placeType') || '';

  //   // URL 상태가 변경되었는지 확인 후 상태 업데이트
  //   if (
  //     urlCategory !== selectedState.category ||
  //     urlPlaceType !== selectedState.placeType
  //   ) {
  //     setSelectedState({ category: urlCategory, placeType: urlPlaceType });
  //     fetchStudyPlaces(urlCategory, urlPlaceType);
  //   }
  // }, [currentUrl, fetchStudyPlaces]);

  // 버튼을 누른다. 변경된 카테고리에 따라서 fetchStudyPlaces를 호출한다.
  // url을 공유받았을때 똑같이 스터디룸으로 표현된 데이터를 보여주자.
  // 버튼을 눌렀을때도 url이 변경된다. url이 변경되었으니깐 fetchStudyPlaces도 url 변경 여부에 따라서 호출이 된다.

  // useEffect(() => {
  //   if (currentUrl.includes('?')) {
  //     const url = currentUrl.split('?')[1].split('=');

  //     const placeType =
  //       url[0] === 'placeType' ? decodeURIComponent(url[1]) : '';
  //     const category = url[0] === 'category' ? decodeURIComponent(url[1]) : '';

  //     console.log(placeType, category);

  //     fetchStudyPlaces(placeType, category);
  //   } else {
  //     fetchStudyPlaces(selectedCategory, selectedCategory);
  //   }

  //   console.log(selectedCategory, selectedPlaceType);
  //   fetchStudyPlaces(selectedCategory, selectedPlaceType);
  // }, [selectedCategory, selectedPlaceType, currentUrl]);

  return (
    <>
      <Header />
      <ToastContainer />
      <div>
        <main className='mx-20 lg:px-8'>
          <div className='flex items-baseline justify-start pb-2 pt-6'>
            <h1 className='text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-200'>
              Categories
            </h1>
            <div className='pb-4'>
              <div className='ml-48 text-2xl font-bold text-gray-700 dark:text-gray-300'>
                {nickname ? (
                  `${nickname}님이 목표와 꿈을 이루시도록 스플이 함께할게요!`
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
          </div>

          <section aria-labelledby='products-heading' className='pb-24 pt-6'>
            <div className='grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4'>
              <form className='hidden lg:block'>
                <h3 className='sr-only'>Categories</h3>
                <div className='space-y-6 pb-8 text-xl font-medium text-gray-900 dark:text-gray-200'>
                  {/* 필터 처리 로직 완성되면 map으로 돌릴 거임 */}
                  {/* <div><button>추천</button></div> */}
                  <div>
                    <button
                      type='button'
                      onClick={() => {
                        window.history.pushState({}, '', '/');
                        setSelectedState({
                          category: '',
                          placeType: '',
                        });
                        fetchStudyPlaces('', '');
                      }}
                      className={`${
                        selectedState.category === '' &&
                        selectedState.placeType === ''
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      전체
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handlePlaceTypeSelection('스터디룸')}
                      className={`${
                        selectedState.placeType === '스터디룸'
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      스터디룸
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handlePlaceTypeSelection('스터디카페')}
                      className={`${
                        selectedState.placeType === '스터디카페'
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      스터디카페
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handlePlaceTypeSelection('일반카페')}
                      className={`${
                        selectedState.placeType === '일반카페'
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      일반카페
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handlePlaceTypeSelection('북카페')}
                      className={`${
                        selectedState.placeType === '북카페'
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      북카페
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handleCategorySelection('노트북 이용')}
                      className={`${
                        selectedState.category === '노트북 이용'
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      노트북 이용
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handleCategorySelection('조용하고 한적한')}
                      className={`${
                        selectedState.category === '조용하고 한적한'
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      조용하고 한적한
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handleCategorySelection('세련되고 깔끔한')}
                      className={`${
                        selectedState.category === '세련되고 깔끔한'
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      세련되고 깔끔한
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handleCategorySelection('뷰 맛집')}
                      className={`${
                        selectedState.category === '뷰 맛집'
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      뷰 맛집
                    </button>
                  </div>
                </div>
              </form>

              {loading ? (
                <div>Loading...</div>
              ) : (
                <div className='lg:col-span-3'>
                  <div className='flex flex-wrap'>
                    {studyPlaces.map((place) => (
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
