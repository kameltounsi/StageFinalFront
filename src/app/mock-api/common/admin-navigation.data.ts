// app/mock-api/common/admin-navigation.data.ts
import { Navigation } from 'app/core/navigation/navigation.types';

export const adminNavigation: Navigation = {
    default: [
        {
            id: 'admin.dashboard',
            title: 'Dashboard',
            type: 'basic',
            icon: 'heroicons_outline:home',
            link: '/dashboards/project'
        },
        {
            id: 'admin.users',
            title: 'Manage Users',
            type: 'basic',
            icon: 'heroicons_outline:user-group',
            link: '/admin/users'
        },
        {
            id: 'admin.planning',
            title: 'Plannings',
            type: 'basic',
            icon: 'heroicons_outline:calendar',
            link: '/admin/planning'
        },
        {
            id: 'admin.attendance',
            title: 'Attendance',
            type: 'basic',
            icon: 'heroicons_outline:clipboard-document',
            link: '/admin/attendance'
        },
        {
            id: 'admin.grades',
            title: 'Grades',
            type: 'basic',
            icon: 'heroicons_outline:academic-cap',
            link: '/admin/grades'
        },
        {
            id: 'admin.courses',
            title: 'Courses',
            type: 'basic',
            icon: 'heroicons_outline:book-open',
            link: '/admin/courses'
        }
    ],
    compact: [],
    futuristic: [],
    horizontal: []
};
