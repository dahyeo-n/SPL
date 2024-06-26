'use client';

import React, { useEffect, useState } from 'react';
import supabase from '@/supabaseClient';
import { useRouter } from 'next/navigation';

import { ToastContainer, toast } from 'react-toastify';

function SignPageLayout({ children }: { children: React.ReactNode }) {
  const [shouldRender, setShouldRender] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    let checkUnmounted = false;

    const getUserSession = async () => {
      const { data } = await supabase.auth.getSession();

      try {
        if (!checkUnmounted) {
          const isLogin = data.session?.access_token ? true : false;

          if (!isLogin) {
            setShouldRender(true);
          } else {
            toast.info('이미 로그인된 상태입니다. 마이 페이지로 이동합니다.');
            router.replace('/my');
            return;
          }
        }
      } catch (error) {
        console.error(`Error: ${error}`);
        toast.error(
          '오류가 발생하였습니다. 새로고침 후에도 지속될 시, 고객센터로 연락해주세요.'
        );
      }
    };
    getUserSession();

    return () => {
      checkUnmounted = true;
    };
  }, [router]);

  return (
    <>
      {shouldRender && children}
      <ToastContainer />
    </>
  );
}

export default SignPageLayout;
