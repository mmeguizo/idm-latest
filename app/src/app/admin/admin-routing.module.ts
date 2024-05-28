import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { GoalsComponent } from './goals/goals.component';
import { DepartmentsComponent } from './departments/departments.component';

// const routes: Routes = [
//     {
//         path: '',
//         component: AdminComponent,
//         children: [
//             // { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//             { path: '', component: DashboardComponent },
//             { path: 'users', component: UsersComponent },
//             { path: 'dashboard', component: DashboardComponent },
//         ],
//     },
//     { path: '**', redirectTo: 'dashboard' },
// ];

@NgModule({
    // imports: [RouterModule.forChild([{ path: '', component: AdminComponent }])],

    imports: [
        RouterModule.forChild([
            { path: '', component: DashboardComponent },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'users', component: UsersComponent },
            { path: 'goals', component: GoalsComponent },
            { path: 'departments', component: DepartmentsComponent },
            { path: '**', redirectTo: '/dashboard' },
        ]),
    ],
    exports: [RouterModule],
})
export class AdminRoutingModule {}
