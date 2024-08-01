import create from 'zustand';

const useBearsStore = create((set) => ({
  session: null,
  nickname: null,
  userProfileImage: null,
  isScrapped: false,
  setSession: (session) => set({ session }),
  setNickname: (nickname) => set({ nickname }),
  setUserProfileImage: (userProfileImage) => set({ userProfileImage }),
  setIsScrapped: (isScrapped) => set({ isScrapped }),
}));

export default useBearsStore;
