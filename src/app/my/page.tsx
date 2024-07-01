'use client';

import { Session } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import supabase from '../../supabaseClient';

import { useRouter } from 'next/navigation';
import { CustomMainCard } from '../../components/common/CustomMainCard';

import { toast } from 'react-toastify';

import {
  Avatar,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Link,
  Select,
  SelectItem,
  Spacer,
} from '@nextui-org/react';

interface UserProfile {
  user_uid: string;
  nickname: string;
  email: string;
  user_type: string;
  created_at: string;
  user_profile_image: string;
}

interface StudyPlace {
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

interface Comment {
  comment_id: string;
  study_place_id: string;
  user_id: string;
  rating: string;
  title: string;
  contents: string;
  created_at: string;
  nickname: string;
  user_profile_image: string;
  study_place?: StudyPlace;
}

const My: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('profile');
  const [session, setSession] = useState<Session | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [updatedNickname, setUpdatedNickname] = useState<string>('');
  const [updatedEmail, setUpdatedEmail] = useState<string>('');
  const [updatedUserType, setUpdatedUserType] = useState<string>('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<string>('');

  const [scrappedPlaces, setScrappedPlaces] = useState<StudyPlace[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);

  const router = useRouter();
  const userTypes = ['중고등학생', '수험생', '대학(원)생', '고시생', '직장인'];

  useEffect(() => {
    const getUserSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(data.session);
        console.log('로그인 데이터: ', data);
      } catch (error) {
        toast.error('Session 처리에 오류가 발생했습니다.');
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

      if (error) {
        toast.error('프로필 정보를 불러오는 데 실패했습니다.');
        return;
      }

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
    if (!session?.user) return;

    if (updatedNickname.length < 1 || updatedNickname.length > 15) {
      toast.error('닉네임을 1자 이상 15자 이내로 작성해주세요.');
      return;
    }

    const user_id = session.user.id;
    const { error } = await supabase
      .from('user_profiles')
      .update({
        nickname: updatedNickname,
        email: updatedEmail,
        user_type: updatedUserType,
        user_profile_image: profileImage,
      })
      .eq('user_uid', user_id);

    if (error) {
      console.error('프로필 업데이트에 실패했습니다: ', error);
    } else {
      const { error: commentsError } = await supabase
        .from('comments')
        .update({
          nickname: updatedNickname,
          user_profile_image: profileImage,
        })
        .eq('user_id', user_id);

      if (commentsError) {
        console.error('댓글 정보 업데이트에 실패했습니다: ', commentsError);
      } else {
        setUserComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment.user_id === user_id) {
              return {
                ...comment,
                nickname: updatedNickname,
                user_profile_image: profileImage,
              };
            }
            return comment;
          })
        );
        toast.success('프로필이 성공적으로 업데이트되었습니다!');
        fetchUserProfile(user_id);
      }
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
      console.error('이미지 업로드에 실패했습니다: ', error);
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

  const fetchScrappedPlaces = async () => {
    if (!session?.user?.id) return;

    const { data: scrappedData, error: scrappedError } = await supabase
      .from('study_place_scraps')
      .select('study_place_id')
      .eq('user_id', session.user.id);

    if (scrappedError) {
      console.error('스크랩을 가져오는 중 오류 발생: ', scrappedError);
      return;
    }

    const scrappedPlaceIds = scrappedData?.map((scrap) => scrap.study_place_id);

    if (scrappedPlaceIds?.length) {
      const { data: placesData, error: placesError } = await supabase
        .from('study_places')
        .select('*')
        .in('place_id', scrappedPlaceIds);

      if (placesError) {
        console.error('장소를 가져오는 중 오류 발생: ', placesError);
        return;
      }

      setScrappedPlaces(placesData || []);
    }
  };

  useEffect(() => {
    fetchScrappedPlaces();
    // 의존성 배열 없어도 될 것 같기도 함
  }, [session?.user?.id]);

  const fetchUserComments = async () => {
    if (!session?.user?.id) return;

    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select(
        `
        comment_id,
        study_place_id,
        rating,
        contents,
        created_at,
        nickname,
        user_profile_image,
        study_place:study_places(place_id, place_name)
      `
      )
      .eq('user_id', session.user.id);

    if (commentsError) {
      console.error('댓글을 가져오는 중 오류 발생: ', commentsError);
      return;
    }

    if (Array.isArray(commentsData)) {
      const typedComments: Comment[] = commentsData.map((comment: any) => {
        return {
          ...comment,
          study_place: comment.study_place,
        };
      });
      setUserComments(typedComments);
    }
  };

  useEffect(() => {
    if (selectedCategory === 'comments') {
      fetchUserComments();
    }
  }, [session?.user?.id, selectedCategory]);

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    let month = date.getMonth() + 1; // getMonth()는 0부터 시작하기 때문에 +1
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // 한 자리 수일 경우 앞에 0을 붙여서 두 자리 수로 만듦
    const formattedMonth = month < 10 ? `0${month}` : month.toString();
    const formattedDay = day < 10 ? `0${day}` : day.toString();
    const formattedHours = hours < 10 ? `0${hours}` : hours.toString();
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();

    return `${year}-${formattedMonth}-${formattedDay} ${formattedHours}:${formattedMinutes}`;
  };

  const handleCategorySelection = (category: string) => {
    setSelectedCategory(category);
    const url = new URL(window.location.href);
    url.searchParams.set('category', category);
    window.history.pushState({}, '', `?category=${category}`);
  };

  useEffect(() => {
    const loadCategoryFromURL = () => {
      const url = new URL(window.location.href);
      const category = url.searchParams.get('category') || 'profile';
      setSelectedCategory(category);
    };

    // 페이지 로딩 시 URL에서 카테고리 정보를 읽어 상태 업데이트
    loadCategoryFromURL();

    // URL 변경 감지
    const handlePopState = () => {
      loadCategoryFromURL();
    };

    window.addEventListener('popstate', handlePopState);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div>
      <main className='mx-20 lg:px-8'>
        <div className='flex items-baseline justify-start pb-2 pt-6'>
          <h1 className='text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-200'>
            Categories
          </h1>
          <div className='pb-4'>
            <div className='ml-72 text-2xl font-bold text-gray-700 dark:text-gray-300'>
              {selectedCategory === 'profile' &&
                `${userProfile?.nickname}님의 프로필 정보`}
              {selectedCategory === 'scrapped' &&
                `${userProfile?.nickname}님이 스크랩한 장소`}
              {selectedCategory === 'comments' &&
                `${userProfile?.nickname}님이 작성한 댓글`}
            </div>
          </div>
        </div>
        {selectedCategory === 'profile' && (
          <div aria-labelledby='products-heading' className='pb-24 pt-6'>
            <div className='grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4'>
              <div className='lg:col-span-1 mt-2 space-y-6 pb-8 text-xl font-medium text-gray-900 dark:text-gray-200'>
                <div>
                  <button onClick={() => handleCategorySelection('profile')}>
                    내 프로필 정보
                  </button>
                </div>
                <div>
                  <button
                    className='font-medium text-gray-400 dark:text-gray-500'
                    onClick={() => handleCategorySelection('scrapped')}
                  >
                    내가 스크랩한 장소
                  </button>
                </div>
                <div>
                  <button
                    className='font-medium text-gray-400 dark:text-gray-500'
                    onClick={() => handleCategorySelection('comments')}
                  >
                    내가 작성한 댓글
                  </button>
                </div>
              </div>

              <div className='lg:col-span-1'>
                <div className='w-full overflow-hidden mb-8'>
                  <div className='pb-4'></div>

                  <div
                    className='rounded-lg bg-cover bg-center bg-no-repeat w-[300px] h-[300px] p-4'
                    style={{
                      backgroundImage: `url(${profileImage})`,
                    }}
                  ></div>
                </div>
                <input
                  className='mt-1 block w-[300px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                  name='user_profile_image'
                  type='file'
                  onChange={handleImageChange}
                />
              </div>

              <div className='lg:col-span-2'>
                <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4 flex flex-wrap text-end'>
                  <label className='text-2xl font-bold ml-3 mt-3 mr-8'>
                    닉네임
                  </label>
                  <input
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                    name='nickname'
                    minLength={1}
                    maxLength={15}
                    placeholder='닉네임 1자 이상 15자 이내'
                    value={updatedNickname}
                    onChange={(e) => setUpdatedNickname(e.target.value)}
                  />
                  <label className='text-2xl font-bold ml-3 mt-3 mr-8'>
                    이메일
                  </label>
                  <input
                    disabled
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                    name='email'
                    value={updatedEmail}
                    onChange={(e) => setUpdatedEmail(e.target.value)}
                  />
                  <label className='text-2xl font-bold ml-3 mt-4 mr-8'>
                    유형
                  </label>
                  <Select
                    isRequired
                    className='mt-1 block w-full rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                    label='유형'
                    placeholder={updatedUserType}
                    value={updatedUserType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setUpdatedUserType(e.target.value);
                    }}
                  >
                    {userTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </Select>
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
          </div>
        )}

        {selectedCategory === 'scrapped' && (
          <div aria-labelledby='products-heading' className='pb-24 pt-6'>
            <div className='grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4'>
              <div className='lg:col-span-1 mt-2 space-y-6 pb-8 text-xl font-medium text-gray-900 dark:text-gray-200'>
                <div>
                  <button
                    className='font-medium text-gray-400 dark:text-gray-500'
                    onClick={() => handleCategorySelection('profile')}
                  >
                    내 프로필 정보
                  </button>
                </div>
                <div>
                  <button onClick={() => handleCategorySelection('scrapped')}>
                    내가 스크랩한 장소
                  </button>
                </div>
                <div>
                  <button
                    className='font-medium text-gray-400 dark:text-gray-500'
                    onClick={() => handleCategorySelection('comments')}
                  >
                    내가 작성한 댓글
                  </button>
                </div>
              </div>

              <div className='lg:col-span-3'>
                {scrappedPlaces.length === 0 ? (
                  <Card className='flex justify-center items-center h-full w-full max-w-[430px]'>
                    <div className='flex flex-col justify-center items-center py-10 space-y-1 py-2 mx-2'>
                      <div>
                        <p className='text-xl font-bold'>
                          스크랩하신 장소가 없습니다.
                        </p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <div className='flex flex-wrap'>
                    {scrappedPlaces.map((place) => (
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
                )}
              </div>
            </div>
          </div>
        )}

        {selectedCategory === 'comments' && (
          <div aria-labelledby='products-heading' className='pb-24 pt-6'>
            <div className='grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4'>
              <div className='lg:col-span-1 mt-2 space-y-6 pb-8 text-xl font-medium text-gray-900 dark:text-gray-200'>
                <div>
                  <button
                    className='font-medium text-gray-400 dark:text-gray-500'
                    onClick={() => handleCategorySelection('profile')}
                  >
                    내 프로필 정보
                  </button>
                </div>
                <div>
                  <button
                    className='font-medium text-gray-400 dark:text-gray-500'
                    onClick={() => handleCategorySelection('scrapped')}
                  >
                    내가 스크랩한 장소
                  </button>
                </div>
                <div>
                  <button onClick={() => handleCategorySelection('comments')}>
                    내가 작성한 댓글
                  </button>
                </div>
              </div>

              {userComments.length === 0 ? (
                <Card className='flex justify-center items-center h-full w-full max-w-[430px]'>
                  <div className='flex flex-col justify-center items-center py-10 space-y-1 py-2 mx-2'>
                    <div>
                      <p className='text-xl font-bold'>
                        작성하신 댓글이 없습니다.
                      </p>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className='lg:col-span-3'>
                  <Card className='w-full p-6 pb-8'>
                    <div className='space-y-1 py-2 mx-2'>
                      <div className='flex flex-wrap gap-4'>
                        {userComments.map((comment) => (
                          // <Link
                          //   key={comment.comment_id}
                          //   href={`/detail/${comment.study_place?.place_id}`}
                          // >
                          <Card
                            className='w-full max-w-[330px]'
                            key={comment.comment_id}
                            onClick={() => {
                              router.push(
                                `/detail/${comment.study_place?.place_id}`
                              );
                            }}
                          >
                            <CardHeader className='justify-between'>
                              <div className='flex gap-5'>
                                <Avatar
                                  isBordered
                                  radius='full'
                                  size='md'
                                  src={comment.user_profile_image}
                                />
                                <div className='flex flex-col gap-1 items-start justify-center'>
                                  <h4 className='text-small font-semibold leading-none text-default-600'>
                                    {comment.nickname}
                                  </h4>
                                  <h5 className='text-small tracking-tight text-default-400'>
                                    {comment.rating}
                                  </h5>
                                </div>
                              </div>
                            </CardHeader>

                            <CardBody className='px-3 py-2'>
                              <p className='mx-2 text-ml font-bold'>
                                {comment.title}
                              </p>
                              <span className='mx-2 pt-2'>
                                {comment.contents}
                              </span>
                            </CardBody>
                            <CardFooter className='flex flex-col'>
                              <Link
                                key={comment.comment_id}
                                href={`/detail/${comment.study_place?.place_id}`}
                              >
                                <p className='text-default-500 text-sm'>
                                  {comment.study_place?.place_name}
                                </p>
                              </Link>

                              <p className='text-default-400 text-sm'>
                                {formatDateTime(comment.created_at)}
                              </p>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default My;
