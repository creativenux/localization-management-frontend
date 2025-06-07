import { useState } from 'react';
import { useProjectStore } from '../store/project-store';
import { useLanguageStore } from '../store/language-store';
import { useCategoryStore } from '../store/category-store';
import { useTranslations, useUpdateTranslation } from '../services/translation-service';
import CreateTranslationModal from './create-translation-modal';
import { Plus } from 'lucide-react';

const TranslationKeyManager = () => {
    const { activeProject } = useProjectStore();
    const { activeLanguage } = useLanguageStore();
    const { activeCategory } = useCategoryStore();
    const [editingCell, setEditingCell] = useState<{
        keyId: number;
        languageCode: string;
    } | null>(null);
    const [editValue, setEditValue] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: translationKeys = [], isLoading } = useTranslations(activeProject?.id || '');
    const updateTranslationMutation = useUpdateTranslation(activeProject?.id || '');

    // Filter translation keys based on active category
    const filteredTranslationKeys = translationKeys.filter(key => 
        activeCategory === 'all' || key.category === activeCategory
    );

    const handleEdit = (keyId: number, languageCode: string, currentValue: string) => {
        setEditingCell({ keyId, languageCode });
        setEditValue(currentValue);
    };

    const handleSave = () => {
        if (!editingCell || !activeProject) return;

        const keyData = translationKeys.find(key => key.id === editingCell.keyId);
        if (!keyData) return;

        // Preserve existing translations and update only the edited language
        const updatedTranslations = {
            ...keyData.translations,
            [editingCell.languageCode]: {
                value: editValue,
                updated_at: new Date().toISOString(),
                updated_by: "user" // This should be replaced with actual user info
            }
        };

        updateTranslationMutation.mutate({
            localization_id: editingCell.keyId,
            translations: updatedTranslations
        });

        setEditingCell(null);
    };

    const handleCancel = () => {
        setEditingCell(null);
    };

    if (!activeProject) {
        return (
            <div className="w-full flex items-center justify-center p-8 text-stone-500">
                Please select a project to view translations
            </div>
        );
    }

    if (!activeLanguage) {
        return (
            <div className="w-full flex items-center justify-center p-8 text-stone-500">
                Please select a language to view translations
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="w-full flex items-center justify-center p-8 text-stone-500">
                Loading translations...
            </div>
        );
    }

    return (
        <main className="w-full flex flex-col space-y-6">
            {/* Toolbar Area */}
            <div className="bg-white dark:bg-stone-800 shadow rounded-lg p-4 flex items-center justify-between min-h-[60px]">
                <div className="w-full flex items-center justify-between">
                    <div className="p-3 border border-dashed border-stone-300 dark:border-stone-600 rounded bg-stone-50 dark:bg-stone-700 text-sm text-stone-500 dark:text-stone-400">
                        [Search]
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Plus className="w-4 h-4" />
                        Add Translation
                    </button>
                </div>
            </div>
            {/* Translation Keys List / Editor Area */}
            <section className="flex-grow bg-white dark:bg-stone-800 shadow rounded-lg p-4 lg:p-6">
                <h2 className="text-xl font-semibold mb-4 text-stone-700 dark:text-stone-300">
                    Translation Management Area
                </h2>
                <div className="container mx-auto py-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {activeLanguage.code.toUpperCase()}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTranslationKeys.map((key) => (
                                    <tr key={key.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{key.key}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{key.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{key.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {editingCell?.keyId === key.id && editingCell?.languageCode === activeLanguage.code ?
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <button
                                                        onClick={handleSave}
                                                        className="p-2 text-green-600 hover:text-green-800 focus:outline-none"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="p-2 text-red-600 hover:text-red-800 focus:outline-none"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            :
                                                <div className="flex items-center gap-2">
                                                    <span>{key.translations[activeLanguage.code]?.value}</span>
                                                    <button
                                                        onClick={() => handleEdit(key.id, activeLanguage.code, key.translations[activeLanguage.code]?.value || "")}
                                                        className="p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                                                    >
                                                        ✎
                                                    </button>
                                                </div>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
            <CreateTranslationModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </main>
    );
};

export default TranslationKeyManager;