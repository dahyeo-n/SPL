'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import supabase from '.././../../supabaseClient';
import { Session } from '@supabase/supabase-js';
import { CustomDetailCard } from '../../../components/common/CustomDetailCard';
import Map from '../../../components/Map';

import mediumZoom from 'medium-zoom';
import { useTheme } from 'next-themes';
import { toast } from 'react-toastify';

import {
  Image,
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

interface Comments {
  comment_id: string;
  study_place_id: string;
  user_id: string;
  rating: string;
  title: string;
  contents: string;
  created_at: string;
  nickname: string;
  user_profile_image: string;
}

const Detail = () => {
  const [studyPlace, setStudyPlace] = useState<StudyPlace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [nickname, setNickname] = useState<string | null>(null);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const [isScrapped, setIsScrapped] = useState(false);
  const [comments, setComments] = useState<Comments[]>([]);

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null
  );

  const { theme } = useTheme();
  const imageRef = useRef<HTMLImageElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

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

        if (data) {
          try {
            const { data, error } = await supabase
              .from('comments')
              .select('*')
              .eq('study_place_id', placeId);

            if (error) throw error;
            setComments(data || []);
          } catch (error) {
            console.error('댓글을 가져오는 중 오류 발생: ', error);
          }
        }
      } catch (error) {
        console.error(
          '공부 장소 상세정보를 가져오는 데 실패하였습니다: ',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudyPlaceData();
  }, []);

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
    if (session?.user && typeof session.user.email === 'string') {
      fetchUserProfile(session.user.email);
    }
  }, [session?.user]);

  const fetchUserProfile = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('nickname, user_profile_image')
        .eq('email', email)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setNickname(data.nickname);
        setUserProfileImage(data.user_profile_image);
      }
    } catch (error) {
      console.error('사용자 프로필을 불러오는 데 실패했습니다: ', error);
    }
  };

  // 공부 장소의 스크랩 여부 확인
  const checkScrapStatus = async () => {
    if (session?.user?.id && studyPlace?.id) {
      const { data } = await supabase
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
    if (!checkLoginAndRedirect()) return;

    if (session && studyPlace && !isScrapped) {
      try {
        // 해당 유저가 해당 공부 장소를 전에도 스크랩했는지 확인
        const { data: existingScrap, error: existingScrapError } =
          await supabase
            .from('study_place_scraps')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('study_place_id', studyPlace.place_id)
            .single();

        if (existingScrap) {
          return;
        }

        const { data, error } = await supabase
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

      console.log('삭제 응답: ', data, error);

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
    // alert('실행됐어요!');
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
    if (!checkLoginAndRedirect()) return;

    if (!isCommentValid()) {
      toast.error('평점과 댓글 제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const { data, error } = await supabase.from('comments').insert([
        {
          study_place_id: studyPlace.place_id,
          user_id: session?.user.id,
          rating: comment.rating,
          title: comment.title,
          contents: comment.contents,
          nickname,
          user_profile_image: userProfileImage,
        },
      ]);

      if (error) {
        toast.error('댓글을 저장하는 데 실패했습니다.');
        console.error('Error saving comment: ', error);
      } else if (data) {
        setComments((currentComments) => [data[0], ...currentComments]);
      }

      setComment({ title: '', contents: '', rating: '' });
      console.log('Comment saved successfully: ', data);
      toast.success('댓글이 저장되었습니다.');
    } catch (error) {
      toast.error('댓글을 저장하는 데 실패했습니다.');
      console.error('Error saving comment: ', error);
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
      title: comment.title,
      contents: comment.contents,
      rating: comment.rating,
    });
  };

  const handleUpdateComment = async () => {
    if (!isCommentValid() || !editingCommentId) {
      toast.error('모든 필드를 올바르게 입력해주세요.');
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .update({
          title: comment.title,
          contents: comment.contents,
          rating: comment.rating,
        })
        .eq('comment_id', editingCommentId);

      if (error) throw error;

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.comment_id === editingCommentId
            ? {
                ...comment,
                title: comment.title,
                contents: comment.contents,
                rating: comment.rating,
              }
            : comment
        )
      );

      // 수정 모드 종료
      setIsEditing(false);
      setEditingCommentId(null);
      setComment({ title: '', contents: '', rating: '' });
    } catch (error) {
      toast.error('댓글 수정에 실패했습니다.');
      console.error('Error updating comment: ', error);
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

      // 삭제된 후, 상태 업데이트
      setComments((currentComments) =>
        currentComments.filter((comment) => comment.comment_id !== commentId)
      );
    } catch (error) {
      toast.error('댓글 삭제에 실패했습니다.');
      console.error('Error deleting comment: ', error);
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

              <div className='lg:col-span-8 ml-24'>
                <Card className='p-6 w-full'>
                  <div className='space-y-6 pb-2'>
                    <div className='text-2xl font-bold mb-4'>
                      [{studyPlace.place_name}] 댓글 작성
                    </div>

                    <div className='my-16'>
                      <RadioGroup
                        className='col-span-12 md:col-span-6 md:mb-0 font-bold'
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
                      name='title'
                      variant='faded'
                      label='Title'
                      labelPlacement='outside'
                      value={comment.title}
                      onChange={handleCommentInputChange}
                      placeholder='Enter the title. Please limit to 50 characters or less.'
                      className='col-span-12 md:col-span-6 mb-6 md:mb-0 font-bold'
                      maxLength={50}
                    />

                    <Textarea
                      name='contents'
                      variant='faded'
                      label='Contents'
                      labelPlacement='outside'
                      value={comment.contents}
                      onChange={handleCommentInputChange}
                      placeholder='Enter the contents. Please limit to 300 characters or less.'
                      className='col-span-12 md:col-span-6 mb-6 md:mb-0 font-bold'
                      maxLength={300}
                    />
                    <Button
                      className='w-full'
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
                    <div className='text-2xl font-bold mb-7'>작성된 댓글</div>
                    <div className='flex flex-wrap gap-4'>
                      {comments.length > 0 ? (
                        comments.map((comment) => (
                          <Card
                            key={comment.comment_id}
                            className='w-full max-w-[337px] relative'
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
                                  <h4 className='text-small font-semibold leading-none text-default-600'>
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
                              <p className='text-ml font-bold'>
                                {comment.title}
                              </p>
                              <span className='pt-2'>{comment.contents}</span>
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
