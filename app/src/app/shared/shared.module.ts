import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
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
import { SelectButtonModule } from 'primeng/selectbutton';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { AccordionModule } from 'primeng/accordion';
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
    StringToDatePipe,
    MarkdownPipe,
} from '../pipes/dataFilter';
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
import { SkeletonModule } from 'primeng/skeleton';
import { ScrollerModule } from 'primeng/scroller';
import { TabViewModule } from 'primeng/tabview';
import { DividerModule } from 'primeng/divider';
import { DataViewModule } from 'primeng/dataview';
import { MarkdownModule } from 'ngx-markdown';

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
    StringToDatePipe,
    MarkdownPipe,
];

@NgModule({
    imports: [],
    declarations: [...pipes],
    exports: [
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
        SkeletonModule,
        DynamicDialogModule,
        ScrollerModule,
        AccordionModule,
        TabViewModule,
        DividerModule,
        DataViewModule,
        MarkdownModule,
        ...pipes,
        // FileUpload
    ],
    providers: [FileUpload],
})
export class SharedModule {}