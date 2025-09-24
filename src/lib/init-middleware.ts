// lib/init-middleware.ts
export default function initMiddleware(
  middleware: (req: any, res: any, next: (result?: unknown) => void) => void
) {
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
