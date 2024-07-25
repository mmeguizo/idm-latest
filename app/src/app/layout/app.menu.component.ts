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
                                    label: 'Goals',
                                    icon: 'pi pi-align-justify',
                                    routerLink: ['/admin/goals'],
                                },
                                {
                                    label: 'Objectives',
                                    icon: 'pi pi-flag',
                                    routerLink: ['/admin/goals/objectives'],
                                },
                            ],
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
        } else {
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
                            routerLink: ['/admin/ai'],
                        },
                    ],
                },
            ];
        }
    }
}
