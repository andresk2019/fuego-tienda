// Protege todas las rutas /admin/* — si no hay una sesión válida,
// redirige al login. (Antes se llamaba `middleware.ts`; Next.js 16 lo
// renombró a `proxy.ts` y ahora corre en runtime de Node.js por
// defecto, no Edge.)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verificarToken, NOMBRE_COOKIE_SESION } from '@/lib/auth';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get(NOMBRE_COOKIE_SESION)?.value;
  if (!verificarToken(token)) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
