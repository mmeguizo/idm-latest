import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { AuthService } from '../demo/service/auth.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {
    model: any[] = [];
    role: string;

    constructor(
        public layoutService: LayoutService,
        private auth: AuthService
    ) {}

    ngOnInit() {
        this.role = this.auth.getUserRole();
        //custom menu
        if (this.role === 'admin') {
            this.model = [
                {
                    label: 'Home',
                    items: [
                        {
                            label: 'Dashboard',
                            icon: 'pi pi-fw pi-home',
                            routerLink: ['/admin/dashboard'],
                        },
                    ],
                },
                {
                    label: 'Departments',
                    items: [
                        {
                            label: 'Departments List',
                            icon: 'pi pi-building',
                            routerLink: ['/admin/departments'],
                        },
                    ],
                },
                {
                    label: 'Goals',
                    items: [
                        {
                            label: 'Goals',
                            icon: 'pi pi-caret-down',
                            items: [
                                {
                                    label: 'Dashboard',
                                    icon: 'pi pi-compass',
                                    routerLink: ['/admin/goals/dashboard'],
                                },
                                {
                                    label: 'Goals Tables',
                                    icon: 'pi pi-align-justify',
                                    routerLink: ['/admin/goals'],
                                },
                                // {
                                //     label: 'Objectives Tables',
                                //     icon: 'pi pi-flag',
                                //     routerLink: ['/admin/goals/objectives'],
                                // },
                                // {
                                //     label: 'Calendar',
                                //     icon: 'pi pi-calendar-plus',
                                //     routerLink: ['/admin/goals/calendar'],
                                // },
                                // {
                                //     label: 'Charts',
                                //     icon: 'pi pi-chart-line',
                                //     routerLink: ['/admin/goals/reporting'],
                                // },
                            ],
                        },
                    ],
                },
                {
                    label: 'Manager',
                    items: [
                        {
                            label: 'Goal',
                            icon: 'pi pi-sitemap',
                            routerLink: ['/admin/goal-management'],
                        },
                    ],
                },
                {
                    label: 'Users',
                    items: [
                        {
                            label: 'Users List',
                            icon: 'pi pi-table',
                            routerLink: ['/admin/users'],
                        },
                    ],
                },
                {
                    label: 'Logs',
                    items: [
                        {
                            label: 'Activity',
                            icon: 'pi pi-server',
                            routerLink: ['/admin/logs'],
                        },
                    ],
                },
                {
                    label: 'Ai Helper',
                    items: [
                        {
                            label: 'Gemini',
                            icon: 'pi pi-google',
                            routerLink: ['/admin/ai'],
                        },
                    ],
                },
            ];
        }

        if (this.role === 'office-head') {
            this.model = [
                {
                    label: 'Home',
                    items: [
                        {
                            label: 'Dashboard',
                            icon: 'pi pi-fw pi-home',
                            routerLink: ['/office-head/dashboard'],
                        },
                    ],
                },
                {
                    label: 'Goals',
                    items: [
                        {
                            label: 'Goals',
                            icon: 'pi pi-caret-down',
                            // routerLink: ['/office-head/goal'],
                            items: [
                                {
                                    label: 'Dashboard',
                                    icon: 'pi pi-compass',
                                    routerLink: ['/office-head/goal/dashboard'],
                                },
                                {
                                    label: 'Goals',
                                    icon: 'pi pi-align-justify',
                                    routerLink: ['/office-head/goal'],
                                },
                                // {
                                //     label: 'Objectives',
                                //     icon: 'pi pi-flag',
                                //     routerLink: [
                                //         '/office-head/goals/objectives',
                                //     ],
                                // },
                                // {
                                //     label: 'Calendar',
                                //     icon: 'pi pi-calendar-plus',
                                //     routerLink: ['/office-head/goals/calendar'],
                                // },
                            ],
                        },
                    ],
                },
                {
                    label: 'Ai Helper',
                    items: [
                        {
                            label: 'Gemini',
                            icon: 'pi pi-google',
                            routerLink: ['/office-head/ai'],
                        },
                    ],
                },
            ];
        }

        if (this.role === 'user') {
            this.model = [
                {
                    label: 'Home',
                    items: [
                        {
                            label: 'Dashboard',
                            icon: 'pi pi-fw pi-home',
                            routerLink: ['/user/dashboard'],
                        },
                    ],
                },
                {
                    label: 'Goals',
                    items: [
                        {
                            label: 'Goals',
                            icon: 'pi pi-caret-down',
                            items: [
                                {
                                    label: 'Dashboard',
                                    icon: 'pi pi-compass',
                                    routerLink: ['/user/goals/dashboard'],
                                },
                                {
                                    label: 'Goals',
                                    icon: 'pi pi-align-justify',
                                    routerLink: ['/user/goals'],
                                },
                                {
                                    label: 'Objectives',
                                    icon: 'pi pi-flag',
                                    routerLink: ['/user/goals/objectives'],
                                },
                                {
                                    label: 'Calendar',
                                    icon: 'pi pi-calendar-plus',
                                    routerLink: ['/user/goals/calendar'],
                                },
                            ],
                        },
                    ],
                },
                {
                    label: 'Ai Helper',
                    items: [
                        {
                            label: 'Gemini',
                            icon: 'pi pi-google',
                            routerLink: ['/user/ai'],
                        },
                    ],
                },
            ];
        }
        if (this.role === 'director') {
            this.model = [
                {
                    label: 'Home',
                    items: [
                        {
                            label: 'Dashboard',
                            icon: 'pi pi-fw pi-home',
                            routerLink: ['/director/dashboard'],
                        },
                    ],
                },
                {
                    label: 'Goals',
                    items: [
                        {
                            label: 'Goals',
                            icon: 'pi pi-caret-down',
                            items: [
                                {
                                    label: 'Dashboard',
                                    icon: 'pi pi-compass',
                                    routerLink: ['/director/goals/dashboard'],
                                },
                                {
                                    label: 'Goals',
                                    icon: 'pi pi-align-justify',
                                    routerLink: ['/director/goals'],
                                },
                                {
                                    label: 'Objectives',
                                    icon: 'pi pi-flag',
                                    routerLink: ['/director/goals/objectives'],
                                },
                                {
                                    label: 'Calendar',
                                    icon: 'pi pi-calendar-plus',
                                    routerLink: ['/director/goals/calendar'],
                                },
                            ],
                        },
                    ],
                },
                {
                    label: 'Ai Helper',
                    items: [
                        {
                            label: 'Gemini',
                            icon: 'pi pi-google',
                            routerLink: ['/director/ai'],
                        },
                    ],
                },
            ];
        }
        if (this.role === 'vice-president') {
            this.model = [
                {
                    label: 'Home',
                    items: [
                        {
                            label: 'Dashboard',
                            icon: 'pi pi-fw pi-home',
                            routerLink: ['/vice-president/dashboard'],
                        },
                    ],
                },
                {
                    label: 'Goals',
                    items: [
                        {
                            label: 'Goals',
                            icon: 'pi pi-caret-down',
                            items: [
                                {
                                    label: 'Dashboard',
                                    icon: 'pi pi-compass',
                                    routerLink: [
                                        '/vice-president/goals/dashboard',
                                    ],
                                },
                                {
                                    label: 'Goals',
                                    icon: 'pi pi-align-justify',
                                    routerLink: ['/vice-president/goals'],
                                },
                                {
                                    label: 'Objectives',
                                    icon: 'pi pi-flag',
                                    routerLink: [
                                        '/vice-president/goals/objectives',
                                    ],
                                },
                                {
                                    label: 'Calendar',
                                    icon: 'pi pi-calendar-plus',
                                    routerLink: [
                                        '/vice-president/goals/calendar',
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    label: 'Ai Helper',
                    items: [
                        {
                            label: 'Gemini',
                            icon: 'pi pi-google',
                            routerLink: ['/director/ai'],
                        },
                    ],
                },
            ];
        }
    }
}
