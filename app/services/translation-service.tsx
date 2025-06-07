import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface TranslationValue {
    value: string;
    updated_at: string;
    updated_by: string;
}

export interface TranslationKey {
    id: number;
    key: string;
    category: string;
    description?: string;
    translations: {
        [languageCode: string]: TranslationValue;
    };
    project_id: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getTranslations = async (projectId: string): Promise<TranslationKey[]> => {
    try {
        const response = await fetch(`${BASE_URL}/localizations/${projectId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch translations');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching translations:', error);
        throw error;
    }
};

const updateTranslation = async (
    projectId: string, 
    localization_id: number,
    translations: {
        [key: string]: {
            value: string;
            updated_at: string;
            updated_by: string;
        }
    }
): Promise<TranslationKey> => {
    try {
        const response = await fetch(`${BASE_URL}/localizations/${projectId}/${localization_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                translations
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to update translation');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating translation:', error);
        throw error;
    }
};

const createTranslation = async (
    projectId: string,
    data: {
        key: string;
        category: string;
        description?: string;
        translations: {
            [languageCode: string]: {
                value: string;
            }
        }
    }
): Promise<TranslationKey> => {
    try {
        const response = await fetch(`${BASE_URL}/localizations/${projectId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to create translation');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating translation:', error);
        throw error;
    }
};

// React Query hooks
export const useTranslations = (projectId: string) => {
    return useQuery({
        queryKey: ['translations', projectId],
        queryFn: () => getTranslations(projectId),
        enabled: !!projectId,
    });
};

export const useUpdateTranslation = (projectId: string) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ 
            localization_id,
            translations
        }: { 
            localization_id: number; 
            translations: {
                [key: string]: {
                    value: string;
                    updated_at: string;
                    updated_by: string;
                }
            }
        }) => updateTranslation(
            projectId, 
            localization_id,
            translations
        ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['translations', projectId] });
        },
    });
};

export const useCreateTranslation = (projectId: string) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: {
            key: string;
            category: string;
            description?: string;
            translations: {
                [languageCode: string]: {
                    value: string;
                }
            }
        }) => createTranslation(projectId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['translations', projectId] });
        },
    });
}; 