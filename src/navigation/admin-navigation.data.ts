import { Navigation } from 'app/core/navigation/navigation.types';

export const adminNavigation: Navigation = {
    default: [
        {
            id: 'admin.dashboard',
            title: 'Admin Dashboard',
            type: 'basic',
            icon: 'heroicons_outline:home',
            link: '/admin/dashboard',
        },
        {
            id: 'admin.users',
            title: 'Manage Users',
            type: 'basic',
            icon: 'heroicons_outline:user-group',
            link: '/admin/users',
        },
        {
            id: 'admin.schedules',
            title: 'Schedules',
            type: 'basic',
            icon: 'heroicons_outline:calendar-days',
            link: '/admin/schedules',
        },
    ],
    compact: [],
    futuristic: [],
    horizontal: []
};
