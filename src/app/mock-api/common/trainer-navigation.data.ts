import { Navigation } from 'app/core/navigation/navigation.types';

export const trainerNavigation: Navigation = {
    default: [
        {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'basic',
            icon: 'heroicons_outline:home',
            link: '/trainer/dashboard'
        },
        {
            id: 'my-courses',
            title: 'My Courses',
            type: 'basic',
            icon: 'heroicons_outline:book-open',
            link: '/trainer/my-courses'
        },
      /*  {
            id: 'grades',
            title: 'Manage Grades',
            type: 'basic',
            icon: 'heroicons_outline:clipboard-check',
            link: '/trainer/grades'
        },*/
        {
            id: 'grades',
            title: 'Manage Grades',
            type: 'basic',
            icon: 'heroicons_outline:pencil-square',
            link: '/trainer/grades'
        },
        {
            id: 'attendance',
            title: 'Attendance',
            type: 'basic',
            icon: 'heroicons_outline:check-circle',
            link: '/trainer/attendance'
        }
    ],
    compact: [],
    futuristic: [],
    horizontal: []
};
