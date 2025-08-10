import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import Swal from 'sweetalert2';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

// --- helpers --- //
async function extractErrorMessageAsync(err: HttpErrorResponse): Promise<string> {
    const body = err?.error;

    // JSON { message }
    if (body && typeof body === 'object' && 'message' in body && (body as any).message) {
        return String((body as any).message);
    }

    // Blob (cas fréquent 401/403)
    if (body instanceof Blob) {
        try {
            const text = await body.text();
            if (text) {
                try {
                    const obj = JSON.parse(text);
                    if (obj?.message) return String(obj.message);
                } catch {
                    if (text.trim()) return text;
                }
            }
        } catch {}
    }

    // texte brut
    if (typeof body === 'string' && body.trim()) return body;

    // message Angular (éviter "Http failure response ...")
    if (err?.message && !err.message.startsWith('Http failure response')) return err.message;

    // fallbacks par status
    switch (err?.status) {
        case 0:   return 'Serveur injoignable. Vérifiez votre connexion réseau.';
        case 400: return 'Requête invalide.';
        case 401: return 'Session expirée. Veuillez vous reconnecter.';
        case 403: return 'Accès refusé : droits insuffisants.';
        case 404: return 'Ressource introuvable.';
        case 409: return 'Conflit sur la ressource.';
        default:  return 'Une erreur est survenue.';
    }
}

function errorMeta(err: HttpErrorResponse): { title: string; icon: 'error'|'warning' } {
    const s = err?.status;
    if (s === 409) return { title: '⚠️ Conflit', icon: 'warning' };
    if (s === 400) return { title: '⚠️ Requête invalide', icon: 'warning' };
    if (s === 403) return { title: 'Accès refusé', icon: 'error' };
    if (s === 401) return { title: 'Authentification requise', icon: 'error' };
    if (s === 404) return { title: 'Introuvable', icon: 'error' };
    if (s === 0)   return { title: 'Réseau indisponible', icon: 'error' };
    return { title: '❌ Erreur', icon: 'error' };
}

// --- Interceptor --- //
export const errorAlertInterceptor: HttpInterceptorFn = (req, next) => {
    if (req.method === 'OPTIONS' || req.url.includes('/assets/')) {
        return next(req);
    }

    return next(req).pipe(
        catchError((err: HttpErrorResponse) => {
            // Permettre à un appel de gérer lui-même l'erreur si besoin
            if (req.headers.get('X-Skip-Error-Alert') === 'true') {
                return throwError(() => err);
            }

            (async () => {
                let text = await extractErrorMessageAsync(err);

                // raffinements métiers
                if (text.includes('Salle déjà réservée'))   text = 'Cette salle est déjà réservée pour cet horaire.';
                if (text.includes('Formateur déjà occupé')) text = 'Ce formateur est déjà occupé pour cet horaire.';
                if (text.includes('Horaires invalides'))    text = 'Les horaires doivent être compris entre 08:00 et 17:00.';

                const { title, icon } = errorMeta(err);
                await Swal.fire({ icon, title, text });
            })();

            return throwError(() => err);
        })
    );
};
