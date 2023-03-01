import create from 'zustand'

export const useDiaryStore = create((set) => ({
  allDiaries: [],
  setAllDiaries: (newAllDiaries) => set((state) => ({allDiaries: newAllDiaries})),
  writingFee: 0,
  setWritingFee: (newWritingFee) => set((state) => ({writingFee: newWritingFee})),
}))
