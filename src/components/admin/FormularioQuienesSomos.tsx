import { guardarCampoContenidoQuienesSomos } from '@/app/admin/quienes-somos/actions';
import type { ContenidoQuienesSomos } from '@/lib/admin-db';
import CampoTextoBloqueable from './CampoTextoBloqueable';

// Cada campo se guarda (y se bloquea) por separado — ver
// CampoTextoBloqueable y guardarCampoContenidoQuienesSomos.
export default function FormularioQuienesSomos({
  contenidoInicial,
}: {
  contenidoInicial: ContenidoQuienesSomos;
}) {
  return (
    <div className="flex flex-col gap-6">
      <CampoTextoBloqueable
        etiqueta="Nuestra historia"
        valorInicial={contenidoInicial.historia}
        accion={guardarCampoContenidoQuienesSomos}
        camposOcultos={{ campo: 'historia' }}
        rows={4}
      />
      <CampoTextoBloqueable
        etiqueta="Nuestra misión"
        valorInicial={contenidoInicial.mision}
        accion={guardarCampoContenidoQuienesSomos}
        camposOcultos={{ campo: 'mision' }}
        rows={4}
      />
      <CampoTextoBloqueable
        etiqueta="Contacto"
        valorInicial={contenidoInicial.contacto}
        accion={guardarCampoContenidoQuienesSomos}
        camposOcultos={{ campo: 'contacto' }}
        rows={4}
      />
    </div>
  );
}
