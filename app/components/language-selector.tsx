'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useLanguages, useCreateLanguage, ILanguage } from '../services/language-service';
import { useLanguageStore } from '../store/language-store';

export default function LanguageSelector() {
    const { data: languages = [], isLoading } = useLanguages();
    const createLanguageMutation = useCreateLanguage();
    const { activeLanguage, setActiveLanguage } = useLanguageStore((state) => state);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newLanguage, setNewLanguage] = useState<{ name: string; code: string }>({
        name: '',
        code: '',
    });

    useEffect(() => {
        if (languages.length > 0 && !activeLanguage) {
            setActiveLanguage(languages[0]);
        }
    }, [languages, activeLanguage, setActiveLanguage]);

    const handleLanguageSelect = (language: ILanguage) => {
            setActiveLanguage(language);
    };

    const handleAddLanguage = () => {
        if (newLanguage.name && newLanguage.code) {
            createLanguageMutation.mutate(newLanguage, {
                onSuccess: () => {
                    setNewLanguage({ name: '', code: '' });
                    setIsAddingNew(false);
                },
            });
        }
    };

    if (isLoading) {
        return <div>Loading languages...</div>;
    }

    return (
        <div className="w-full max-w-md">
        <ul className="space-y-2">
            {languages.map((language: ILanguage, index: number) => (
            <li
                key={index}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                activeLanguage?.code === language.code
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleLanguageSelect(language)}
            >
                <span className="text-sm font-medium">{language.name}</span>
            </li>
            ))}
            
            {isAddingNew ? (
            <li className="p-2 border rounded-lg">
                <div className="space-y-2">
                <input
                    type="text"
                    placeholder="Language name"
                    className="w-full p-1 text-sm border rounded bg-white dark:bg-stone-700 border-stone-300 dark:border-stone-600 text-stone-900 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400"
                    value={newLanguage.name}
                    onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Language code (e.g., en, es)"
                    className="w-full p-1 text-sm border rounded bg-white dark:bg-stone-700 border-stone-300 dark:border-stone-600 text-stone-900 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400"
                    value={newLanguage.code}
                    onChange={(e) => setNewLanguage({ ...newLanguage, code: e.target.value })}
                />
                <div className="flex gap-2">
                    <button
                    onClick={handleAddLanguage}
                    disabled={createLanguageMutation.isPending}
                    className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                    {createLanguageMutation.isPending ? 'Adding...' : 'Add'}
                    </button>
                    <button
                    onClick={() => setIsAddingNew(false)}
                    className="px-3 py-1 text-sm text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-700 rounded hover:bg-stone-200 dark:hover:bg-stone-600"
                    >
                    Cancel
                    </button>
                </div>
                </div>
            </li>
            ) : (
            <li>
                <button
                onClick={() => setIsAddingNew(true)}
                className="flex items-center gap-2 p-2 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                >
                <Plus className="w-4 h-4" />
                Add new language
                </button>
            </li>
            )}
        </ul>
        </div>
    );
}
