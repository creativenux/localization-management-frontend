import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ILanguage } from '../services/language-service';

interface LanguageState {
    activeLanguage: ILanguage | null;
    languages: ILanguage[];
    setActiveLanguage: (language: ILanguage) => void;
    setLanguages: (languages: ILanguage[]) => void;
    updateLanguage: (language: ILanguage) => void;
    addLanguage: (language: ILanguage) => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            activeLanguage: null,
            languages: [],
            setActiveLanguage: (language: ILanguage) => {
                set((state) => ({ ...state, activeLanguage: language }));
            },
            setLanguages: (languages: ILanguage[]) => {
                set((state) => ({ ...state, languages }));
            },
            updateLanguage: (language: ILanguage) => {
                set((state) => ({
                    ...state,
                    languages: state.languages.map((l) => l.code === language.code ? language : l),
                }));
            },
            addLanguage: (language: ILanguage) => {
                set((state) => ({
                    ...state,
                    languages: [...state.languages, language],
                }));
            },
        }),
        {
            name: 'language-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
); 