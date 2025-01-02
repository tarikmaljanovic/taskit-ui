// src/api/queries/useProjects.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../axiosClient';
import { Project } from '../../types/Project';  // Replace with your actual project interface
import { User } from '../../types/User';        // Replace with your actual user interface

/***********************************
 * Minimal interfaces for payloads
 ***********************************/
interface CreateProjectPayload {
  name: string;
  description?: string;
  created_by: number;  // the user ID
}

interface UpdateProjectPayload {
  id: number;        // the project ID
  name?: string;
  description?: string;
  created_by?: number;
  // Add more fields as needed
}

/***********************************
 * 1) GET /api/projects (All Projects)
 ***********************************/
export function useAllProjects() {
  return useQuery<Project[]>({
    queryKey: ['allProjects'],
    queryFn: async () => {
      const response = await axiosClient.get<Project[]>('/api/projects');
      return response.data;
    },
  });
}

/***********************************
 * 2) GET /api/projects/{id} (Project By ID)
 ***********************************/
export function useProjectById(id?: number) {
  return useQuery<Project | null>({
    queryKey: ['projectById', id],
    queryFn: async () => {
      if (!id) return null; 
      const response = await axiosClient.get<Project>(`/api/projects/${id}`);
      return response.data;
    },
    enabled: !!id, 
  });
}

/***********************************
 * 3) GET /api/projects/my-projects/{id} 
 *    (Projects user is a member of)
 ***********************************/
export function useMyProjects(userId?: number) {
  return useQuery<Project[]>({
    queryKey: ['myProjects', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await axiosClient.get<Project[]>(`/api/projects/my-projects/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
}

/***********************************
 * 4) GET /api/projects/owned-projects/{id} 
 *    (Projects created by user)
 ***********************************/
export function useOwnedProjects(userId?: number) {
  return useQuery<Project[]>({
    queryKey: ['ownedProjects', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await axiosClient.get<Project[]>(`/api/projects/owned-projects/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
}

/***********************************
 * 5) GET /api/projects/members/{id} 
 *    (Get all members of a project)
 ***********************************/
export function useProjectMembers(projectId?: number) {
  return useQuery<User[]>({
    queryKey: ['projectMembers', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await axiosClient.get<User[]>(`/api/projects/members/${projectId}`);
      return response.data;
    },
    enabled: !!projectId,
  });
}

/***********************************
 * 6) GET /api/projects/created-by/{id} 
 *    (Get project owner)
 ***********************************/
export function useProjectOwner(projectId?: number) {
  return useQuery<User | null>({
    queryKey: ['projectOwner', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const response = await axiosClient.get<User>(`/api/projects/created-by/${projectId}`);
      return response.data;
    },
    enabled: !!projectId,
  });
}

/***********************************
 * 7) POST /api/projects/add-member/{projectId}/{userId}
 ***********************************/
interface AddMemberVariables {
  projectId: number;
  userId: number;
}

export function useAddMemberToProject() {
  const queryClient = useQueryClient();

  return useMutation<User[], Error, AddMemberVariables>({
    mutationFn: async ({ projectId, userId }: AddMemberVariables) => {
      const response = await axiosClient.post<User[]>(
        `/api/projects/add-member/${projectId}/${userId}`
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate to refresh project members or other relevant queries
      queryClient.invalidateQueries({ queryKey: ['projectMembers', variables.projectId] });
    },
  });
}

/***********************************
 * 8) POST /api/projects (Create Project)
 ***********************************/
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, CreateProjectPayload>(
    {
      mutationFn: async (payload: CreateProjectPayload) => {
        const response = await axiosClient.post<Project>('/api/projects', payload);
        return response.data;
      },
      onSuccess: () => {
        // e.g., Refresh "allProjects", "myProjects", or "ownedProjects"
        queryClient.invalidateQueries({ queryKey: ['allProjects'] });
        queryClient.invalidateQueries({ queryKey: ['myProjects'] });
        queryClient.invalidateQueries({ queryKey: ['ownedProjects'] });
      },
    }
  );
}

/***********************************
 * 9) PUT /api/projects (Update Project)
 ***********************************/
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, UpdateProjectPayload>({
    mutationFn: async (payload) => {
      // Usually, the backend expects the entire updated project object
      // which includes the ID. Adjust the request body as needed.
      const response = await axiosClient.put<Project>('/api/projects', payload);
      return response.data;
    },
    onSuccess: (updatedProject) => {
      // Refresh queries referencing this project
      queryClient.invalidateQueries({ queryKey: ['projectById', updatedProject.id] });
      queryClient.invalidateQueries({ queryKey: ['allProjects'] });
      queryClient.invalidateQueries({ queryKey: ['myProjects'] });
      queryClient.invalidateQueries({ queryKey: ['ownedProjects'] });
    },
  });
}

/***********************************
 * 10) DELETE /api/projects/{id} (Delete Project)
 ***********************************/
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (projectId) => {
      await axiosClient.delete(`/api/projects/${projectId}`);
    },
    onSuccess: (data, projectId) => {
      // Refresh any queries that may include this project
      queryClient.invalidateQueries({ queryKey: ['allProjects'] });
      queryClient.invalidateQueries({ queryKey: ['myProjects'] });
      queryClient.invalidateQueries({ queryKey: ['ownedProjects'] });
      queryClient.invalidateQueries({ queryKey: ['projectById', projectId] });
    },
  });
}
