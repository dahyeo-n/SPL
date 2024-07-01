'use client';

import React, { useCallback, useEffect, useState } from 'react';
import supabase from '@/supabaseClient';
import { Session } from '@supabase/supabase-js';

import Header from '@/components/common/Header';
import { CustomMainCard } from '../components/common/CustomMainCard';
import SkeletonCard from '../components/common/SkeletonCard';

import { useRouter } from 'next/navigation';

import { Spacer, Card, Skeleton } from '@nextui-org/react';
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
      setLoading(true);

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (!data.session) {
          setLoading(false);
          return;
        }

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

        // 세션 정보가 있는 경우 프로필 정보도 조회
        await fetchUserProfile(data.session.user.email!);
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
    if (!session?.user) {
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
    } finally {
      setLoading(false);
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
    fetchStudyPlaces(selectedState.category, selectedState.placeType);
  }, [selectedState.category, selectedState.placeType]);

  const fetchStudyPlaces = useCallback(
    async (category: string, placeType: string) => {
      setLoading(true);

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

  // 윈도우의 popstate 이벤트 리스너를 설정하여 URL 변경을 감지
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

  const renderSkeletonCards = (count: number) => {
    return Array.from({ length: count }, (_, index) => (
      <SkeletonCard key={index} />
    ));
  };

  useEffect(() => {
    // 로그인 상태 변경 감지
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth event: ${event}`);
      setSession(session); // 세션 상태 업데이트

      if (session?.user) {
        fetchUserProfile(session.user.email!); // 세션이 있는 경우 사용자 프로필 가져오기
        setLoading(false);
      } else {
        setNickname(null); // 세션이 없으면 닉네임을 null로 설정하여 로그인하지 않은 상태 표시
        setLoading(false);
      }
    });
  }, []);

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
                      className={`relative overflow-hidden before:absolute before:inset-x-0 before:bottom-0 before:h-[2px] before:bg-crimson before:scale-x-0 hover:before:scale-x-100 before:transition-transform ${
                        selectedState.category === '' &&
                        selectedState.placeType === ''
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      } hover:text-gray-900 hover:dark:text-gray-200 transform transition-transform duration-300 hover:translate-x-1`}
                    >
                      전체
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handlePlaceTypeSelection('스터디룸')}
                      className={`relative overflow-hidden before:absolute before:inset-x-0 before:bottom-0 before:h-[2px] before:bg-crimson before:scale-x-0 hover:before:scale-x-100 before:transition-transform ${
                        selectedState.placeType === '스터디룸'
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      } hover:text-gray-900 hover:dark:text-gray-200 transform transition-transform duration-300 hover:translate-x-1`}
                    >
                      스터디룸
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handlePlaceTypeSelection('스터디카페')}
                      className={`relative overflow-hidden before:absolute before:inset-x-0 before:bottom-0 before:h-[2px] before:bg-crimson before:scale-x-0 hover:before:scale-x-100 before:transition-transform ${
                        selectedState.placeType === '스터디카페'
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      } hover:text-gray-900 hover:dark:text-gray-200 transform transition-transform duration-300 hover:translate-x-1`}
                    >
                      스터디카페
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handlePlaceTypeSelection('일반카페')}
                      className={`relative overflow-hidden before:absolute before:inset-x-0 before:bottom-0 before:h-[2px] before:bg-crimson before:scale-x-0 hover:before:scale-x-100 before:transition-transform ${
                        selectedState.placeType === '일반카페'
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      } hover:text-gray-900 hover:dark:text-gray-200 transform transition-transform duration-300 hover:translate-x-1`}
                    >
                      일반카페
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handlePlaceTypeSelection('북카페')}
                      className={`relative overflow-hidden before:absolute before:inset-x-0 before:bottom-0 before:h-[2px] before:bg-crimson before:scale-x-0 hover:before:scale-x-100 before:transition-transform ${
                        selectedState.placeType === '북카페'
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      } hover:text-gray-900 hover:dark:text-gray-200 transform transition-transform duration-300 hover:translate-x-1`}
                    >
                      북카페
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handleCategorySelection('노트북 이용')}
                      className={`relative overflow-hidden before:absolute before:inset-x-0 before:bottom-0 before:h-[2px] before:bg-crimson before:scale-x-0 hover:before:scale-x-100 before:transition-transform ${
                        selectedState.category === '노트북 이용'
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      } hover:text-gray-900 hover:dark:text-gray-200 transform transition-transform duration-300 hover:translate-x-1`}
                    >
                      노트북 이용
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handleCategorySelection('조용하고 한적한')}
                      className={`relative overflow-hidden before:absolute before:inset-x-0 before:bottom-0 before:h-[2px] before:bg-crimson before:scale-x-0 hover:before:scale-x-100 before:transition-transform ${
                        selectedState.category === '조용하고 한적한'
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      } hover:text-gray-900 hover:dark:text-gray-200 transform transition-transform duration-300 hover:translate-x-1`}
                    >
                      조용하고 한적한
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handleCategorySelection('세련되고 깔끔한')}
                      className={`relative overflow-hidden before:absolute before:inset-x-0 before:bottom-0 before:h-[2px] before:bg-crimson before:scale-x-0 hover:before:scale-x-100 before:transition-transform ${
                        selectedState.category === '세련되고 깔끔한'
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      } hover:text-gray-900 hover:dark:text-gray-200 transform transition-transform duration-300 hover:translate-x-1`}
                    >
                      세련되고 깔끔한
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      onClick={() => handleCategorySelection('뷰 맛집')}
                      className={`relative overflow-hidden before:absolute before:inset-x-0 before:bottom-0 before:h-[2px] before:bg-crimson before:scale-x-0 hover:before:scale-x-100 before:transition-transform ${
                        selectedState.category === '뷰 맛집'
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      } hover:text-gray-900 hover:dark:text-gray-200 transform transition-transform duration-300 hover:translate-x-1`}
                    >
                      뷰 맛집
                    </button>
                  </div>
                </div>
              </form>

              {loading ? (
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
