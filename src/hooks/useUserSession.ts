import { useQuery } from '@tanstack/react-query';
import supabase from '@/supabaseClient';
import { Session } from '@supabase/supabase-js';

const fetchSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
};

const useUserSession = () => {
  return useQuery<Session | null>({
    queryKey: ['session'],
    queryFn: fetchSession,
  });
};

export default useUserSession;
