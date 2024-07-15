import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GoalsComponent } from './goals/goals.component';
import { GoalDashboardComponent } from './goals/dashboard/dashboard.component';
import { ObjectivesComponent } from './goals/objectives/objectives.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            { path: '', component: DashboardComponent },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'goals', component: GoalsComponent },
            { path: 'goals/dashboard', component: GoalDashboardComponent },
            { path: 'goals/objectives', component: ObjectivesComponent },
            { path: '**', redirectTo: '/dashboard' },
        ]),
    ],
    exports: [RouterModule],
})
export class UserRoutingModule {}
