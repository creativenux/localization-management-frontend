import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IProject } from '../services/project-service';

interface ProjectState {
    activeProject: IProject | null;
    projects: IProject[];
    setActiveProject: (project: IProject) => void;
    setProjects: (projects: IProject[]) => void;
    updateProject: (project: IProject) => void;
    addProject: (project: IProject) => void;
}

export const useProjectStore = create<ProjectState>()(
    persist(
        (set) => ({
            activeProject: null,
            projects: [],
            setActiveProject: (project: IProject) => {
                set((state) => ({ ...state, activeProject: project }));
            },
            setProjects: (projects: IProject[]) => {
                set((state) => ({ ...state, projects }));
            },
            updateProject: (project: IProject) => {
                set((state) => ({
                    ...state,
                    projects: state.projects.map((p) => p.id === project.id ? project : p),
                }));
            },
            addProject: (project: IProject) => {
                set((state) => ({
                    ...state,
                    projects: [...state.projects, project],
                }));
            },
        }),
        {
            name: 'project-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
); 