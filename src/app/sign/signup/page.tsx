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
  const [userType, setUserType] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [pwValid, setPwValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = React.useState(false);

  const router = useRouter();
  const userTypes = ['중고등학생', '수험생', '대학생', '고시생', '직장인'];

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

    if (
      nickname.length === 0 ||
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

      alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
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
        console.error('알 수 없는 에러:', error);
      }
      setLoading(false);
      alert('회원가입 도중 오류가 발생하였습니다. 고객센터로 연락해주세요.');
      return;
    }
  };

  const handleSubmitNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error.length !== 0) {
      setError('');
    }
    setNickname(e.target.value);
  };

  const handleSubmitEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error.length !== 0) {
      setError('');
    }
    setEmail(e.target.value);
    validateEmail(e.target.value);
  };

  const handleSubmitPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error.length !== 0) {
      setError('');
    }
    setPassword(e.target.value);
    validatePassword(e.target.value);
  };

  const handleEmailFieldClear = () => {
    setEmail('');
    setEmailValid(true);
  };

  const handleNicknameFieldClear = () => {
    setNickname('');
  };

  const handleUserTypeSelectionChange = (e: any) => {
    setUserType(e.target.value);
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
    </div>
  );
};

export default SignUpPage;
