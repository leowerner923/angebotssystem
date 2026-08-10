import { supabaseServer } from '@/lib/supabaseServer'
import { COMPANY_CONFIG } from '@/lib/company-config'
import Entscheidung from './Entscheidung'

function formatPreis(n: number) {
  return `${n.toFixed(2).replace('.', ',')} €`
}

function formatDatum(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function heuteAlsIsoDatum(): string {
  return new Date().toISOString().slice(0, 10)
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full text-base font-semibold text-white"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            {COMPANY_CONFIG.name.charAt(0)}
          </div>
          <p className="text-sm font-medium text-gray-500">{COMPANY_CONFIG.name}</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="h-1.5" style={{ backgroundColor: 'var(--brand-primary)' }} />
          <div className="p-6">{children}</div>
        </div>
      </div>
    </main>
  )
}

export default async function AngebotPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const { data: offer } = await supabaseServer
    .from('offers')
    .select('title, description, price, status, created_at, gueltig_bis, entschieden_am')
    .eq('annahme_token', token)
    .single()

  if (!offer || (offer.status !== 'sent' && offer.status !== 'accepted' && offer.status !== 'rejected')) {
    return (
      <Shell>
        <h1 className="text-lg font-semibold text-gray-900">Angebot nicht gefunden</h1>
        <p className="mt-2 text-sm text-gray-500">
          Dieser Link ist ungültig oder das Angebot existiert nicht mehr. Bitte wenden Sie sich an den Betrieb.
        </p>
      </Shell>
    )
  }

  const abgelaufen = !!offer.gueltig_bis && offer.gueltig_bis < heuteAlsIsoDatum() && offer.status === 'sent'

  return (
    <Shell>
      <h1 className="text-lg font-semibold text-gray-900">Ihr persönliches Angebot</h1>
      <p className="mt-1 text-sm text-gray-500">
        Vielen Dank für Ihre Anfrage — hier ist Ihr Angebot von {COMPANY_CONFIG.name}.
      </p>

      <div className="mt-4 flex flex-col gap-1.5 rounded-xl bg-gray-50 p-4">
        <p className="text-sm text-gray-600">{offer.description}</p>
        <p className="mt-1 text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>
          {formatPreis(offer.price)}
        </p>
        <p className="text-xs text-gray-400">
          Angebot vom {formatDatum(offer.created_at)}
          {offer.gueltig_bis && ` · Gültig bis ${formatDatum(offer.gueltig_bis)}`}
        </p>
      </div>

      <div className="mt-6">
        {offer.status === 'accepted' && (
          <div className="rounded-2xl bg-green-50 p-6 text-center">
            <p className="text-lg font-semibold text-green-800">Danke!</p>
            <p className="mt-1 text-sm text-green-700">Der Betrieb meldet sich zur Terminabstimmung.</p>
            {offer.entschieden_am && (
              <p className="mt-2 text-xs text-green-600">Angenommen am {formatDatum(offer.entschieden_am)}</p>
            )}
          </div>
        )}

        {offer.status === 'rejected' && (
          <div className="rounded-2xl bg-gray-50 p-6 text-center">
            <p className="text-lg font-semibold text-gray-800">Danke für Ihre Rückmeldung.</p>
            {offer.entschieden_am && (
              <p className="mt-2 text-xs text-gray-500">Zurückgemeldet am {formatDatum(offer.entschieden_am)}</p>
            )}
          </div>
        )}

        {offer.status === 'sent' && abgelaufen && (
          <div className="rounded-xl bg-amber-50 p-4 text-center text-sm text-amber-700">
            Dieses Angebot ist abgelaufen — bitte melden Sie sich beim Betrieb.
          </div>
        )}

        {offer.status === 'sent' && !abgelaufen && <Entscheidung token={token} />}
      </div>
    </Shell>
  )
}
