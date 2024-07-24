import { useQuery } from '@tanstack/react-query';
import supabase from '@/supabaseClient';

const fetchStudyPlaces = async () => {
  const { data, error } = await supabase
    .from('study_places')
    .select('*')
    .order('rating', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

const useStudyPlaces = () => {
  return useQuery({
    queryKey: ['studyPlaces'],
    queryFn: fetchStudyPlaces,
  });
};

export default useStudyPlaces;
