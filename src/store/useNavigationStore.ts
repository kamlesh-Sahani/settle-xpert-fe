import { create } from 'zustand';

interface NavigationState {
    isFormDirty: boolean;
    setIsFormDirty: (dirty: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
    isFormDirty: false,
    setIsFormDirty: (dirty) => set({ isFormDirty: dirty }),
}));
