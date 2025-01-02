// src/api/queries/useUser.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../axiosClient';
import { User } from '../../types/User'; // Adjust import path as needed

/***********************************
 * Minimal Payload Interfaces
 ***********************************/
interface LoginPayload {
  email: string;
  password: string;
}

interface CreateUserPayload {
    name: string;
    email: string;
    password: string;
    role: string;
}

interface UpdateUserPayload extends Partial<CreateUserPayload> {
  id: number; // user ID
  // Add any additional fields your backend expects for updating a user
}

/***********************************
 * 1) GET /api/users (Get All Users)
 ***********************************/
export function useAllUsers() {
  return useQuery<User[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const response = await axiosClient.get<User[]>('/api/users');
      return response.data;
    },
  });
}

/***********************************
 * 2) GET /api/users/{id} (Get User by ID)
 ***********************************/
export function useUserById(id?: number) {
  return useQuery<User | null>({
    queryKey: ['userById', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosClient.get<User>(`/api/users/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

/***********************************
 * 3) GET /api/users/email-{email} (Get User by Email)
 ***********************************/
export function useUserByEmail(email?: string) {
  return useQuery<User | null>({
    queryKey: ['userByEmail', email],
    queryFn: async () => {
      if (!email) return null;
      const response = await axiosClient.get<User>(`/api/users/email-${email}`);
      return response.data;
    },
    enabled: !!email,
  });
}

/***********************************
 * 4) POST /api/users/login (Login)
 *    Returns Optional<User>
 ***********************************/
export function useLogin() {
  return useMutation<User | null, Error, LoginPayload>({
    mutationFn: async ({ email, password }: LoginPayload) => {
      const response = await axiosClient.post<User | null>('/api/users/login', {
        email,
        password,
      });
      return response.data;
    },
  });
}

/***********************************
 * 5) POST /api/users (Create User)
 ***********************************/
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, CreateUserPayload>({
    mutationFn: async (payload) => {
      const response = await axiosClient.post<User>('/api/users', payload);
      return response.data;
    },
    onSuccess: () => {
      // e.g., refresh all users or other relevant queries
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

/***********************************
 * 6) PUT /api/users/{id} (Update User)
 ***********************************/
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateUserPayload>({
    mutationFn: async (payload) => {
      // Extract user ID from payload
      const { id, ...rest } = payload;
      // Adjust if your backend expects a specific request body shape
      const response = await axiosClient.put<User>(`/api/users/${id}`, rest);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      // Invalidate queries that may be affected
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userById', updatedUser.id] });
      // If your logic needs to update "userByEmail", you can re-fetch that too
    },
  });
}

/***********************************
 * 7) DELETE /api/users/{id} (Delete User)
 ***********************************/
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (userId) => {
      await axiosClient.delete(`/api/users/${userId}`);
    },
    onSuccess: (data, userId) => {
      // Invalidate queries referencing this user
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userById', userId] });
      // If you want to handle "userByEmail" or others, add them here
    },
  });
}
