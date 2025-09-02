// app/core/navigation/trainer.navigation.ts
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
            id: 'weekly-schedule',
            title: 'Weekly Schedule',
            type: 'basic',
            icon: 'heroicons_outline:calendar-days',
            link: '/trainer/weekly-schedule'
        },
        {
            id: 'my-courses',
            title: 'My Courses',
            type: 'basic',
            icon: 'heroicons_outline:book-open',
            link: '/trainer/my-courses'
        },
        {
            id: 'attendance',
            title: 'Attendance',
            type: 'basic',
            icon: 'heroicons_outline:check-circle',
            link: '/trainer/manage-presence'
        },
        {
            id: 'notes',
            title: 'Manage Notes',
            type: 'basic',
            icon: 'heroicons_outline:pencil-square',
            link: '/trainer/notes'   // 🔥 aligné avec trainer-notes.routes.ts
        }
    ],
    compact: [],
    futuristic: [],
    horizontal: []
};
