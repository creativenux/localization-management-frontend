import { useState } from 'react';
import { useLanguages } from '../services/language-service';
import { useCreateTranslation } from '../services/translation-service';
import { useProjectStore } from '../store/project-store';

interface CreateTranslationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateTranslationModal({ isOpen, onClose }: CreateTranslationModalProps) {
    const { activeProject } = useProjectStore();
    const { data: languages = [] } = useLanguages();
    const createTranslationMutation = useCreateTranslation(activeProject?.id || '');

    const [formData, setFormData] = useState({
        key: '',
        category: '',
        description: '',
        translations: {} as { [key: string]: { 
            value: string,
            updated_at: string,
            updated_by: string
        } }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeProject) return;

        // Check if at least one translation is provided
        if (Object.keys(formData.translations).length === 0) {
            alert('Please provide at least one translation');
            return;
        }

        createTranslationMutation.mutate(formData, {
            onSuccess: () => {
                onClose();
                setFormData({
                    key: '',
                    category: '',
                    description: '',
                    translations: {}
                });
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-stone-800 rounded-lg p-6 w-full max-w-2xl shadow-xl">
                <h2 className="text-xl font-semibold mb-4 text-stone-700 dark:text-stone-300">
                    Create New Translation
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                            Key
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.key}
                            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                            Category
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                            Description
                        </label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            Translations
                        </label>
                        <div className="space-y-3">
                            {languages.map((language) => (
                                <div key={language.code} className="flex items-center gap-2">
                                    <label className="w-24 text-sm text-stone-600 dark:text-stone-400">
                                        {language.name}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.translations[language.code]?.value || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            translations: {
                                                ...formData.translations,
                                                [language.code]: { 
                                                    value: e.target.value,
                                                    updated_at: new Date().toISOString(),
                                                    updated_by: "user"
                                                }
                                            }
                                        })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createTranslationMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {createTranslationMutation.isPending ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 