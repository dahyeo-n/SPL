import React from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/supabaseClient';

const GoogleLoginButton: React.FC = () => {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    let { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Google 로그인 에러: ', error);
    } else {
      router.push('/');
    }
  };

  return (
    <div
      role='button'
      onClick={handleGoogleLogin}
      style={{ cursor: 'pointer' }}
    >
      <img
        className='w-[50px] my-4'
        src='/images/google-login-image.png'
        alt='구글 계정으로 로그인하기'
      />
    </div>
  );
};

export default GoogleLoginButton;
