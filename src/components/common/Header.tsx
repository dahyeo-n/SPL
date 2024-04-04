'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import supabase from '@/supabaseClient';
import { Session } from '@supabase/supabase-js';

import { useRouter, usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('로그아웃 에러:', error);
    } else {
      console.log('로그아웃 성공');
      router.replace('/');
    }
  };

  useEffect(() => {
    const getUserSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(data.session);
      } catch (error) {
        alert('Session 처리에 오류가 발생했습니다.');
        console.log(error);
      }
    };

    getUserSession();
  }, [router, pathname]);

  const token = session?.access_token ? true : false;

  return (
    <div className='flex h-14 items-center justify-between'>
      <p>
        <Link className='font-bold text-lg' href='/'>
          SPL
        </Link>
      </p>
      <div>
        {token ? (
          <div>
            {/* 아이콘 넣기 */}
            <button>알림</button>
            <button>스크랩</button>
            <Link href={'/my'}>마이페이지</Link>
            <button onClick={handleSignOut}>로그아웃</button>
          </div>
        ) : (
          <>
            <Link href={'/sign/signin'}>로그인</Link>
            <Link href={'/sign/signup'}>회원가입</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
