import { ApplicationConfig, APP_INITIALIZER, inject, importProvidersFrom } from '@angular/core';
import { provideRouter, withPreloading, withInMemoryScrolling, PreloadAllModules } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { provideNativeDateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';

import { provideFuse } from '@fuse';
import { provideTransloco, TranslocoService } from '@ngneat/transloco';
import { firstValueFrom } from 'rxjs';

import { appRoutes } from 'app/app.routes';
import { provideAuth } from 'app/core/auth/auth.provider';
import { provideIcons } from 'app/core/icons/icons.provider';
import { mockApiServices } from 'app/mock-api';
import { TranslocoHttpLoader } from './core/transloco/transloco.http-loader';
import { NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { errorAlertInterceptor } from './core/interceptors/error-alert.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        // ✅ HttpClient + Interceptor global SweetAlert
        provideHttpClient(
            withInterceptors([errorAlertInterceptor]),
            withInterceptorsFromDi() // si tu as d'autres interceptors DI (ex: JWT)
        ),

        provideAnimations(),
        provideRouter(
            appRoutes,
            withPreloading(PreloadAllModules),
            withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
        ),
        importProvidersFrom(NgxMatNativeDateModule), // adapter natif

        // ✅ Adapter natif + locale FR + formats
        provideNativeDateAdapter(),
        { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                parse:   { dateInput: 'l' },
                display: {
                    dateInput: 'dd/MM/yyyy',
                    monthYearLabel: 'MMM yyyy',
                    dateA11yLabel: 'dd/MM/yyyy',
                    monthYearA11yLabel: 'MMMM yyyy',
                },
            },
        },

        // Transloco
        provideTransloco({
            config: {
                availableLangs: [
                    { id: 'en', label: 'English' },
                    { id: 'tr', label: 'Turkish' },
                ],
                defaultLang: 'en',
                fallbackLang: 'en',
                reRenderOnLangChange: true,
                prodMode: true,
            },
            loader: TranslocoHttpLoader,
        }),
        {
            provide: APP_INITIALIZER,
            useFactory: () => {
                const translocoService = inject(TranslocoService);
                const defaultLang = translocoService.getDefaultLang();
                translocoService.setActiveLang(defaultLang);
                return () => firstValueFrom(translocoService.load(defaultLang));
            },
            multi: true,
        },

        // Fuse
        provideAuth(),
        provideIcons(),
        provideFuse({
            mockApi: { delay: 0, services: mockApiServices },
            fuse: {
                layout: 'classy',
                scheme: 'light',
                screens: { sm: '600px', md: '960px', lg: '1280px', xl: '1440px' },
                theme: 'theme-default',
                themes: [
                    { id: 'theme-default', name: 'Default' },
                    { id: 'theme-brand', name: 'Brand' },
                    { id: 'theme-teal', name: 'Teal' },
                    { id: 'theme-rose', name: 'Rose' },
                    { id: 'theme-purple', name: 'Purple' },
                    { id: 'theme-amber', name: 'Amber' },
                ],
            },
        }),
    ],
};
