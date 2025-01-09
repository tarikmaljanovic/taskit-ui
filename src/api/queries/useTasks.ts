// src/api/queries/useTasks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../axiosClient';
import { Task } from '../../types/Task'; // Adjust this import path as needed

/***********************************
 * Minimal interfaces for TaskDTO payloads
 ***********************************/
interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  project: number;   // or whatever fields you need
  assigned_to?: number; // if needed
  due_date?: string;   // added due_date
}

interface UpdateTaskPayload {
  id: number;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  project?: number;
  assigned_to?: number;
  due_date?: string;   // added due_date
}

/***********************************
 * 1) GET /api/tasks 
 *    (All Tasks)
 ***********************************/
export function useAllTasks() {
  return useQuery<Task[]>({
    queryKey: ['allTasks'],
    queryFn: async () => {
      const response = await axiosClient.get<Task[]>('/api/tasks');
      return response.data;
    },
  });
}

/***********************************
 * 2) GET /api/tasks/{id} 
 *    (Task By ID)
 ***********************************/
export function useTaskById(id?: number) {
  return useQuery<Task | null>({
    queryKey: ['taskById', id],
    queryFn: async () => {
      if (!id) return null;
      // Returns Optional<Task> on the server, handle null if needed
      const response = await axiosClient.get<Task | null>(`/api/tasks/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

/***********************************
 * 3) GET /api/tasks/assigned-to/{id} 
 *    (Tasks assigned to a user)
 ***********************************/
export function useUserTasks(userId?: number) {
  return useQuery<Task[]>({
    queryKey: ['userTasks', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await axiosClient.get<Task[]>(`/api/tasks/assigned-to/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
}

/***********************************
 * 4) GET /api/tasks/by-project/{id} 
 *    (Tasks belonging to a project)
 ***********************************/
export function useProjectTasks(projectId?: number) {
  return useQuery<Task[]>({
    queryKey: ['projectTasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await axiosClient.get<Task[]>(`/api/tasks/by-project/${projectId}`);
      return response.data;
    },
    enabled: !!projectId,
  });
}

/***********************************
 * 5) POST /api/tasks 
 *    (Create Task)
 ***********************************/
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, CreateTaskPayload>({
    mutationFn: async (payload) => {
      const response = await axiosClient.post<Task>('/api/tasks', payload);
      return response.data;
    },
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['taskById'] });
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
    },
  });
}

/***********************************
 * 6) POST /api/tasks/generate-priority 
 *    (Generate a priority for a given description)
 ***********************************/
export function useGeneratePriority() {
  // This endpoint returns a string
  return useMutation<string, Error, string>({
    mutationFn: async (description) => {
      const response = await axiosClient.post<string>('/api/tasks/generate-priority', description, {
        headers: { 'Content-Type': 'text/plain' },
      });
      return response.data;
    },
  });
}

/***********************************
 * 7) PUT /api/tasks 
 *    (Update Task)
 ***********************************/
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, UpdateTaskPayload>({
    mutationFn: async (payload) => {
      const response = await axiosClient.put<Task>('/api/tasks', payload);
      return response.data;
    },
    onSuccess: (updatedTask) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['taskById', updatedTask.id] });
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      // If your Task interface includes assigned_to and project
      if (updatedTask.assigned_to !== undefined) {
        queryClient.invalidateQueries({ queryKey: ['userTasks', updatedTask.assigned_to] });
      }
      if (updatedTask.project !== undefined) {
        queryClient.invalidateQueries({ queryKey: ['projectTasks', updatedTask.project] });
      }
    },
  });
}

/***********************************
 * 8) PUT /api/tasks/status-update/{status}/{id}
 ***********************************/
interface UpdateStatusVariables {
  taskId: number;
  status: string;
}
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, UpdateStatusVariables>({
    mutationFn: async ({ taskId, status }) => {
      const response = await axiosClient.put<Task>(
        `/api/tasks/status-update/${status}/${taskId}`
      );
      return response.data;
    },
    onSuccess: (updatedTask, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['taskById', taskId] });
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      if (updatedTask.assigned_to !== undefined) {
        queryClient.invalidateQueries({ queryKey: ['userTasks', updatedTask.assigned_to] });
      }
      if (updatedTask.project !== undefined) {
        queryClient.invalidateQueries({ queryKey: ['projectTasks', updatedTask.project] });
      }
    },
  });
}

/***********************************
 * 9) PUT /api/tasks/priority-update/{priority}/{id}
 ***********************************/
interface UpdatePriorityVariables {
  taskId: number;
  priority: string;
}
export function useUpdateTaskPriority() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, UpdatePriorityVariables>({
    mutationFn: async ({ taskId, priority }) => {
      const response = await axiosClient.put<Task>(
        `/api/tasks/priority-update/${priority}/${taskId}`
      );
      return response.data;
    },
    onSuccess: (updatedTask, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['taskById', taskId] });
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      if (updatedTask.assigned_to !== undefined) {
        queryClient.invalidateQueries({ queryKey: ['userTasks', updatedTask.assigned_to] });
      }
      if (updatedTask.project !== undefined) {
        queryClient.invalidateQueries({ queryKey: ['projectTasks', updatedTask.project] });
      }
    },
  });
}

/***********************************
 * 10) DELETE /api/tasks/{id} 
 *     (Delete Task By ID)
 ***********************************/
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (taskId) => {
      await axiosClient.delete(`/api/tasks/${taskId}`);
    },
    onSuccess: (data, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['taskById', taskId] });
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
      // If your data model includes user or project references,
      // you can also invalidate those queries here as well.
    },
  });
}

/***********************************
 * 11) GET /api/tasks/filter/{projectId}/{filter}
 *     (Filter Project Tasks)
 ***********************************/
export function useFilterProjectTasks(projectId: number, filter: string) {
  return useQuery<Task[]>({
    queryKey: ['filterProjectTasks', projectId, filter],
    queryFn: async () => {
      const response = await axiosClient.get<Task[]>(`/api/tasks/filter/${projectId}/${filter}`);
      return response.data;
    },
  });
}
