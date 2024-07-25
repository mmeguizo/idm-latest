import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { GoalsComponent } from './goals/goals.component';
import { GoalDashboardComponent } from './goals/dashboard/dashboard.component';
import { DepartmentsComponent } from './departments/departments.component';
import { LogsComponent } from './logs/logs.component';
import { ObjectivesComponent } from './goals/objectives/objectives.component';
import { AiComponent } from './ai/ai.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            { path: '', component: DashboardComponent },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'users', component: UsersComponent },
            { path: 'goals', component: GoalsComponent },
            { path: 'goals/dashboard', component: GoalDashboardComponent },
            { path: 'goals/objectives', component: ObjectivesComponent },
            { path: 'departments', component: DepartmentsComponent },
            { path: 'logs', component: LogsComponent },
            { path: 'ai', component: AiComponent },
            { path: '**', redirectTo: '/dashboard' },
        ]),
    ],
    exports: [RouterModule],
})
export class AdminRoutingModule {}
