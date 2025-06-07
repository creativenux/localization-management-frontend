import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ILanguage {
  name: string;
  code: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getLanguages = async (): Promise<ILanguage[]> => {
    try {
        const response = await fetch(`${BASE_URL}/languages`);
        if (!response.ok) {
            throw new Error('Failed to fetch languages');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching languages:', error);
        throw error;
    }
};

const createLanguage = async (language: ILanguage): Promise<ILanguage> => {
    try {
        const response = await fetch(`${BASE_URL}/languages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(language),
        });

        if (!response.ok) {
            throw new Error('Failed to create language');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating language:', error);
        throw error;
    }
};

// React Query hooks
export const useLanguages = () => {
    return useQuery({
        queryKey: ['languages'],
        queryFn: getLanguages,
    });
};

export const useCreateLanguage = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createLanguage,
        onSuccess: () => {
            // Invalidate and refetch languages after creating a new one
            queryClient.invalidateQueries({ queryKey: ['languages'] });
        },
    });
};
