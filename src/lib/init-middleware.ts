// lib/init-middleware.ts
<<<<<<< HEAD
export default function initMiddleware(
  middleware: (req: any, res: any, next: (result?: unknown) => void) => void
) {
=======
export default function initMiddleware(middleware: Function) {
>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1
  return async (req: any, res: any) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result: unknown) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}
