import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CategoryState {
    activeCategory: string;
    categories: string[];
    setActiveCategory: (category: string) => void;
    setCategories: (categories: string[]) => void;
}

export const useCategoryStore = create<CategoryState>()(
    persist(
        (set) => ({
            activeCategory: 'all',
            categories: ['all'],
            setActiveCategory: (category: string) => {
                set((state) => ({ ...state, activeCategory: category }));
            },
            setCategories: (categories: string[]) => {
                set((state) => ({ 
                    ...state, 
                    categories: ['all', ...categories.filter(cat => cat !== 'all')]
                }));
            },
        }),
        {
            name: 'category-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
); 