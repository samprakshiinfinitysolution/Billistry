// lib/init-middleware.ts
import { IncomingMessage, ServerResponse } from 'http';

type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (result: unknown) => void
) => void;

export default function initMiddleware(middleware: Middleware) {
  return async (req: IncomingMessage, res: ServerResponse) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result: unknown) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}
