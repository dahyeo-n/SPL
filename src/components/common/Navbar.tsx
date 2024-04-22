'use client';

import React, { useEffect, useState } from 'react';

import supabase from '@/supabaseClient';
import { Session } from '@supabase/supabase-js';

import { useRouter, usePathname } from 'next/navigation';

import { Badge, Button, Switch, Link, Input } from '@nextui-org/react';
// import { NotificationIcon } from './NotificationIcon';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import { ToastContainer, toast } from 'react-toastify';
import { SearchIcon } from './SearchIcon';

import Image from 'next/image';
import logo from '../../../public/images/SPL-logo.png';

const Navbar: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isInvisible, setIsInvisible] = React.useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getUserSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(data.session);
      } catch (error) {
        toast.error('Session 처리에 오류가 발생했습니다.');
        console.log(error);
      }
    };

    getUserSession();
  }, [router, pathname]);

  const token = session?.access_token ? true : false;

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
      } else {
        setSession(session);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // 로그아웃 처리 함수
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('로그아웃 에러: ', error);
    } else {
      console.log('로그아웃 성공');
      router.replace('/');
    }
  };

  return (
    <div className='flex h-14 mx-8 my-4 items-center justify-between'>
      <div>
        <Link href='/' className='font-bold text-lg'>
          <Image src={logo} alt='SPL로고' width={115} height={100} />
        </Link>
      </div>

      <div>
        {token ? (
          <div className='flex items-center gap-4'>
            <Input
              classNames={{
                base: 'max-w-full w-[16rem] h-10 mr-1',
                mainWrapper: 'h-full',
                input: 'text-small',
                inputWrapper:
                  'h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20',
              }}
              placeholder='Search by place name...'
              size='sm'
              startContent={<SearchIcon size={18} />}
              type='search'
            />
            <ThemeSwitcher />
            {/* <Badge
              content='1'
              color='danger'
              isInvisible={isInvisible}
              shape='circle'
            >
              <Button
                radius='full'
                isIconOnly
                aria-label='more than 99 notifications'
                variant='light'
              >
                <NotificationIcon size={24} />
              </Button>
            </Badge>
            <Switch
              isSelected={!isInvisible}
              onValueChange={(value) => setIsInvisible(!value)}
            ></Switch> */}

            <button>
              <svg
                name='scrap'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='w-6 h-6'
                onClick={() => router.push(`/my?category=scrapped`)}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z'
                />
              </svg>
            </button>

            <Button
              className='ml-1'
              href='/my'
              as={Link}
              color='primary'
              variant='ghost'
            >
              마이페이지
            </Button>

            <Button color='primary' variant='ghost' onClick={handleSignOut}>
              로그아웃
            </Button>
          </div>
        ) : (
          <>
            <div className='flex items-center gap-4'>
              <Input
                classNames={{
                  base: 'max-w-full w-[16rem] h-10 mr-1',
                  mainWrapper: 'h-full',
                  input: 'text-small',
                  inputWrapper:
                    'h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20',
                }}
                placeholder='Search by place name...'
                size='sm'
                startContent={<SearchIcon size={18} />}
                type='search'
              />
              <ThemeSwitcher />
              <Button
                className='ml-2'
                href='/sign/signin'
                as={Link}
                color='primary'
                variant='ghost'
              >
                로그인
              </Button>

              <Button
                href='/sign/signup'
                as={Link}
                color='primary'
                variant='ghost'
              >
                회원가입
              </Button>
            </div>
          </>
        )}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Navbar;
