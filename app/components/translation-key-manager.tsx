import { useState, useEffect } from 'react';
import { useProjectStore } from '../store/project-store';
import { useLanguageStore } from '../store/language-store';
import { useCategoryStore } from '../store/category-store';
import { useTranslations, useUpdateTranslation, useUpdateBatchTranslations } from '../services/translation-service';
import CreateTranslationModal from './create-translation-modal';
import { Plus, Loader2, Search } from 'lucide-react';

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
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedKeys, setSelectedKeys] = useState<number[]>([]);
    const [bulkEditValues, setBulkEditValues] = useState<{ [key: number]: string }>({});
    const [isBulkEditing, setIsBulkEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const { data: translationKeys = [], isLoading } = useTranslations(activeProject?.id || '');
    const updateTranslationMutation = useUpdateTranslation(activeProject?.id || '');
    const updateBatchTranslationMutation = useUpdateBatchTranslations(activeProject?.id || '');

    // Filter translation keys based on active category and search query
    const filteredTranslationKeys = translationKeys.filter(key => {
        const matchesCategory = activeCategory === 'all' || key.category === activeCategory;
        const searchLower = searchQuery.toLowerCase();
        
        const matchesSearch = searchQuery === "" || 
            key.key.toLowerCase().includes(searchLower) ||
            (key.description?.toLowerCase().includes(searchLower) ?? false) ||
            Object.values(key.translations).some(translation => 
                translation.value.toLowerCase().includes(searchLower)
            );

        return matchesCategory && matchesSearch;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredTranslationKeys.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedKeys = filteredTranslationKeys.slice(startIndex, startIndex + rowsPerPage);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeCategory]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSelectedKeys([]); // Clear selection when changing pages
    };

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

        updateTranslationMutation.mutate(
            {
                localization_id: editingCell.keyId,
                translations: updatedTranslations
            },
            {
                onSuccess: () => {
                    setEditingCell(null);
                }
            }
        );
    };

    const handleCancel = () => {
        setEditingCell(null);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedKeys(filteredTranslationKeys.map(key => key.id));
        } else {
            setSelectedKeys([]);
        }
    };

    const handleSelectKey = (keyId: number, checked: boolean) => {
        if (checked) {
            setSelectedKeys([...selectedKeys, keyId]);
        } else {
            setSelectedKeys(selectedKeys.filter(id => id !== keyId));
        }
    };

    const handleBulkEdit = () => {
        if (selectedKeys.length === 0) return;
        setIsBulkEditing(true);
        // Initialize bulk edit values with current values
        const initialValues: { [key: number]: string } = {};
        selectedKeys.forEach(keyId => {
            const keyData = translationKeys.find(key => key.id === keyId);
            if (keyData && activeLanguage) {
                initialValues[keyId] = keyData.translations[activeLanguage.code]?.value || '';
            }
        });
        setBulkEditValues(initialValues);
    };

    const handleBulkSave = () => {
        if (!activeProject || !activeLanguage || selectedKeys.length === 0) return;

        const localizations = selectedKeys
            .map(keyId => {
                const keyData = translationKeys.find(key => key.id === keyId);
                if (!keyData) return null;

                // Preserve all existing translations
                const updatedTranslations = {
                    ...keyData.translations,
                    [activeLanguage.code]: {
                        value: bulkEditValues[keyId] || '',
                        updated_at: new Date().toISOString(),
                        updated_by: "user"
                    }
                };

                return {
                    id: keyId,
                    translations: updatedTranslations
                };
            })
            .filter((item): item is {
                id: number;
                translations: {
                    [key: string]: {
                        value: string;
                        updated_at: string;
                        updated_by: string;
                    }
                }
            } => item !== null);

        updateBatchTranslationMutation.mutate(localizations, {
            onSuccess: () => {
                setIsBulkEditing(false);
                setSelectedKeys([]);
                setBulkEditValues({});
            }
        });
    };

    const handleBulkCancel = () => {
        setIsBulkEditing(false);
        setBulkEditValues({});
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
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-stone-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by key, description or value..."
                            className="w-full pl-10 pr-4 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-stone-50 dark:bg-stone-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedKeys.length > 0 && !isBulkEditing && (
                            <button
                                onClick={handleBulkEdit}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Edit Selected ({selectedKeys.length})
                            </button>
                        )}
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Plus className="w-4 h-4" />
                            Add Translation
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Edit Area */}
            {isBulkEditing && (
                <div className="bg-white dark:bg-stone-800 shadow rounded-lg p-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                Editing {selectedKeys.length} items
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleBulkSave}
                                    disabled={updateBatchTranslationMutation.isPending}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {updateBatchTranslationMutation.isPending ? 'Saving...' : 'Save All'}
                                </button>
                                <button
                                    onClick={handleBulkCancel}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {selectedKeys.map(keyId => {
                                const keyData = translationKeys.find(key => key.id === keyId);
                                if (!keyData) return null;
                                
                                return (
                                    <div key={keyId} className="flex items-center gap-4">
                                        <span className="w-1/3 text-sm text-gray-600">{keyData.key}</span>
                                        <input
                                            type="text"
                                            value={bulkEditValues[keyId] || ''}
                                            onChange={(e) => setBulkEditValues(prev => ({
                                                ...prev,
                                                [keyId]: e.target.value
                                            }))}
                                            placeholder={`Enter value for ${keyData.key}`}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Translation Keys List / Editor Area */}
            <section className="flex-grow bg-white dark:bg-stone-800 shadow rounded-lg p-4 lg:p-6">
                <h2 className="text-xl font-semibold mb-4 text-stone-700 dark:text-stone-300">
                    Translation Management Area
                </h2>
                <div className="container mx-auto py-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-700">
                            <thead className="bg-stone-50 dark:bg-stone-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                        <input
                                            type="checkbox"
                                            checked={selectedKeys.length === filteredTranslationKeys.length}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            className="rounded border-stone-300 dark:border-stone-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-stone-700"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Key</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                        {activeLanguage.code.toUpperCase()}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-stone-800 divide-y divide-stone-200 dark:divide-stone-700">
                                {paginatedKeys.map((key) => (
                                    <tr key={key.id} className="hover:bg-stone-50 dark:hover:bg-stone-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedKeys.includes(key.id)}
                                                onChange={(e) => handleSelectKey(key.id, e.target.checked)}
                                                className="rounded border-stone-300 dark:border-stone-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-stone-700"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 dark:text-stone-100">{key.key}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 dark:text-stone-100">{key.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 dark:text-stone-100">{key.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 dark:text-stone-100">
                                            {editingCell?.keyId === key.id && editingCell?.languageCode === activeLanguage.code ?
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
                                                        disabled={updateTranslationMutation.isPending}
                                                    />
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={handleSave}
                                                            className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 focus:outline-none disabled:opacity-50"
                                                            disabled={updateTranslationMutation.isPending}
                                                        >
                                                            {updateTranslationMutation.isPending ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                "✓"
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={handleCancel}
                                                            className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 focus:outline-none disabled:opacity-50"
                                                            disabled={updateTranslationMutation.isPending}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            :
                                                <div className="flex items-center gap-2">
                                                    <span>{key.translations[activeLanguage.code]?.value}</span>
                                                    <button
                                                        onClick={() => handleEdit(key.id, activeLanguage.code, key.translations[activeLanguage.code]?.value || "")}
                                                        className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 focus:outline-none"
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
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between px-4 py-3 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 sm:px-6">
                            <div className="flex items-center">
                                <p className="text-sm text-stone-700 dark:text-stone-300">
                                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                    <span className="font-medium">
                                        {Math.min(startIndex + rowsPerPage, filteredTranslationKeys.length)}
                                    </span>{' '}
                                    of <span className="font-medium">{filteredTranslationKeys.length}</span> results
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center space-x-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                                                currentPage === page
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-600'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
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