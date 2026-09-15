import FlameIcon from "@/components/FlameIcon";

export const metadata = {
  title: "Cuidado de las velas | Fuego",
  description:
    "Cómo cuidar y quemar tus velas de Fuego de forma segura, y sacarles el mejor provecho.",
};

// Plantilla inicial (2026-09-15) — recomendaciones generales de
// seguridad y buen uso, iguales para cualquier vela de cera. Si el
// dueño quiere ajustar algo puntual de sus velas (tipo de cera,
// tiempo de quemado recomendado, etc.), este es el archivo a editar —
// por ahora es una página estática, no editable desde /admin (a
// diferencia de "Quiénes somos"), porque es contenido de seguridad
// que no debería cambiar seguido.
export default function CuidadoDeLasVelasPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <FlameIcon className="h-8 w-8 text-ember" />
          <h1 className="font-serif text-3xl text-foreground">
            Cuidado de tus velas
          </h1>
          <p className="text-xs text-muted">
            Última actualización: 15 de septiembre de 2026
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <p className="leading-relaxed text-muted">
            Tus velas Fuego están hechas a mano, con cariño y buenos
            materiales. Sigue estas recomendaciones para que duren más,
            huelan mejor y —lo más importante— las uses con seguridad.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl text-foreground">
            Antes de encenderla (primera vez)
          </h2>
          <ul className="list-inside list-disc leading-relaxed text-muted">
            <li>Recorta la mecha a unos 0,5 cm antes de cada uso.</li>
            <li>
              En el primer encendido, deja que se derrita toda la
              superficie (hasta los bordes) antes de apagarla — así
              evitas el &quot;efecto túnel&quot;, que hace que la vela
              se queme solo por el centro y se desperdicie cera.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl text-foreground">
            Mientras está encendida
          </h2>
          <ul className="list-inside list-disc leading-relaxed text-muted">
            <li>Nunca la dejes encendida sin supervisión.</li>
            <li>
              Quémala sobre una superficie plana y resistente al calor.
            </li>
            <li>
              Aléjala de corrientes de aire, cortinas, papeles y
              cualquier otro material inflamable.
            </li>
            <li>Mantenla fuera del alcance de niños y mascotas.</li>
            <li>No la quemes más de 3-4 horas seguidas por sesión.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl text-foreground">
            Para apagarla
          </h2>
          <p className="leading-relaxed text-muted">
            Usa un apagavelas o cúbrela un momento con su tapa, en vez
            de soplarla — así evitas que salpique cera caliente y que
            salga humo. Deja que la cera se enfríe por completo antes
            de mover el recipiente o volver a encenderla.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl text-foreground">
            Entre usos
          </h2>
          <ul className="list-inside list-disc leading-relaxed text-muted">
            <li>
              Guárdala en un lugar fresco, seco y lejos del sol
              directo — el calor puede deformarla o hacer que pierda
              aroma.
            </li>
            <li>
              Retira cualquier resto de mecha recortada o polvo antes
              de volver a encenderla.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl text-foreground">
            Cuándo dejar de usarla
          </h2>
          <p className="leading-relaxed text-muted">
            Por seguridad, deja de quemarla cuando quede aproximadamente
            1 cm de cera en la base — el recipiente puede calentarse
            demasiado si sigues encendiéndola después de eso.
          </p>
        </section>
      </div>
    </main>
  );
}
