import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
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
    constructor(
        private messageService: MessageService,
        public formBuilder: FormBuilder,
        public department: DepartmentService
    ) {}

    ngOnInit() {
        console.log('DepartmentComponent');
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
                console.log(this.depts);
            });
    }

    updateDept(goal) {
        console.log('updateDept', goal);
    }
    deleteDept(id: string) {
        console.log('deleteDept', id);
    }

    changeDeptStatus(id: string) {
        console.log('changeDeptStatus', id);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }
}
