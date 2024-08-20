import { NgModule } from '@angular/core';

import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { GoalsComponent } from './goals/goals.component';
import { DepartmentsComponent } from './departments/departments.component';
import { LogsComponent } from './logs/logs.component';
import { GoalDashboardComponent } from './goals/dashboard/dashboard.component';
import { ObjectivesComponent } from './goals/objectives/objectives.component';
import { FileUploadModule, FileUpload } from 'primeng/fileupload';
import { SharedModule } from '../shared/shared.module';
import { AiComponent } from './ai/ai.component';
import { MarkdownModule } from 'ngx-markdown';
import 'prismjs';
import 'prismjs/components/prism-typescript.min.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-highlight/prism-line-highlight.js';
@NgModule({
    imports: [AdminRoutingModule, SharedModule, MarkdownModule.forRoot()],
    declarations: [
        AdminComponent,
        DashboardComponent,
        UsersComponent,
        GoalsComponent,
        DepartmentsComponent,
        LogsComponent,
        GoalDashboardComponent,
        ObjectivesComponent,
        AiComponent,
    ],
    providers: [FileUpload],
})
export class AdminModule {}
