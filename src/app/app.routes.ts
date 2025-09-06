import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import {studentAbsenceRoutes} from "./modules/student/attendance/student-absence.routes";
import adminCoursesRoutes from "./modules/admin/courses/admin-courses.routes";

export const appRoutes: Route[] = [
    { path: '', pathMatch: 'full', redirectTo: 'dashboards/project' },

    {
        path: 'signed-in-redirect',
        pathMatch: 'full',
        redirectTo: 'dashboards/project'
    },

    // Auth routes (for guests)
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: { layout: 'empty' },
        children: [
            { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes') },
            { path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes') },
            { path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes') },
            { path: 'verify-code', loadChildren: () => import('app/modules/auth/verify-code/verify-code.routes') },
            { path: 'reset-flow', loadChildren: () => import('app/modules/auth/reset-flow/reset-flow.routes').then(m => m.ResetFlowModule) },
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes') },
            { path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes') },
            {
                path: 'student-request',
                loadComponent: () =>
                    import('./modules/auth/student-request/student-request.component')
                        .then(m => m.StudentRequestComponent)
            },
        ]},


    // Auth routes (for authenticated users)
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: { layout: 'empty' },
        children: [
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes') },
            { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes') }
        ]
    },

    // Landing pages
    {
        path: '',
        component: LayoutComponent,
        data: { layout: 'empty' },
        children: [
            { path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes') }
        ]
    },

    // Admin + secured routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: { initialData: initialDataResolver },
        children: [
            // New route added for managing users
            {
                path: 'admin/users',
                loadChildren: () =>
                    import('app/modules/admin/dashboards/manage-users/manage-users.routes')
                        .then(m => m.routes)
            },{
                path: 'admin/dashboard',
                loadChildren: () =>
                    import('./modules/admin/dashboard/admin-dashboard.routes').then(m => m.default),
            },
            { path: 'admin/manage-plannings',
    loadChildren: () =>
    import('app/modules/admin/dashboards/manage-plannings/manage-plannings.routes')
        .then(m => m.default)
},  {
                path: 'admin/absences',
                loadChildren: () =>
                    import('./modules/admin/absences/admin-absences.routes')
                        .then(m => m.ADMIN_ABSENCES_ROUTES)
            },

            {
                path: 'add-user',
                loadChildren: () =>
                    import('app/modules/admin/dashboards/manage-users/add-user/add-user.routes'),
            },
            {
                path: 'profile',
                loadChildren: () => import('./modules/profile/profile.routes').then(m => m.PROFILE_ROUTES),
            },
            {
                path: 'admin/manage-groups',
                loadChildren: () =>
                    import('app/modules/admin/dashboards/manage-groups/manage-groups.routes')
                        .then(m => m.default)
            },
            // Dashboards
            {
                path: 'dashboards', children: [
                    { path: 'project', loadChildren: () => import('app/modules/admin/dashboards/project/project.routes') },
                    { path: 'analytics', loadChildren: () => import('app/modules/admin/dashboards/analytics/analytics.routes') },
                    { path: 'finance', loadChildren: () => import('app/modules/admin/dashboards/finance/finance.routes') },
                    { path: 'crypto', loadChildren: () => import('app/modules/admin/dashboards/crypto/crypto.routes') },
                ]
            },

            // Apps
            {
                path: 'apps', children: [
                    { path: 'academy', loadChildren: () => import('app/modules/admin/apps/academy/academy.routes') },
                    { path: 'chat', loadChildren: () => import('app/modules/admin/apps/chat/chat.routes') },
                    { path: 'contacts', loadChildren: () => import('app/modules/admin/apps/contacts/contacts.routes') },
                    { path: 'ecommerce', loadChildren: () => import('app/modules/admin/apps/ecommerce/ecommerce.routes') },
                    { path: 'file-manager', loadChildren: () => import('app/modules/admin/apps/file-manager/file-manager.routes') },
                    { path: 'help-center', loadChildren: () => import('app/modules/admin/apps/help-center/help-center.routes') },
                    { path: 'mailbox', loadChildren: () => import('app/modules/admin/apps/mailbox/mailbox.routes') },
                    { path: 'notes', loadChildren: () => import('app/modules/admin/apps/notes/notes.routes') },
                    { path: 'scrumboard', loadChildren: () => import('app/modules/admin/apps/scrumboard/scrumboard.routes') },
                    { path: 'tasks', loadChildren: () => import('app/modules/admin/apps/tasks/tasks.routes') },
                ]
            },

            // Pages
            {
                path: 'pages', children: [
                    { path: 'activities', loadChildren: () => import('app/modules/admin/pages/activities/activities.routes') },
                    { path: 'authentication', loadChildren: () => import('app/modules/admin/pages/authentication/authentication.routes') },
                    { path: 'coming-soon', loadChildren: () => import('app/modules/admin/pages/coming-soon/coming-soon.routes') },
                    {
                        path: 'error', children: [
                            { path: '404', loadChildren: () => import('app/modules/admin/pages/error/error-404/error-404.routes') },
                            { path: '500', loadChildren: () => import('app/modules/admin/pages/error/error-500/error-500.routes') }
                        ]
                    },
                    {
                        path: 'invoice', children: [
                            {
                                path: 'printable', children: [
                                    { path: 'compact', loadChildren: () => import('app/modules/admin/pages/invoice/printable/compact/compact.routes') },
                                    { path: 'modern', loadChildren: () => import('app/modules/admin/pages/invoice/printable/modern/modern.routes') }
                                ]
                            }
                        ]
                    },
                    { path: 'maintenance', loadChildren: () => import('app/modules/admin/pages/maintenance/maintenance.routes') },
                    {
                        path: 'pricing', children: [
                            { path: 'modern', loadChildren: () => import('app/modules/admin/pages/pricing/modern/modern.routes') },
                            { path: 'simple', loadChildren: () => import('app/modules/admin/pages/pricing/simple/simple.routes') },
                            { path: 'single', loadChildren: () => import('app/modules/admin/pages/pricing/single/single.routes') },
                            { path: 'table', loadChildren: () => import('app/modules/admin/pages/pricing/table/table.routes') }
                        ]
                    },
                    { path: 'profile', loadChildren: () => import('app/modules/admin/pages/profile/profile.routes') },
                    { path: 'settings', loadChildren: () => import('app/modules/admin/pages/settings/settings.routes') },
                ]
            },

            // UI
            {
                path: 'ui', children: [
                    { path: 'material-components', loadChildren: () => import('app/modules/admin/ui/material-components/material-components.routes') },
                    { path: 'fuse-components', loadChildren: () => import('app/modules/admin/ui/fuse-components/fuse-components.routes') },
                    { path: 'other-components', loadChildren: () => import('app/modules/admin/ui/other-components/other-components.routes') },
                    { path: 'tailwindcss', loadChildren: () => import('app/modules/admin/ui/tailwindcss/tailwindcss.routes') },
                    { path: 'advanced-search', loadChildren: () => import('app/modules/admin/ui/advanced-search/advanced-search.routes') },
                    { path: 'animations', loadChildren: () => import('app/modules/admin/ui/animations/animations.routes') },
                    { path: 'cards', loadChildren: () => import('app/modules/admin/ui/cards/cards.routes') },
                    { path: 'colors', loadChildren: () => import('app/modules/admin/ui/colors/colors.routes') },
                    { path: 'confirmation-dialog', loadChildren: () => import('app/modules/admin/ui/confirmation-dialog/confirmation-dialog.routes') },
                    { path: 'datatable', loadChildren: () => import('app/modules/admin/ui/datatable/datatable.routes') },
                    { path: 'forms', loadChildren: () => import('app/modules/admin/ui/forms/forms.routes') },
                    { path: 'icons', loadChildren: () => import('app/modules/admin/ui/icons/icons.routes') },
                    { path: 'page-layouts', loadChildren: () => import('app/modules/admin/ui/page-layouts/page-layouts.routes') },
                    { path: 'typography', loadChildren: () => import('app/modules/admin/ui/typography/typography.routes') }
                ]
            },

            // Documentation
            {
                path: 'docs', children: [
                    { path: 'changelog', loadChildren: () => import('app/modules/admin/docs/changelog/changelog.routes') },
                    { path: 'guides', loadChildren: () => import('app/modules/admin/docs/guides/guides.routes') }
                ]
            },
            // ✅ Route trainer : Weekly Schedule
            {
                path: 'trainer/weekly-schedule',
                loadChildren: () =>
                    import('app/modules/trainer/weekly-schedule/weekly-schedule.routes')
                        .then(m => m.default)
            },
            {
                path: 'trainer/dashboard',
                loadChildren: () => import('./modules/trainer/trainer-dashboard/trainer-dashboard.routes')
                    .then(m => m.default)
            },

            {
                path: 'trainer/notes',
                loadChildren: () =>
                    import('./modules/trainer/notes/trainer-notes.routes')
                        .then(m => m.default)
            },
            {
                path: 'trainer/courses',
                loadChildren: () =>
                    import('./modules/trainer/courses/trainer-courses.routes')
                        .then(m => m.trainerCoursesRoutes),
            },
            {
                path: 'trainer/manage-presence',
                canActivate: [AuthGuard],
                // canMatch: [AuthGuard],   // si lazy module
                loadComponent: () => import('app/modules/trainer/manage-presence/manage-presence.component').then(m => m.ManagePresenceComponent)
            },
            // app/app.routes.ts (ou routes équivalentes)
            {
                path: 'student/dashboard',
                loadChildren: () =>
                    import('app/modules/student/student-dashboard/student-dashboard.routes')
                        .then(m => m.default)
            },
            {
                path: 'student/absences',
                loadChildren: () =>
                    import('app/modules/student/attendance/student-absence.routes')
                        .then(m => m.studentAbsenceRoutes)
            },
            {
                path: 'student/consult-planning',
                loadChildren: () =>
                    import('app/modules/student/consult-planning/consult-planning.routes')
                        .then(m => m.consultPlanningRoutes)
            },
            {
                path: 'student/absences',
                children: studentAbsenceRoutes
            },
            {
                path: 'student/notes',
                loadChildren: () =>
                    import('app/modules/student/notes/student-notes.routes'),
            },
            // ==== Admin ====
            {
                path: 'admin/courses',
                children: adminCoursesRoutes,
            },
            {
                path: 'admin/results',
                loadChildren: () =>
                    import('./modules/admin/results/admin-results.routes')
                        .then(m => m.ADMIN_RESULTS_ROUTES),
                canActivate: [AuthGuard],                 // garde Auth si présent
                // canActivate: [AuthGuard, AdminGuard],  // si tu as un guard Admin dédié
                data: { roles: ['ADMIN'] }                // utile si ton AuthGuard lit data.roles
            },
            {
                path: 'student/courses',
                loadChildren: () =>
                    import('app/modules/student/courses/student-courses.routes')
                        .then(m => m.default),
            },
            // Catch-all
            { path: '404-not-found', pathMatch: 'full', loadChildren: () => import('app/modules/admin/pages/error/error-404/error-404.routes') },
            { path: '**', redirectTo: '404-not-found' }
        ]
    }
];
