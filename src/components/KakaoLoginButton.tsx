import supabase from '@/supabaseClient';
import React from 'react';
import { useRouter } from 'next/navigation';

const KakaoLoginButton: React.FC = () => {
  const router = useRouter();

  const handleKakaoLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
    });

    console.log('카카오 로그인 data: ', data);

    if (error) {
      console.error('로그인 에러: ', error);
      return;
    }

    router.push('/');
  };

  return (
    <div role='button' onClick={handleKakaoLogin} style={{ cursor: 'pointer' }}>
      <img
        className='w-[50px] my-4'
        src='/images/kakao-login-image.png'
        alt='카카오 계정으로 로그인하기'
      />
    </div>
  );
};

export default KakaoLoginButton;
