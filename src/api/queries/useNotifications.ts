// src/api/queries/useNotifications.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../axiosClient.ts';
import { Notification } from '../../types/Notification.ts'; // Adjust to your actual interface

/***********************************
 * Minimal interfaces for payloads
 ***********************************/
interface CreateNotificationPayload {
  // Match the fields your NotificationDTO expects
  message: string; 
  recipientId: number; // or "recipientId"
  // e.g. timestamp?: string; etc.
}

interface UpdateNotificationPayload {
  id: number;  // for the /{id} path variable
  message?: string;
  recipientId?: number;
  // e.g. timestamp?: string; etc.
}

/***********************************
 * 1) GET /api/notifications
 *    (All Notifications)
 ***********************************/
export function useAllNotifications() {
  return useQuery<Notification[]>({
    queryKey: ['allNotifications'],
    queryFn: async () => {
      const response = await axiosClient.get<Notification[]>('/api/notifications');
      return response.data;
    },
  });
}

/***********************************
 * 2) GET /api/notifications/{id}
 *    (Notification By ID)
 ***********************************/
export function useNotificationById(id?: number) {
  return useQuery<Notification | null>({
    queryKey: ['notificationById', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosClient.get<Notification | null>(`/api/notifications/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

/***********************************
 * 3) GET /api/notifications/user/{id}
 *    (Notifications by recipient user ID)
 ***********************************/
export function useUserNotifications(userId?: number) {
  return useQuery<Notification[]>({
    queryKey: ['userNotifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await axiosClient.get<Notification[]>(
        `/api/notifications/user/${userId}`
      );
      return response.data;
    },
    enabled: !!userId,
  });
}

/***********************************
 * 4) POST /api/notifications
 *    (Create Notification)
 ***********************************/
export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation<Notification, Error, CreateNotificationPayload>({
    mutationFn: async (payload) => {
      const response = await axiosClient.post<Notification>('/api/notifications', payload);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh the list of notifications if needed
      queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
      // If you have "userNotifications" for a specific user, you can invalidate that, e.g.:
      // queryClient.invalidateQueries({ queryKey: ['userNotifications', payload.recipientId] });
    },
  });
}

/***********************************
 * 5) PUT /api/notifications/{id}
 *    (Update Notification)
 ***********************************/
export function useUpdateNotification() {
  const queryClient = useQueryClient();

  return useMutation<Notification, Error, UpdateNotificationPayload>({
    mutationFn: async ({ id, ...rest }) => {
      // The path param is {id}, request body is NotificationDTO
      const response = await axiosClient.put<Notification>(`/api/notifications/${id}`, rest);
      return response.data;
    },
    onSuccess: (updated) => {
      // Refresh relevant queries
      queryClient.invalidateQueries({ queryKey: ['notificationById', updated.id] });
      queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
      // e.g. If you know the user ID, you can also invalidate ['userNotifications', userId].
    },
  });
}

/***********************************
 * 6) DELETE /api/notifications/{id}
 *    (Delete Notification)
 ***********************************/
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (notificationId) => {
      await axiosClient.delete(`/api/notifications/${notificationId}`);
    },
    onSuccess: (data, notificationId) => {
      // Invalidate queries referencing notifications
      queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationById', notificationId] });
      // If you know the user who got this notification, you can invalidate ['userNotifications', userId].
    },
  });
}
