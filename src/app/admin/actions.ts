'use server';

import { redirect } from 'next/navigation';
import { eliminarSesion } from '@/lib/session';

export async function cerrarSesion() {
  await eliminarSesion();
  redirect('/admin/login');
}
