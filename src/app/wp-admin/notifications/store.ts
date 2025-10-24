type NotificationItem = {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

let notifications: NotificationItem[] = [
  { id: 'n1', type: 'success', title: 'Payment received', message: 'Payment of ₹5,000 received from Rahul.', time: '2 minutes ago', unread: true },
  { id: 'n2', type: 'warning', title: 'Subscription expiring', message: 'Standard plan for Durgesh will expire in 3 days.', time: '1 hour ago', unread: true },
  { id: 'n3', type: 'info', title: 'New feature', message: 'Invoice QR codes are now available in Beta.', time: 'Yesterday', unread: false },
  { id: 'n4', type: 'success', title: 'Backup completed', message: 'Cloud backup completed successfully.', time: '2 days ago', unread: false },
  { id: 'n5', type: 'warning', title: 'Failed sync', message: 'Failed to sync with vendor API. Retrying.', time: '3 days ago', unread: true },
];

const emitter = new EventTarget();

export function getNotifications() {
  return notifications.slice();
}

export function getUnreadCount() {
  return notifications.filter(n => n.unread).length;
}

export function markAsRead(id: string) {
  notifications = notifications.map(n => n.id === id ? { ...n, unread: false } : n);
  emitter.dispatchEvent(new CustomEvent('notificationsUpdated'));
}

export function markAllRead() {
  notifications = notifications.map(n => ({ ...n, unread: false }));
  emitter.dispatchEvent(new CustomEvent('notificationsUpdated'));
}

export function addNotification(item: Omit<NotificationItem, 'id' | 'time' | 'unread'>) {
  const id = `n${Date.now()}`;
  const time = 'Just now';
  const newItem: NotificationItem = { id, time, unread: true, ...item } as NotificationItem;
  notifications = [newItem, ...notifications];
  emitter.dispatchEvent(new CustomEvent('notificationsUpdated'));
}

export function subscribe(cb: (items: NotificationItem[]) => void) {
  const handler = () => cb(getNotifications());
  emitter.addEventListener('notificationsUpdated', handler as EventListener);
  // initial
  cb(getNotifications());
  return () => emitter.removeEventListener('notificationsUpdated', handler as EventListener);
}

export type { NotificationItem };
