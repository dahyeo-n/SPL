'use client';

import React, { useState } from 'react';
import supabase from '@/supabaseClient';
import { useRouter } from 'next/navigation';
import { INVALID_LOGIN_CREDENTIALS } from '@/constants/errorCode';

import { Input } from '@nextui-org/react';
import { EyeFilledIcon } from '../EyeFilledIcon';
import { EyeSlashFilledIcon } from '../EyeSlashFilledIcon';
import { Button } from '@nextui-org/react';
import Link from 'next/link';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailValid, setEmailValid] = useState(true);
  const [pwValid, setPwValid] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = React.useState(false);

  const router = useRouter();

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
    if (!password.length) {
      setPwValid(true);
      return;
    }
    setPwValid(regExp.test(password));
  };

  const handleSubmitSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (email.length === 0 || password.length === 0) {
      setError('모든 입력칸을 올바르게 작성해주세요.');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('로그인 처리 후 확인 데이터 => ', data);

      if (error && error.message === INVALID_LOGIN_CREDENTIALS) {
        alert(
          '아이디(로그인 전용 아이디) 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요.'
        );
        console.log(error);
        setLoading(false);
        return;
      }

      setEmail('');
      setPassword('');
      alert(`오늘도 함께해주셔서 감사해요! 성공적으로 로그인되었어요 :)`);
      router.replace('/');
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
      console.error(error);
      alert('로그인 도중 오류가 발생하였습니다. 고객센터로 연락해주세요.');
    }
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

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className='flex justify-center items-center flex-col space-y-4 w-full mx-auto my-40'>
      <h1 className='text-4xl font-bold mb-2'>로그인</h1>
      <form onSubmit={handleSubmitSignIn}>
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
            <p className='text-red-500'>
              * 유효한 이메일 방식으로 입력해주세요.
            </p>
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
              <p className='text-red-500'>
                * 영문/숫자/특수문자 포함 8자 이상 입력해주세요.
              </p>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>

          <div className='flex justify-center mb-4'>
            <Button
              className='w-full max-w-xs'
              type='submit'
              disabled={loading}
              color='primary'
              variant='ghost'
            >
              {loading ? '처리 중...' : '로그인하기'}
            </Button>
          </div>
        </div>
      </form>
      <Link href='/sign/signup'>
        가입한 이력이 없으신가요? 회원가입하러 가기
      </Link>
    </div>
  );
};

export default SignInPage;
