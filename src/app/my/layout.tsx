'use client';

import React, { useEffect, useState } from 'react';
import supabase from '@/supabaseClient';

import { useRouter } from 'next/navigation';

import { ToastContainer, toast } from 'react-toastify';

const MyPageLayout = ({ children }: { children: React.ReactNode }) => {
  const [shouldRender, setShouldRender] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    let checkUnmounted = false;

    const getUserSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log('data => ', data);

        if (!checkUnmounted) {
          const isLogin = data.session?.access_token ? true : false;

          if (isLogin) {
            setShouldRender(true);
          } else {
            toast.info(
              '로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.'
            );
            router.replace('/sign/signin');
            return;
          }
        }
      } catch (error) {
        console.error(`Error: ${error}`);
        toast.error(
          '로그인 상태가 불안정합니다. 새로고침 후에도 지속될 시, 고객센터로 연락해주세요.'
        );
      }
    };
    getUserSession();

    // cleanup 함수
    return () => {
      checkUnmounted = true;
    };
  }, [router]);

  return (
    <div>
      {shouldRender && children}
      <ToastContainer />
    </div>
  );
};

export default MyPageLayout;
