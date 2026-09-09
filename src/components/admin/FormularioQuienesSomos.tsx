import {
  guardarCampoContenidoQuienesSomos,
  guardarRedSocialContacto,
} from '@/app/admin/quienes-somos/actions';
import type { ContenidoQuienesSomos, RedesSociales } from '@/lib/admin-db';
import CampoTextoBloqueable from './CampoTextoBloqueable';

// Cada campo se guarda (y se bloquea) por separado — ver
// CampoTextoBloqueable, guardarCampoContenidoQuienesSomos y
// guardarRedSocialContacto.
export default function FormularioQuienesSomos({
  contenidoInicial,
  redesInicial,
  numeroWhatsApp,
}: {
  contenidoInicial: ContenidoQuienesSomos;
  redesInicial: RedesSociales;
  numeroWhatsApp: string | null;
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

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Redes sociales
          </p>
          <p className="text-xs text-muted">
            Los íconos aparecen debajo del texto de Contacto en la
            tienda. Deja el campo vacío para que un ícono no aparezca.
          </p>
        </div>

        <CampoTextoBloqueable
          etiqueta="Instagram"
          valorInicial={redesInicial.instagram}
          accion={guardarRedSocialContacto}
          camposOcultos={{ red: 'instagram' }}
          placeholder="usuario o link de Instagram"
          rows={1}
        />
        <CampoTextoBloqueable
          etiqueta="TikTok"
          valorInicial={redesInicial.tiktok}
          accion={guardarRedSocialContacto}
          camposOcultos={{ red: 'tiktok' }}
          placeholder="usuario o link de TikTok"
          rows={1}
        />

        <div>
          <p className="text-sm font-medium text-foreground">WhatsApp</p>
          <p className="text-xs text-muted">
            {numeroWhatsApp
              ? `Usa el mismo número configurado arriba en el panel principal (${numeroWhatsApp}).`
              : 'Todavía no hay un número configurado — el ícono de WhatsApp no aparecerá hasta que lo agregues en el panel principal.'}
          </p>
        </div>
      </div>
    </div>
  );
}
