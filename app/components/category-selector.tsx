'use client';

import { useEffect } from 'react';
import { useProjectStore } from '../store/project-store';
import { useCategoryStore } from '../store/category-store';
import { useTranslations } from '../services/translation-service';

export default function CategorySelector() {
    const { activeProject } = useProjectStore();
    const { activeCategory, categories, setActiveCategory, setCategories } = useCategoryStore();
    const { data: translationKeys = [] } = useTranslations(activeProject?.id || '');

    useEffect(() => {
        if (translationKeys.length > 0) {
            // Extract unique categories from translation keys
            const uniqueCategories = Array.from(new Set(translationKeys.map(key => key.category)));
            setCategories(uniqueCategories);
        }
    }, [translationKeys, setCategories]);

    if (!activeProject) {
        return <div>Please select a project to view categories</div>;
    }

    return (
        <div className="w-full max-w-md">
            <ul className="space-y-2">
                {categories.map((category, index) => (
                    <li
                        key={index}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            activeCategory === category
                                ? 'bg-blue-100 dark:bg-blue-900'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setActiveCategory(category)}
                    >
                        <span className="text-sm font-medium capitalize">{category}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
