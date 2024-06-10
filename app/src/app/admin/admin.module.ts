import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { ChipsModule } from 'primeng/chips';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { GoalsComponent } from './goals/goals.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import {
    dataFilterPipe,
    NumberWithCommas,
    IsRead,
    SumPipe,
    AssetsPipe,
    ReverseDate,
    StripTags,
    RoundOff,
    ChatMessagePipe,
    FileNameOnly,
    PesoPipe,
} from '../pipes/dataFilter';
import { DepartmentsComponent } from './departments/departments.component';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { FileUploadModule, FileUpload } from 'primeng/fileupload';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChipModule } from 'primeng/chip';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { BlockUIModule } from 'primeng/blockui';
import { PanelModule } from 'primeng/panel';

const pipes = [
    dataFilterPipe,
    NumberWithCommas,
    IsRead,
    SumPipe,
    AssetsPipe,
    ReverseDate,
    StripTags,
    RoundOff,
    ChatMessagePipe,
    FileNameOnly,
    PesoPipe,
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ChartModule,
        MenuModule,
        TableModule,
        StyleClassModule,
        PanelMenuModule,
        ButtonModule,
        DialogModule,
        PasswordModule,
        AdminRoutingModule,
        AutoCompleteModule,
        CalendarModule,
        ChipsModule,
        DropdownModule,
        InputMaskModule,
        InputNumberModule,
        CascadeSelectModule,
        MultiSelectModule,
        InputTextareaModule,
        InputTextModule,
        ToastModule,
        ConfirmPopupModule,
        SelectButtonModule,
        FileUploadModule,
        InputSwitchModule,
        ProgressBarModule,
        ChipModule,
        OverlayPanelModule,
        CardModule,
        TagModule,
        BlockUIModule,
        PanelModule,
    ],
    declarations: [
        AdminComponent,
        DashboardComponent,
        UsersComponent,
        GoalsComponent,
        DepartmentsComponent,
        ...pipes,
    ],
    exports: [...pipes],
    providers: [FileUpload],
})
export class AdminModule {}
