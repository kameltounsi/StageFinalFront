import { Navigation } from 'app/core/navigation/navigation.types';

export const studentNavigation: Navigation = {
    default: [
        {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'basic',
            icon: 'heroicons_outline:home',
            link: '/student/dashboard'
        },
        {
            id: 'my-courses',
            title: 'My Courses',
            type: 'basic',
            icon: 'heroicons_outline:book-open',
            link: '/student/my-courses'
        },
        {
            id: 'my-schedule',
            title: 'My Schedule',
            type: 'basic',
            icon: 'heroicons_outline:calendar-days',
            link: '/student/consult-planning'
        },
        {
            id: 'my-grades',
            title: 'My Grades',
            type: 'basic',
            icon: 'heroicons_outline:academic-cap',
            link: '/student/notes'
        },
        {
            id: 'attendance',
            title: 'My Attendance',
            type: 'basic',
            icon: 'heroicons_outline:check-circle',
            link: '/student/absences'
        }

    ],
    compact: [],
    futuristic: [],
    horizontal: []
};
