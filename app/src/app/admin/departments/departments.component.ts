import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Table } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, Validators } from '@angular/forms';
import { DepartmentService } from 'src/app/demo/service/department.service';

@Component({
    selector: 'app-departments',
    templateUrl: './departments.component.html',
    styleUrl: './departments.component.scss',
})
export class DepartmentsComponent implements OnInit, OnDestroy {
    private getdepartmenttSubscription = new Subject<void>();
    @ViewChild('filter') filter!: ElementRef;
    depts: any[] = [];
    cols!: any;
    loading = true;
    changeStatusCard: boolean = false;
    cardCrudDialog: boolean = false;
    departmentName: string = '';
    updatingDept: boolean;
    updateDepartmentId: any;

    constructor(
        private messageService: MessageService,
        public formBuilder: FormBuilder,
        public department: DepartmentService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.getDepartments();

        this.cols = [
            { field: 'department', header: 'Department' },
            { field: 'status', header: 'Status' },
            { field: 'options', header: 'Options' },
        ];
    }

    ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.getdepartmenttSubscription.unsubscribe();
    }

    getDepartments() {
        this.department
            .getRoute('get', 'department', 'getAllDepartment')
            .pipe(takeUntil(this.getdepartmenttSubscription))
            .subscribe((data: any) => {
                this.depts = data.departments;
                this.loading = false;
            });
    }

    addDept() {
        this.cardCrudDialog = true;
    }

    updateDept(dept: any) {
        this.departmentName = dept.department;
        this.updateDepartmentId = dept.id;
        this.updatingDept = true;
        this.cardCrudDialog = true;
    }

    updateDepartmentExec() {
        if (this.departmentName == '') {
            return this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please provide Department Name',
            });
        }
        this.loading = true;

        this.department
            .getRoute('put', 'department', 'updateDepartment', {
                id: this.updateDepartmentId,
                department: this.departmentName,
            })
            .pipe(takeUntil(this.getdepartmenttSubscription))
            .subscribe((data: any) => {
                this.cardCrudDialog = false;
                this.getDepartments();
                this.loading = false;
                this.messageService.add({
                    severity: 'success  ',
                    summary: 'Done',
                    detail: data.message,
                    life: 5000,
                });
                this.departmentName = '';
                this.updateDepartmentId = '';
            });
    }
    deleteDept(id: string) {
        this.confirmationService.confirm({
            key: 'updateDepartment',
            target: event.target as EventTarget,
            message: `This will remove completely on the database?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'none',
            rejectIcon: 'none',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.department
                    .getRoute('put', 'department', 'deleteDepartment', {
                        id: id,
                    })
                    .pipe(takeUntil(this.getdepartmenttSubscription))
                    .subscribe((data: any) => {
                        this.getDepartments();
                        this.messageService.add({
                            severity: 'success  ',
                            summary: 'Done',
                            detail: data.message,
                            life: 5000,
                        });
                    });
            },
            reject: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Done',
                    detail: 'Got it...',
                    life: 3000,
                });
            },
        });
    }

    changeDeptStatus(event: Event, id: string) {
        this.confirmationService.confirm({
            key: 'updateDepartment',
            target: event.target as EventTarget,
            message: `Change Status?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'none',
            rejectIcon: 'none',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.department
                    .getRoute('put', 'department', 'changeDepartmentStatus', {
                        id: id,
                    })
                    .pipe(takeUntil(this.getdepartmenttSubscription))
                    .subscribe((data: any) => {
                        this.getDepartments();
                        this.messageService.add({
                            severity: 'success  ',
                            summary: 'Done',
                            detail: data.message,
                            life: 5000,
                        });
                    });
            },
            reject: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Done',
                    detail: 'Nothing happens',
                    life: 3000,
                });
            },
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    addDeptDialogExec() {
        if (this.departmentName == '') {
            return this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please provide Department Name',
            });
        }
        this.loading = true;

        this.department
            .getRoute('post', 'department', 'addDepartment', {
                department: this.departmentName,
            })
            .pipe(takeUntil(this.getdepartmenttSubscription))
            .subscribe((data: any) => {
                this.cardCrudDialog = false;
                this.getDepartments();
                this.loading = false;
                this.messageService.add({
                    severity: 'success  ',
                    summary: 'Done',
                    detail: data.message,
                    life: 5000,
                });
            });
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }
}
