// import { useQuery } from '@tanstack/react-query';
// import supabase from '@/supabaseClient';

// const fetchStudyPlaces = async (
//   category: string,
//   placeType: string
// ): Promise<StudyPlace[]> => {
//   let query = supabase
//     .from('study_places')
//     .select('*')
//     .order('rating', { ascending: false });

//   if (category) {
//     query = query.ilike('category', `%${category}%`);
//   }

//   if (placeType) {
//     query = query.ilike('place_type', `%${placeType}%`);
//   }

//   const { data, error } = await query;

//   if (error) {
//     throw new Error(error.message);
//   }

//   return data as StudyPlace[];
// };

// const useStudyPlaces = (category: string, placeType: string) => {
//   return useQuery<StudyPlace[]>(['studyPlaces', category, placeType], () =>
//     fetchStudyPlaces(category, placeType)
//   );
// };

// export default useStudyPlaces;
