'use client';

import React, { useState } from 'react';
import supabase from '@/supabaseClient';

import { useRouter } from 'next/navigation';
import { USER_ALREADY_REGISTERED } from '@/constants/errorCode';

import { Input } from '@nextui-org/react';
import { EyeFilledIcon } from '../EyeFilledIcon';
import { EyeSlashFilledIcon } from '../EyeSlashFilledIcon';
import { Button } from '@nextui-org/react';
import { Select, SelectItem } from '@nextui-org/react';

const SignUpPage = () => {
  const [nickname, setNickname] = useState('');
  const [userType, setUserType] = useState('중고등학생');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [nicknameValid, setNicknameValid] = useState(true);
  const [userTypeValid, setUserTypeValid] = useState(true);
  const [emailValid, setEmailValid] = useState(true);
  const [pwValid, setPwValid] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = React.useState(false);

  const router = useRouter();
  const userTypes = ['중고등학생', '수험생', '대학생', '고시생', '직장인'];

  const validateNickname = (value: any) => {
    return value.length > 0 && value.length <= 15;
  };

  const validateUserType = (value: any) => {
    return userTypes.includes(value);
  };

  const validateEmail = (email: string) => {
    const regExp = /\S+@\S+\.\S+/;
    if (email.length === 0) {
      setEmailValid(true);
      return;
    }
    setEmailValid(regExp.test(email));
  };

  const validatePassword = (password: string) => {
    const regExp =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (password.length === 0) {
      setPwValid(true);
      return;
    }
    setPwValid(regExp.test(password));
  };

  const handleSubmitSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const isNicknameValid = validateNickname(nickname);
    const isUserTypeValid = validateUserType(userType);
    setNicknameValid(isNicknameValid);
    setUserTypeValid(isUserTypeValid);

    if (
      !isNicknameValid ||
      !isUserTypeValid ||
      email.length === 0 ||
      password.length === 0 ||
      !emailValid ||
      !pwValid
    ) {
      setError('모든 입력칸을 올바르게 작성해주세요.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('회원가입 처리 후, 확인 데이터 => ', data.user);

      // 이거 user_profiles key에 맞게 변경해야 함. 테이블명, 닉네임, 유형 변경해야 함
      // data console로 찍어보기
      if (data.user && data.user.id) {
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([
            {
              user_uid: data.user.id,
              nickname: nickname,
              email: data.user.email,
              user_type: userType,
              created_at: data.user.created_at,
            },
          ]);

        if (insertError) {
          throw insertError;
        }
      } else {
        throw new Error('User의 ID가 없습니다.');
      }

      setEmail('');
      setPassword('');

      alert(`${nickname}님, 스플과 함께해주셔서 감사해요!
      스플이 ${nickname}님이 목표를 이룰 수 있게 도울게요 :)`);
      await supabase.auth.signOut();
      router.replace('/sign/signin');

      if (error && error.message === USER_ALREADY_REGISTERED) {
        alert('이미 가입된 이메일입니다.');
        console.log(error);
        return;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        console.error(error);
      } else {
        console.error('알 수 없는 에러: ', error);
      }
      setLoading(false);
      alert('회원가입 도중 오류가 발생하였습니다. 고객센터로 연락해주세요.');
      return;
    }
  };

  const handleSubmitNickname = (e: any) => {
    const value = e.target.value;

    if (error.length !== 0) {
      setError('');
    }
    setNickname(value);
    setNicknameValid(validateNickname(value));
  };

  const handleUserTypeSelectionChange = (
    // e: (keys: React.Key[]) => void
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;

    // 타입 지정... 뭐로 해야 에러 안 떠줄 거니 정말
    setUserType(value);
    setUserTypeValid(validateUserType(value));
  };

  const handleSubmitEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (error.length !== 0) {
      setError('');
    }
    setEmail(value);
    validateEmail(value);
  };

  const handleSubmitPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (error.length !== 0) {
      setError('');
    }
    setPassword(value);
    validatePassword(value);
  };

  const handleEmailFieldClear = () => {
    setEmail('');
    setEmailValid(true);
  };

  const handleNicknameFieldClear = () => {
    setNickname('');
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className='flex justify-center items-center flex-col space-y-4 w-full mx-auto my-40'>
      <h1 className='text-4xl font-bold mb-2'>회원가입</h1>
      <form onSubmit={handleSubmitSignUp}>
        <div className='mb-3'>
          <Input
            isRequired
            className='max-w-xs w-full mb-1'
            style={{ width: '330px' }}
            type='text'
            label='Nickname'
            variant='bordered'
            value={nickname}
            onClear={handleNicknameFieldClear}
            onChange={handleSubmitNickname}
            placeholder='Enter your nickname'
          />
          {!nicknameValid && (
            <div className='text-red-500'>
              * 닉네임을 1자 이상 15자 이하로 입력해주세요.
            </div>
          )}
        </div>

        <div className='mb-3'>
          <Select
            isRequired
            className='max-w-xs'
            label='Type'
            placeholder='Select your type'
            defaultSelectedKeys={[]}
            onChange={handleUserTypeSelectionChange}
          >
            {userTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </Select>
          {!userTypeValid && (
            <div className='text-red-500'>* 사용자 유형을 선택해주세요.</div>
          )}
        </div>

        <div className='mb-3'>
          <Input
            isRequired
            className='max-w-xs w-full mb-1'
            style={{ width: '330px' }}
            type='email'
            label='Email'
            variant='bordered'
            value={email}
            onClear={handleEmailFieldClear}
            onChange={handleSubmitEmail}
            placeholder='Enter your email'
          />
          {!emailValid && (
            <div className='text-red-500'>
              * 유효한 이메일 방식으로 입력해주세요.
            </div>
          )}
        </div>

        <div>
          <div className='mb-4'>
            <Input
              isRequired
              className='max-w-xs w-full mb-1'
              type={isVisible ? 'text' : 'password'}
              label='Password'
              variant='bordered'
              value={password}
              onChange={handleSubmitPassword}
              placeholder='••••••••'
              endContent={
                <button
                  className='focus:outline-none'
                  type='button'
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeSlashFilledIcon className='text-2xl text-default-400 pointer-events-none' />
                  ) : (
                    <EyeFilledIcon className='text-2xl text-default-400 pointer-events-none' />
                  )}
                </button>
              }
            />
            {!pwValid && (
              <div className='text-red-500'>
                * 영문, 숫자, 특수문자 포함 8자 이상 입력해주세요.
              </div>
            )}
            {error && <div style={{ color: 'red' }}>{error}</div>}
          </div>

          <div className='flex justify-center'></div>
          <Button
            className='w-full max-w-xs'
            type='submit'
            disabled={loading}
            color='primary'
            variant='ghost'
          >
            {loading ? '처리 중...' : '회원가입하기'}
          </Button>
        </div>
      </form>
      {/* 로그인 페이지로 이동하는 router 추가 */}
    </div>
  );
};

export default SignUpPage;
