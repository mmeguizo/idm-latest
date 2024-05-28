import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
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
            { path: '**', redirectTo: '/dashboard' },
        ]),
    ],
    exports: [RouterModule],
})
export class UserRoutingModule {}
