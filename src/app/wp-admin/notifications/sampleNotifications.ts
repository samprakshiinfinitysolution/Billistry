export const sampleNotifications = [
  { id: 'n1', type: 'success', title: 'Payment received', message: 'Payment of ₹5,000 received from Rahul.', time: '2 minutes ago', unread: true },
  { id: 'n2', type: 'warning', title: 'Subscription expiring', message: 'Standard plan for Durgesh will expire in 3 days.', time: '1 hour ago', unread: true },
  { id: 'n3', type: 'info', title: 'New feature', message: 'Invoice QR codes are now available in Beta.', time: 'Yesterday', unread: false },
  { id: 'n4', type: 'success', title: 'Backup completed', message: 'Cloud backup completed successfully.', time: '2 days ago', unread: false },
  { id: 'n5', type: 'warning', title: 'Failed sync', message: 'Failed to sync with vendor API. Retrying.', time: '3 days ago', unread: true },
];

export type NotificationItem = typeof sampleNotifications[number];
