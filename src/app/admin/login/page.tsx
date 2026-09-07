import LoginForm from '@/components/admin/LoginForm';
import FlameIcon from '@/components/FlameIcon';

export const metadata = {
  title: 'Ingresar | Fuego',
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-12">
      <div className="flex flex-col items-center gap-2">
        <FlameIcon className="h-8 w-8 text-ember" />
        <h1 className="font-serif text-2xl text-foreground">
          Panel de Fuego
        </h1>
      </div>
      <LoginForm />
    </main>
  );
}
