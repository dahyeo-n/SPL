// import { useQuery } from '@tanstack/react-query';
// import supabase from '@/supabaseClient';

// interface StudyPlace {
//   id: string;
//   place_id: string;
//   category: string;
//   place_name: string;
//   place_type: string;
//   photo_url: string;
//   rating: number;
//   address: string;
//   operating_hours: string;
//   contact: string;
//   fee: string;
//   website_url: string;
//   notes: string;
// }

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
