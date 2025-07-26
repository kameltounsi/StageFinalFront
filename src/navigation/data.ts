/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';
import { environment } from 'environment/environment';


var defaultMenu = [];

if(environment.production)
{
    defaultMenu = [
        {
            id: 'dashboards',
            title: 'Dashboards',
            subtitle: 'Unique dashboard designs',
            type: 'group',
            icon: 'heroicons_outline:home',
            children: [
                {
                    id: 'dashboards.project',
                    title: 'Project',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/dashboards/project',
                },
                {
                    id: 'dashboards.analytics',
                    title: 'Missions',
                    type: 'basic',
                    icon: 'heroicons_outline:chart-pie',
                    link: '/dashboards/analytics',
                },
                {
                    id: 'dashboards.finance',
                    title: 'Finance',
                    type: 'basic',
                    icon: 'heroicons_outline:banknotes',
                    link: '/dashboards/finance',
                }
            ],
        },
        {
            id: 'apps',
            title: 'Applications',
            subtitle: 'application used by collaborator',
            type: 'group',
            icon: 'heroicons_outline:home',
            children: [
                {
                    id: 'apps.academy',
                    title: 'CRA',
                    type: 'basic',
                    icon: 'heroicons_outline:academic-cap',
                    link: '/apps/academy',
                },
                {
                    id: 'apps.academy',
                    title: '',
                    type: 'basic',
                    icon: 'heroicons_outline:academic-cap',
                    link: '/apps/academy',
                },
                {
                    id: 'apps.contacts',
                    title: 'Contacts',
                    type: 'basic',
                    icon: 'heroicons_outline:user-group',
                    link: '/apps/contacts',
                }                              
            ],
        }

    ];
}
 

else
{
    defaultMenu= [
        {
            id: 'dashboards',
            title: 'Bloc Notes',
            subtitle: 'Mes notes',
            type: 'group',
            icon: 'heroicons_outline:home',
            children: [
                {
                    id: 'dashboards.notes',
                    title: 'Taches',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/list-tasks',
                },
                {
                    id: 'dashboards.finance',
                    title: 'Utilisateurs',
                    type: 'basic',
                    icon: 'heroicons_outline:user-group',
                    link: '/list-users',
                }
            ],
        },
        {
            id: 'apps',
            title: 'Apps',
            subtitle: 'Apps',
            type: 'group',
            icon: 'heroicons_outline:home',
            children: [
                {
                    id: 'apps.cra',
                    title: 'academy',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/apps/academy',
                },
                {
                    id: 'apps.historique-cra',
                    title: 'chat',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/apps/chat',
                },
                {
                    id: 'apps.historique-cra',
                    title: 'contacts',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/apps/contacts',
                } ,
                {
                    id: 'apps.historique-cra',
                    title: 'ecommerce',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/apps/ecommerce',
                }    ,
                {
                    id: 'apps.historique-cra',
                    title: 'file-manager',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/apps/file-manager',
                },
                {
                    id: 'apps.historique-cra',
                    title: 'help-center',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/apps/help-center',
                },
                {
                    id: 'apps.historique-cra',
                    title: 'mailbox',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/apps/mailbox',
                },
                {
                    id: 'apps.historique-cra',
                    title: 'notes',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/apps/notes',
                },
                {
                    id: 'apps.historique-cra',
                    title: 'scrumboard',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/apps/scrumboard',
                },
                {
                    id: 'apps.historique-cra',
                    title: 'tasks',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/apps/tasks',
                }
            ],
        },        
        {
            id: 'pages',
            title: 'pages',
            subtitle: 'pages',
            type: 'group',
            icon: 'heroicons_outline:home',
            children: [
                {
                    id: 'missions.activities',
                    title: 'activities',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/pages/activities',
                },
                {
                    id: 'missions.search-mission',
                    title: 'Facture classique',
                    type: 'basic',
                    icon: 'heroicons_outline:academic-cap',
                    link: '/pages/invoice/printable/compact',
                } ,
                {
                    id: 'missions.search-mission',
                    title: 'Facture moderne',
                    type: 'basic',
                    icon: 'heroicons_outline:academic-cap',
                    link: '/pages/invoice/printable/modern',
                } ,
                {
                    id: 'missions.search-mission',
                    title: 'maintenance',
                    type: 'basic',
                    icon: 'heroicons_outline:academic-cap',
                    link: '/pages/maintenance',
                } ,
                {
                    id: 'missions.search-mission',
                    title: 'pricing modern',
                    type: 'basic',
                    icon: 'heroicons_outline:academic-cap',
                    link: '/pages/pricing/modern',
                } ,
                {
                    id: 'missions.search-mission',
                    title: 'pricing simple',
                    type: 'basic',
                    icon: 'heroicons_outline:academic-cap',
                    link: '/pages/pricing/simple',
                } ,
                {
                    id: 'missions.search-mission',
                    title: 'pricing single',
                    type: 'basic',
                    icon: 'heroicons_outline:academic-cap',
                    link: '/pages/pricing/single',
                } ,
                {
                    id: 'missions.search-mission',
                    title: 'pricing table',
                    type: 'basic',
                    icon: 'heroicons_outline:academic-cap',
                    link: '/pages/pricing/table',
                } ,
                {
                    id: 'missions.search-mission',
                    title: 'profile',
                    type: 'basic',
                    icon: 'heroicons_outline:academic-cap',
                    link: '/pages/profile',
                } ,
                {
                    id: 'missions.search-mission',
                    title: 'settings',
                    type: 'basic',
                    icon: 'heroicons_outline:academic-cap',
                    link: '/pages/settings',
                } ,

            ],
        },
        {
            id: 'ui',
            title: 'ui',
            subtitle: 'ui',
            type: 'group',
            icon: 'heroicons_outline:home',
            children: [
                {
                    id: 'missions.activities',
                    title: 'material-components',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/ui/material-components',
                },
                {
                    id: 'missions.activities',
                    title: 'fuse-components',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/ui/fuse-components',
                },
                {
                    id: 'missions.activities',
                    title: 'other-components',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/ui/other-components',
                },
                {
                    id: 'missions.activities',
                    title: 'tailwindcss',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/ui/tailwindcss',
                },
                {
                    id: 'missions.activities',
                    title: 'confirmation-dialog',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/ui/confirmation-dialog',
                },
                {
                    id: 'missions.activities',
                    title: 'advanced-search',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/ui/advanced-search',
                },
                {
                    id: 'missions.activities',
                    title: 'animations',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/ui/animations',
                },
                {
                    id: 'missions.activities',
                    title: 'cards',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/ui/cards',
                },
                {
                    id: 'missions.activities',
                    title: 'colors',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/ui/colors',
                },
                {
                    id: 'missions.activities',
                    title: 'datatable',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/ui/datatable',
                },
                {
                    id: 'missions.activities',
                    title: 'forms',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/ui/forms',
                },
                {
                    id: 'missions.activities',
                    title: 'icons',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/ui/icons',
                },
                {
                    id: 'missions.activities',
                    title: 'page-layouts',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/ui/page-layouts',
                },
                {
                    id: 'missions.activities',
                    title: 'typography',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/ui/typography',
                },


            ],
        },
        {
            id: 'docs',
            title: 'docs',
            subtitle: 'docs',
            type: 'group',
            icon: 'heroicons_outline:home',
            children: [
                {
                    id: 'missions.activities',
                    title: 'guides',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/docs/guides',
                },



            ],
        }

    ];
}
export const defaultNavigation: FuseNavigationItem[] = defaultMenu;

export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboards',
        title: 'Dashboards',
        tooltip: 'Dashboards',
        type: 'aside',
        icon: 'heroicons_outline:home',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'apps',
        title: 'Apps',
        tooltip: 'Apps',
        type: 'aside',
        icon: 'heroicons_outline:squares-2x2',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'pages',
        title: 'Pages',
        tooltip: 'Pages',
        type: 'aside',
        icon: 'heroicons_outline:document-duplicate',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'user-interface',
        title: 'UI',
        tooltip: 'UI',
        type: 'aside',
        icon: 'heroicons_outline:rectangle-stack',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'navigation-features',
        title: 'Navigation',
        tooltip: 'Navigation',
        type: 'aside',
        icon: 'heroicons_outline:bars-3',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboards',
        title: 'DASHBOARDS',
        type: 'group',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'apps',
        title: 'APPS',
        type: 'group',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'others',
        title: 'OTHERS',
        type: 'group',
    },
    {
        id: 'pages',
        title: 'Pages',
        type: 'aside',
        icon: 'heroicons_outline:document-duplicate',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'user-interface',
        title: 'User Interface',
        type: 'aside',
        icon: 'heroicons_outline:rectangle-stack',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'navigation-features',
        title: 'Navigation Features',
        type: 'aside',
        icon: 'heroicons_outline:bars-3',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboards',
        title: 'Dashboards',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'apps',
        title: 'Apps',
        type: 'group',
        icon: 'heroicons_outline:squares-2x2',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'pages',
        title: 'Pages',
        type: 'group',
        icon: 'heroicons_outline:document-duplicate',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'user-interface',
        title: 'UI',
        type: 'group',
        icon: 'heroicons_outline:rectangle-stack',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'navigation-features',
        title: 'Misc',
        type: 'group',
        icon: 'heroicons_outline:bars-3',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
];
export const adminNavigation: FuseNavigationItem[] = [
    {
        id: 'admin',
        title: 'Administration',
        subtitle: 'Admin tools',
        type: 'group',
        icon: 'heroicons_outline:cog',
        children: [
            {
                id: 'admin.users',
                title: 'Manage Users',
                type: 'basic',
                icon: 'heroicons_outline:user-group',
                link: '/admin/users',
            },
            {
                id: 'admin.courses',
                title: 'Manage Courses',
                type: 'basic',
                icon: 'heroicons_outline:book-open',
                link: '/admin/courses',
            },
            {
                id: 'admin.schedule',
                title: 'Manage Schedule',
                type: 'basic',
                icon: 'heroicons_outline:calendar-days',
                link: '/admin/schedule',
            },
            {
                id: 'admin.attendance',
                title: 'Attendance',
                type: 'basic',
                icon: 'heroicons_outline:clipboard-document-check',
                link: '/admin/attendance',
            },
            {
                id: 'admin.grades',
                title: 'Grades',
                type: 'basic',
                icon: 'heroicons_outline:chart-bar',
                link: '/admin/grades',
            },
            {
                id: 'admin.documents',
                title: 'Documents',
                type: 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/admin/documents',
            },
        ]
    }
];

 
