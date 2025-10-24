


// // hooks/useGuestGuard.ts
// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter, usePathname } from 'next/navigation';

// export default function useGuestGuard() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const res = await fetch('/api/auth/me', { credentials: 'include' });
//         if (!res.ok) throw new Error('Not authenticated');
//         const data = await res.json();

//         // ✅ if user is logged in, redirect away from guest pages
//         if (data?.userId && pathname !== '/dashboard') {
//           router.replace('/dashboard');
//         }
//       } catch {
//         // no redirect if guest → they stay on login/signup
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuth();
//   }, [pathname, router]);

//   return loading; // useful to show a loader while checking
// }


// hooks/useGuestGuard.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  userId: string;
  role: 'superadmin' | 'shopkeeper' | 'staff';
}

export default function useGuestGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) throw new Error('Not authenticated');
        const data: User = await res.json();

        if (data?.userId) {
          // ✅ Role-based redirect
          let redirectPath = '/dashboard';

          switch (data.role) {
            case 'superadmin':
              redirectPath = '/admin';
              break;
            case 'shopkeeper':
              redirectPath = '/dashboard';
              break;
            case 'staff':
              redirectPath = '/staff';
              break;
          }

          if (pathname !== redirectPath) {
            router.replace(redirectPath);
          }
        }
      } catch {
        // guest → stay on login/signup
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  return loading; // can show <Loader /> while checking
}
