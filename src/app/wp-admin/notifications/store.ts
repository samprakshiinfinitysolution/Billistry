export type NotificationItem = {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

let notifications: NotificationItem[] = [];

const emitter = new EventTarget();

export async function fetchNotifications(): Promise<NotificationItem[]> {
  try {
    // In a real app, you'd fetch from your API endpoint
    const response = await fetch('/api/notifications'); // Example API endpoint
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    const data = await response.json();
    notifications = data.notifications || [];
    emitter.dispatchEvent(new CustomEvent('notificationsUpdated'));
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    // Return cached notifications on error or an empty array
    return notifications.slice();
  }
}

export function getUnreadCount() {
  return notifications.filter(n => n.unread).length;
}

export async function markAsRead(id: string): Promise<void> {
  // Optimistic UI update
  const originalNotifications = [...notifications];
  notifications = notifications.map(n => (n.id === id ? { ...n, unread: false } : n));
  emitter.dispatchEvent(new CustomEvent('notificationsUpdated'));

  try {
    const response = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to mark as read');
  } catch (error) {
    // Revert on error
    notifications = originalNotifications;
    emitter.dispatchEvent(new CustomEvent('notificationsUpdated'));
    console.error("Failed to mark notification as read:", error);
    throw error; // Re-throw to be caught in the component
  }
}

export async function markAllAsRead(): Promise<void> {
  // Optimistic UI update
  const originalNotifications = [...notifications];
  notifications = notifications.map(n => ({ ...n, unread: false }));
  emitter.dispatchEvent(new CustomEvent('notificationsUpdated'));

  try {
    const response = await fetch('/api/notifications/read-all', { method: 'POST' });
    if (!response.ok) throw new Error('Failed to mark all as read');
  } catch (error) {
    // Revert on error
    notifications = originalNotifications;
    emitter.dispatchEvent(new CustomEvent('notificationsUpdated'));
    console.error("Failed to mark all notifications as read:", error);
    throw error; // Re-throw to be caught in the component
  }
}

export function addNotification(item: Omit<NotificationItem, 'id' | 'time' | 'unread'>) {
  const id = `n${Date.now()}`;
  const time = 'Just now';
  const newItem: NotificationItem = { id, time, unread: true, ...item };
  notifications = [newItem, ...notifications];
  emitter.dispatchEvent(new CustomEvent('notificationsUpdated'));
}

export function subscribe(cb: (items: NotificationItem[]) => void) {
  const handler = () => cb(notifications.slice());
  emitter.addEventListener('notificationsUpdated', handler as EventListener);
  // initial call with current data
  cb(notifications.slice());
  return () => emitter.removeEventListener('notificationsUpdated', handler as EventListener);
}
