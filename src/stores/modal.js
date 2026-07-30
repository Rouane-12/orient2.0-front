// src/store/useModalStore.js
import { create } from 'zustand';

const useModalStore = create((set) => ({
    isOpen: false,
    content: null,
    openModal: (content) => set({ isOpen: true, content }),
    closeModal: () => set({ isOpen: false, content: null }),
    toggleModal: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export default useModalStore;
