import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface IProject {
  id: string;
  name: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getProjects = async (): Promise<IProject[]> => {
    try {
        const response = await fetch(`${BASE_URL}/projects`);
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }
};

const createProject = async (project: { name: string }): Promise<IProject> => {
    try {
        const response = await fetch(`${BASE_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(project),
        });

        if (!response.ok) {
            throw new Error('Failed to create project');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
};

// React Query hooks
export const useProjects = () => {
    return useQuery({
        queryKey: ['projects'],
        queryFn: getProjects,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: false,
        // staleTime: Infinity
    });
};

export const useCreateProject = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            // Invalidate and refetch projects after creating a new one
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}; 