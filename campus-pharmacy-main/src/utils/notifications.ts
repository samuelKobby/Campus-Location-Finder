import { supabase } from '../lib/supabase';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface CreateNotificationParams {
  title: string;
  message: string;
  type: NotificationType;
  pharmacy_id?: string;
}

/**
 * Creates a notification in the database
 * @param data Notification data including title, message, type, and optional pharmacy_id
 * @returns Promise that resolves when the notification is created
 */
export const createNotification = async (data: CreateNotificationParams): Promise<void> => {
  try {
    console.log('Creating notification:', data);
    
    const notificationData = {
      title: data.title,
      message: data.message,
      type: data.type,
      pharmacy_id: data.pharmacy_id || null,
      created_at: new Date().toISOString()
    };
    
    console.log('Notification data to insert:', notificationData);
    
    const { data: result, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select();

    if (error) {
      console.error('Error creating notification:', error);
    } else {
      console.log('Notification created successfully:', result);
    }
  } catch (err) {
    console.error('Error in createNotification:', err);
  }
};
