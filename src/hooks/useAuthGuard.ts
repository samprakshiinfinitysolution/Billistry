


// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter, usePathname } from 'next/navigation';

// interface User {
//   userId: string;
//   businessId: string | null;
//   businessName?: string;
//   name: string;
//   email?: string;
//   phone?: string;
//   role: 'superadmin' | 'shopkeeper' | 'staff';
//   permissions?: string[]; // ✅ add permissions from JWT
// }

// export default function useAuthGuard(requiredPermissions?: string[]) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState<User | null>(null);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const res = await fetch('/api/auth/me', { credentials: 'include' });
//         if (!res.ok) throw new Error('Not authenticated');

//         const data: User = await res.json();
//         if (!data || !data.userId) throw new Error('Not authenticated');

//         // ✅ Permissions check
//         if (requiredPermissions?.length) {
//           const hasPermission = requiredPermissions.every((p) =>
//             data.permissions?.includes(p)
//           );
//           if (!hasPermission) {
//             router.replace('/403'); // redirect to forbidden page
//             return;
//           }
//         }

//         setUser(data);
//       } catch {
//         // Public routes (like landing, signup, etc.)
//         if (!['/', '/login', '/signup'].includes(pathname)) {
//           router.replace('/login');
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuth();
//   }, [pathname, router, requiredPermissions]);

//   return { loading, user };
// }








'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  userId: string;
  businessId: string | null;
  businessName?: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'superadmin' | 'shopkeeper' | 'staff';
  permissions: string[]; // ✅ flattened from backend (e.g. ["staff.read", "products.create"])
}

export default function useAuthGuard(requiredPermissions?: string[]) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) throw new Error('Not authenticated');

        const data: User | null = await res.json();
        if (!data || !data.userId) throw new Error('Not authenticated');

        // ✅ Permission check
        if (requiredPermissions?.length) {
          const hasPermission = requiredPermissions.every((perm) =>
            data.permissions?.includes(perm)
          );
          if (!hasPermission) {
            router.replace('/403'); // redirect forbidden
            return;
          }
        }

        setUser(data);
      } catch {
        // 🚪 Redirect unauthenticated (except public routes)
        const publicRoutes = ['/', '/login', '/signup'];
        if (!publicRoutes.includes(pathname)) {
          router.replace('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router, requiredPermissions]);

  return { loading, user };
}
