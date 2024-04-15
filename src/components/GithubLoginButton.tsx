import supabase from '@/supabaseClient';
import React from 'react';
import { useRouter } from 'next/navigation';

const GithubLoginButton: React.FC = () => {
  const router = useRouter();

  const handleGithubLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
    });

    console.log('GitHub 로그인 data: ', data);

    if (error) {
      console.error('로그인 에러: ', error);
      return;
    }

    router.push('/');
  };

  return (
    <div
      role='button'
      onClick={handleGithubLogin}
      style={{ cursor: 'pointer' }}
    >
      <img
        className='w-[50px] my-4'
        src='/images/github-login-image.png'
        alt='GitHub 계정으로 로그인하기'
      />
    </div>
  );
};

export default GithubLoginButton;
