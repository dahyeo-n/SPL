'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import supabase from '.././../../supabaseClient';
import { Session } from '@supabase/supabase-js';
import { CustomDetailCard } from '../../../components/common/CustomDetailCard';
import Map from '../../../components/Map';

import mediumZoom from 'medium-zoom';
import { useTheme } from 'next-themes';
import { toast } from 'react-toastify';

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Avatar,
  Textarea,
  Radio,
  RadioGroup,
  Button,
} from '@nextui-org/react';

interface Comment {
  contents: string;
  rating: string;
}

interface Comments {
  comment_id: string;
  study_place_id: string;
  user_id: string;
  rating: string;
  contents: string;
  created_at: string;
  nickname: string;
  user_profile_image: string;
}

interface CommentsArray {
  [key: string]: HTMLDivElement | null;
}

const Detail = () => {
  const [nickname, setNickname] = useState<string | null>(null);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const [isScrapped, setIsScrapped] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null
  );

  const { theme } = useTheme();
  const imageRef = useRef<HTMLImageElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const commentFormRef = useRef<HTMLDivElement>(null);
  const editedCommentRefs = useRef<CommentsArray>({});

  const queryClient = useQueryClient();

  // ellipsis 토글 상태 관리
  const handleEllipsisToggle = (commentId: string) => {
    if (isOpen && selectedCommentId === commentId) {
      setIsOpen(false);
      setSelectedCommentId(null);
    } else {
      setIsOpen(true);
      setSelectedCommentId(commentId);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toggleRef.current &&
        !toggleRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false); // Ref의 바깥쪽을 클릭했을 때 토글 상태를 false로
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // 컴포넌트가 언마운트되면 이벤트 리스너 제거
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleImageLoad = () => {
    const isDarkMode = theme === 'dark';

    if (imageRef.current) {
      const zoom = mediumZoom(imageRef.current, {
        background: isDarkMode ? '#000' : '#fff',
        margin: 0,
        // scrollOffset: 0, // 스크롤 불가능한 오프셋 값을 0으로 설정
        // container: null, // 원본 크기로 보이기 위해 컨테이너 미지정
        // template: null, // 템플릿 미지정
      });

      // 확대된 이미지를 클릭하면 닫히도록 이벤트 리스너를 추가
      zoom.on('open', (event) => {
        zoom.getZoomedImage().addEventListener('click', zoom.close);
      });

      return () => zoom.detach();
    }
  };

  const [comment, setComment] = useState<Comment>({
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

  // 공부 장소 데이터 fetching
  const { data: studyPlace, isLoading: studyPlaceLoading } = useQuery({
    queryKey: ['studyPlace', pathname],
    queryFn: async () => {
      const placeId = pathname.split('/')[2];

      const { data, error } = await supabase
        .from('study_places')
        .select('*')
        .eq('place_id', placeId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // 댓글 데이터 fetching
  // comments가 undefined일 경우, 빈 배열을 기본값으로 설정
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', pathname],
    queryFn: async () => {
      const placeId = pathname.split('/')[2];

      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('study_place_id', placeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // 사용자 세션 데이터 fetching
  const { data: sessionData } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;
      return data.session;
    },
  });

  // 사용자 프로필 데이터 fetching
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', sessionData?.user?.email],
    queryFn: async () => {
      if (sessionData?.user?.email) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('nickname, user_profile_image')
          .eq('email', sessionData.user.email)
          .single();

        if (error) throw error;
        return data;
      }
    },
    enabled: !!sessionData?.user?.email, // 이메일이 존재할 때만 쿼리 실행
  });

  useEffect(() => {
    if (userProfile) {
      setNickname(userProfile.nickname);
      setUserProfileImage(userProfile.user_profile_image);
    }
  }, [userProfile]);

  useEffect(() => {
    if (sessionData) {
      setSession(sessionData);
    }
  }, [sessionData]);

  const checkLoginAndRedirect = () => {
    if (!session) {
      setTimeout(() => {
        toast.info('로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.');
      }, 500);
      router.push('/sign/signin');
      return false;
    }
    return true;
  };

  // 공부 장소의 스크랩 여부 확인
  const checkScrapStatus = async () => {
    if (!session) {
      setIsScrapped(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('study_place_scraps')
        .select('study_place_id')
        .eq('user_id', session.user.id)
        .eq('study_place_id', studyPlace?.place_id)
        .limit(1);

      if (error) {
        console.error('스크랩 상태 조회 실패: ', error.message);
        return;
      }

      setIsScrapped(data.length > 0); // data 배열의 길이를 확인하여 스크랩 상태 결정
    } catch (err) {
      console.error('스크랩 상태 확인 중 오류 발생: ', err);
    }
  };

  // 스크랩 추가
  // useMutation을 사용하여 스크랩 추가 및 취소 작업을 처리하고,
  // 성공 시 queryClient.invalidateQueries를 호출하여 관련 쿼리를 무효화
  const addScrap = async () => {
    if (!checkLoginAndRedirect()) return;

    if (session && studyPlace && !isScrapped) {
      try {
        // 유저가 해당 공부 장소를 전에도 스크랩했는지 확인
        const { data: existingScrap } = await supabase
          .from('study_place_scraps')
          .select('study_place_id')
          .eq('user_id', session.user.id)
          .eq('study_place_id', studyPlace.place_id)
          .maybeSingle();

        if (existingScrap) {
          return;
        }

        const { error } = await supabase
          .from('study_place_scraps')
          .insert([
            { user_id: session.user.id, study_place_id: studyPlace.place_id },
          ]);

        if (error) {
          toast.error('스크랩 추가 실패');
        } else {
          setIsScrapped(true);
          localStorage.setItem('isScrapped', 'true');
          toast.success('스크랩되었습니다.');
        }
      } catch (error) {
        toast.error('스크랩 추가 중 오류 발생');
      }
    }
  };

  // 스크랩 취소
  const removeScrap = async () => {
    if (!checkLoginAndRedirect()) return;

    if (session && studyPlace && isScrapped) {
      const { data, error } = await supabase
        .from('study_place_scraps')
        .delete()
        .match({
          user_id: session.user.id,
          study_place_id: studyPlace.place_id,
        });

      console.error('삭제 응답: ', data, error);

      if (error) {
        toast.error('스크랩 취소 실패');
      } else {
        setIsScrapped(false);
        localStorage.setItem('isScrapped', 'false');
        toast.success('스크랩 취소되었습니다.');
      }
    }
  };

  // 상태가 변경될 때마다 스크랩 상태 확인
  useEffect(() => {
    const isScrappedFromStorage = localStorage.getItem('isScrapped');
    setIsScrapped(isScrappedFromStorage === 'true');

    if (studyPlace) {
      checkScrapStatus();
    }
  }, [session, studyPlace]);

  if (studyPlaceLoading || commentsLoading) return <p>Loading...</p>;
  if (!studyPlace) return <p>No study place found</p>;

  const handleRatingChange = (selectedRating: any) => {
    setComment((prevComment) => ({ ...prevComment, rating: selectedRating }));
  };

  const handleCommentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setComment((prevComment) => ({ ...prevComment, [name]: value }));
  };

  const isCommentValid = () => {
    return comment.contents.trim() && comment.rating;
  };

  // 댓글 폼과 수정된 댓글로 스크롤하는 함수
  const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const scrollToComment = (commentId: string) => {
    const targetRef = editedCommentRefs.current[commentId];
    if (targetRef) {
      const refObject: React.RefObject<HTMLDivElement> = {
        current: targetRef,
      };
      scrollToRef(refObject);
    }
  };

  const saveComment = async () => {
    if (!checkLoginAndRedirect()) return;

    if (!isCommentValid()) {
      toast.error('평점과 댓글 제목과 내용을 모두 입력해주세요.');
      return;
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          study_place_id: studyPlace.place_id,
          user_id: session?.user.id,
          rating: comment.rating,
          contents: comment.contents,
          nickname,
          user_profile_image: userProfileImage,
        },
      ])
      .select();

    if (error) {
      toast.error('댓글을 저장하는 데 실패했습니다.');
      console.error('댓글 저장 에러: ', error);
      return;
    }

    if (data) {
      queryClient.invalidateQueries({ queryKey: ['comments', pathname] });
      setComment({ contents: '', rating: '' });
      toast.success('댓글이 저장되었습니다.');
      router.refresh();
      setTimeout(() => {
        scrollToComment(data[0].comment_id); // 작성된 댓글로 스크롤
      }, 500);
    }
  };

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

  const handleEditButtonClick = (comment: Comments) => {
    setIsEditing(true);
    setEditingCommentId(comment.comment_id);
    setComment({
      contents: comment.contents,
      rating: comment.rating,
    });
    scrollToRef(commentFormRef);
  };

  const handleUpdateComment = async () => {
    if (!isCommentValid() || !editingCommentId) {
      toast.error('모든 입력란을 올바르게 입력해주세요.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .update({
          contents: comment.contents,
          rating: comment.rating,
        })
        .eq('comment_id', editingCommentId)
        .select();

      if (error) throw error;

      if (data) {
        // setComments와 관련된 직접 상태 업데이트 제거
        // queryClient.invalidateQueries의 무효화를 통해 자동으로 데이터 갱신
        queryClient.invalidateQueries({ queryKey: ['comments', pathname] });
        setIsEditing(false);
        setEditingCommentId(null);
        setComment({ contents: '', rating: '' });
        toast.success('댓글이 수정되었습니다.');
        scrollToComment(editingCommentId); // 수정한 댓글로 스크롤
      }
    } catch (error) {
      toast.error('댓글 수정에 실패했습니다.');
      console.error('댓글 업데이트 에러: ', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const isConfirmed = confirm('정말 삭제하시겠습니까?');
    if (!isConfirmed) {
      return;
    }

    if (!checkLoginAndRedirect()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('comment_id', commentId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['comments', pathname] });
      toast.success('댓글이 삭제되었습니다.');
    } catch (error) {
      toast.error('댓글 삭제에 실패했습니다.');
      console.error('댓글 삭제 에러: ', error);
    }
  };

  return (
    <>
      <div className='flex justify-center w-full overflow-hidden mb-8'>
        <div
          className='rounded-lg w-[1000px] p-4 mx-2'
          style={{ height: '500px' }}
        >
          <img
            ref={imageRef}
            src={studyPlace?.photo_url}
            alt={studyPlace?.place_name}
            onLoad={handleImageLoad}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px',
            }}
          />
        </div>
      </div>
      <div>
        <main className='mx-20 lg:px-8'>
          <section aria-labelledby='products-heading' className='pb-24 pt-6'>
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-4'>
              <div className='lg:col-span-4 row-span-3 space-y-6 pb-8 text-xl font-medium text-gray-900 dark:text-gray-200'>
                <React.Fragment>
                  <CustomDetailCard
                    place={studyPlace}
                    isScrapped={isScrapped}
                    onScrap={addScrap}
                    onUnscrap={removeScrap}
                  />
                </React.Fragment>
                <Card className='ml-2 w-[480px]'>
                  <Map address={studyPlace.address} />
                </Card>
              </div>

              <div className='lg:col-span-8 ml-24' ref={commentFormRef}>
                <Card className='p-6 w-full'>
                  <div className='space-y-6 pb-2'>
                    <div className='text-2xl font-bold mb-4'>
                      [{studyPlace.place_name}] 댓글 작성
                    </div>

                    <div className='my-16'>
                      <RadioGroup
                        className='col-span-12 md:col-span-6 md:mb-0 font-bold text-lg'
                        value={comment.rating}
                        onChange={(e) => {
                          const selectedRating = e.target.value;
                          handleRatingChange(selectedRating);
                        }}
                        label='별점 선택'
                      >
                        <div className='flex flex-wrap space-x-3'>
                          {ratings.map((rating, index) => (
                            <Radio key={index} value={rating}>
                              {rating}
                            </Radio>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <Textarea
                      name='contents'
                      variant='faded'
                      labelPlacement='outside'
                      value={comment.contents}
                      onChange={handleCommentInputChange}
                      placeholder='내용을 300자 이하로 작성해주세요.'
                      className='col-span-12 md:col-span-6 mb-6 md:mb-0 font-bold text-lg'
                      maxLength={300}
                    />
                    <Button
                      className='w-full text-lg'
                      color='primary'
                      variant='shadow'
                      onPress={isEditing ? handleUpdateComment : saveComment}
                    >
                      {isEditing ? '수정하기' : '작성하기'}
                    </Button>
                  </div>
                </Card>
              </div>

              <div className='lg:col-span-12 ml-2'>
                <Card className='w-full p-6 pb-8'>
                  <div className='space-y-1 py-2 mx-2'>
                    <div className='text-2xl font-bold mb-7 ml-3'>
                      작성된 댓글
                    </div>
                    <div className='flex flex-wrap gap-4'>
                      {comments.length > 0 ? (
                        comments.map((comment) => (
                          <Card
                            key={comment.comment_id}
                            ref={(element) => {
                              editedCommentRefs.current[comment.comment_id] =
                                element;
                            }}
                            className='w-full max-w-[337px] relative mx-3'
                          >
                            <CardHeader className='justify-between mt-2 ml-2'>
                              <div className='flex gap-5'>
                                <Avatar
                                  isBordered
                                  radius='full'
                                  size='md'
                                  src={comment.user_profile_image}
                                />
                                <div className='flex flex-col gap-1 items-start justify-center'>
                                  <h4 className='text-ml font-semibold leading-none text-default-600'>
                                    {comment.nickname}
                                  </h4>
                                  <h5 className='text-small tracking-tight text-default-400'>
                                    {comment.rating}
                                  </h5>
                                </div>
                              </div>

                              {comment.user_id === session?.user.id && (
                                <button
                                  onClick={() =>
                                    handleEllipsisToggle(comment.comment_id)
                                  }
                                  ref={toggleRef}
                                >
                                  <svg
                                    name='ellipsis'
                                    xmlns='http://www.w3.org/2000/svg'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    strokeWidth={1.5}
                                    stroke='currentColor'
                                    className='w-6 h-6 mr-2'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      d='M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
                                    />
                                  </svg>
                                </button>
                              )}

                              {isOpen &&
                                selectedCommentId === comment.comment_id && (
                                  <div className='absolute w-20 pt-5 mt-10 mr-3 z-10 top-0 right-0'>
                                    <Button
                                      className='mb-1 font-bold'
                                      onClick={() =>
                                        handleEditButtonClick(comment)
                                      }
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      className='font-bold'
                                      onClick={() =>
                                        handleDeleteComment(comment.comment_id)
                                      }
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                )}
                            </CardHeader>

                            <CardBody className='m-2 px-3 py-0'>
                              <span className='pt-2 text-lg'>
                                {comment.contents}
                              </span>
                            </CardBody>
                            <CardFooter className='ml-2 gap-3'>
                              <div className='flex gap-1'>
                                <p className='text-default-400 text-sm'>
                                  {formatDateTime(comment.created_at)}
                                </p>
                              </div>
                            </CardFooter>
                          </Card>
                        ))
                      ) : (
                        <div>
                          <p className='text-xl'>
                            아쉽게도 아직 작성된 리뷰가 없네요! 가장 먼저 리뷰를
                            달아주세요 :)
                          </p>
                        </div>
                      )}
                    </div>
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
