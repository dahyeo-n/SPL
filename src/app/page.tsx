'use client';

import React from 'react';
import supabase from '@/supabaseClient';

const Main: React.FC = () => {
  // 로그아웃 함수
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('로그아웃 에러:', error);
    } else {
      console.log('로그아웃 성공');
      // 필요한 경우 여기에서 로그아웃 후 로직 추가 (예: 홈페이지로 리디렉트)
    }
  };

  return (
    <div>
      <button onClick={handleSignOut}>로그아웃</button>
    </div>
  );
};

export default Main;
