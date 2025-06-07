'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useProjects, useCreateProject, IProject } from '../services/project-service';
import { useProjectStore } from '../store/project-store';

export default function ProjectSelector() {
    const { data: projects = [], isLoading } = useProjects();
    const createProjectMutation = useCreateProject();
    const { activeProject, setActiveProject } = useProjectStore((state) => state);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newProject, setNewProject] = useState<{ name: string }>({
        name: '',
    });

    useEffect(() => {
        if (projects.length > 0 && !activeProject) {
            setActiveProject(projects[0]);
        }
    }, [projects, activeProject, setActiveProject]);

    const handleProjectSelect = (project: IProject) => {
        setActiveProject(project);
    };

    const handleAddProject = () => {
        if (newProject.name) {
            createProjectMutation.mutate(newProject, {
                onSuccess: () => {
                    setNewProject({ name: '' });
                    setIsAddingNew(false);
                },
            });
        }
    };

    if (isLoading) {
        return <div>Loading projects...</div>;
    }

    return (
        <div className="w-full max-w-md">
            <ul className="space-y-2">
                {projects.map((project: IProject, index: number) => (
                    <li
                        key={index}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            activeProject?.id === project.id
                                ? 'bg-blue-100 dark:bg-blue-900'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => handleProjectSelect(project)}
                    >
                        <span className="text-sm font-medium">{project.name}</span>
                    </li>
                ))}
                
                {isAddingNew ? (
                    <li className="p-2 border rounded-lg">
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Project name"
                                className="w-full p-1 text-sm border rounded bg-white dark:bg-stone-700 border-stone-300 dark:border-stone-600 text-stone-900 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400"
                                value={newProject.name}
                                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddProject}
                                    disabled={createProjectMutation.isPending}
                                    className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                                >
                                    {createProjectMutation.isPending ? 'Adding...' : 'Add'}
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
                            Add new project
                        </button>
                    </li>
                )}
            </ul>
        </div>
    );
}
