'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import supabase from '@/supabaseClient';
import { Session } from '@supabase/supabase-js';

import { CustomDetailCard } from '../../../components/common/CustomDetailCard';

import {
  Image,
  Card,
  CardBody,
  Textarea,
  Radio,
  RadioGroup,
  Button,
} from '@nextui-org/react';

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

interface Comment {
  title: string;
  contents: string;
  rating: string;
}

const Detail = () => {
  const [studyPlace, setStudyPlace] = useState<StudyPlace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [nickname, setNickname] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isScrapped, setIsScrapped] = useState(false);

  const [comment, setComment] = useState<Comment>({
    title: '',
    contents: '',
    rating: '',
  });

  const ratings = [
    '⭐️',
    '⭐️⭐️',
    '⭐️⭐️⭐️',
    '⭐️⭐️⭐️⭐️',
    '⭐️⭐️⭐️⭐️⭐️',
  ];

  const router = useRouter();

  const pathname = usePathname();
  console.log('pathname: ', pathname);

  useEffect(() => {
    const fetchStudyPlaceData = async () => {
      if (!pathname) return;

      // URL에서 place_id 추출
      const placeId = pathname.split('/')[2];
      console.log('placeId: ', placeId);

      try {
        setLoading(true);

        let { data, error } = await supabase
          .from('study_places')
          .select('*')
          .eq('place_id', placeId)
          .single();

        if (error) throw error;

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

  // 공부 장소의 스크랩 여부 확인
  const checkScrapStatus = async () => {
    if (session && studyPlace) {
      const { data, error } = await supabase
        .from('study_place_scraps')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('study_place_id', studyPlace.id)
        .single();

      setIsScrapped(!!data);
    }
  };

  // 스크랩 추가
  const addScrap = async () => {
    if (session && studyPlace && !isScrapped) {
      const { data, error } = await supabase
        .from('study_place_scraps')
        .insert([
          { user_id: session.user.id, study_place_id: studyPlace.place_id },
        ]);

      if (error) {
        console.error('스크랩 추가 실패', error);
      } else {
        setIsScrapped(true);
        console.log('스크랩 추가 성공', data);
      }
    }
  };

  // 스크랩 취소
  const removeScrap = async () => {
    if (session && studyPlace && isScrapped) {
      const { data, error } = await supabase
        .from('study_place_scraps')
        .delete()
        .match({
          user_id: session.user.id,
          study_place_id: studyPlace.place_id,
        });

      console.log('삭제 응답:', data, error);

      if (error) {
        console.error('스크랩 취소 실패', error);
      } else {
        setIsScrapped(false);
        console.log('스크랩 취소 성공', data);
      }
    }
  };

  // 상태가 변경될 때마다 스크랩 상태 확인
  useEffect(() => {
    checkScrapStatus();
  }, [session, studyPlace]);

  if (loading) return <p>Loading...</p>;
  if (!studyPlace) return <p>No study place found</p>;

  const handleRatingChange = (selectedRating: any) => {
    setComment((prevComment) => ({ ...prevComment, rating: selectedRating }));
  };

  const handleCommentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setComment((prevComment) => ({ ...prevComment, [name]: value }));
  };

  const isCommentValid = () => {
    return comment.title.trim() && comment.contents.trim() && comment.rating;
  };

  const saveComment = async () => {
    if (!isCommentValid()) {
      alert('평점과 댓글 제목과 내용을 모두 입력해 주세요.');
      return;
    }

    const { data, error } = await supabase.from('comments').insert([
      {
        study_place_id: studyPlace?.place_id,
        user_id: session?.user.id,
        rating: comment.rating,
        title: comment.title,
        contents: comment.contents,
        nickname, // nickname state에 저장된 값을 사용
      },
    ]);

    if (error) {
      alert('댓글을 저장하는 데 실패했습니다.');
      console.error('Error saving comment:', error);
    } else {
      console.log('Comment saved successfully:', data);
      // 댓글이 성공적으로 저장된 후에는 comment state를 초기화
      setComment({ title: '', contents: '', rating: '' });
    }
  };

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
          <div className='pb-4'>
            {/* <div className='ml-52 text-2xl font-bold text-gray-700 dark:text-gray-300'>
                {nickname
                  ? `${nickname}님이 목표와 꿈을 이루시도록 스플이 함께할게요!`
                  : '3초만에 로그인해서 다양한 서비스를 만나보세요!'}
              </div> */}
          </div>

          <section aria-labelledby='products-heading' className='pb-24 pt-6'>
            <div className='grid grid-rows-3 grid-flow-col gap-4'>
              {/* <form className='hidden lg:block'> */}
              <div className='row-span-3 space-y-6 pb-8 text-xl font-medium text-gray-900 dark:text-gray-200'>
                <React.Fragment>
                  <CustomDetailCard
                    place={studyPlace}
                    isScrapped={isScrapped}
                    onScrap={addScrap}
                    onUnscrap={removeScrap}
                  />
                </React.Fragment>
              </div>
              <div>
                <div className='text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-200'>
                  No comments
                </div>
                <Card>
                  <CardBody>
                    <p>
                      아쉽게도 아직 작성된 리뷰가 없네요! 가장 먼저 리뷰를
                      달아주세요 :)
                    </p>
                  </CardBody>
                </Card>
              </div>

              <div>
                <div className='text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-200'>
                  댓글 쓰기
                </div>
                <Card className='w-[480px] p-6'>
                  <div className='space-y-1 pt-2'>
                    <div className='text-xl font-bold mb-4'>
                      {studyPlace.place_name}에 대한 의견을 남겨주세요 :)
                    </div>

                    <RadioGroup
                      value={comment.rating}
                      onChange={(e) => {
                        const selectedRating = e.target.value;
                        handleRatingChange(selectedRating);
                      }}
                      label='별점 선택'
                      className='col-span-12 md:col-span-6 mb-6 md:mb-0 font-bold'
                    >
                      {ratings.map((rating, index) => (
                        <Radio key={index} value={rating}>
                          {rating}
                        </Radio>
                      ))}
                    </RadioGroup>

                    <Textarea
                      name='title'
                      key='faded'
                      variant='faded'
                      label='Title'
                      labelPlacement='outside'
                      value={comment.title}
                      onChange={handleCommentInputChange}
                      placeholder='Enter the title'
                      className='col-span-12 md:col-span-6 mb-6 md:mb-0 font-bold'
                    />

                    <Textarea
                      name='contents'
                      key='faded'
                      variant='faded'
                      label='Contents'
                      labelPlacement='outside'
                      value={comment.contents}
                      onChange={handleCommentInputChange}
                      placeholder='Enter the contents'
                      className='col-span-12 md:col-span-6 mb-6 md:mb-0 font-bold'
                    />
                    <Button
                      color='primary'
                      variant='shadow'
                      onPress={saveComment}
                    >
                      작성하기
                    </Button>
                  </div>
                </Card>
              </div>

              <div>
                <div className='text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-200'>
                  작성된 리뷰
                </div>
                <Card className='w-[480px] p-6'>
                  <div className='space-y-1 pt-2'>
                    <div className='text-xl font-bold mb-4'>작성된 댓글</div>
                    <Textarea
                      isReadOnly
                      label='Description'
                      variant='bordered'
                      labelPlacement='outside'
                      placeholder='Enter your description'
                      defaultValue='NextUI is a React UI library that provides a set of accessible, reusable, and beautiful components.'
                      className='max-w-xs'
                    />
                  </div>
                </Card>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Detail;
