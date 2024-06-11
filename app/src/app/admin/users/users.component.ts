import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/demo/service/auth.service';
import { UserService } from 'src/app/demo/service/user.service';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
    ValidatorFn,
} from '@angular/forms';
import { DepartmentService } from 'src/app/demo/service/department.service';
export interface UsersElement {
    _id: string;
    id: string;
    username: string;
    email: string;
    role: string;
    status: string;
    loading: boolean;
}

@Component({
    selector: 'ngx-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit, OnDestroy {
    data: any;
    users: any[] = [];
    statuses: any[] = [];
    deptDropdownValue: any[] = [];
    cols!: any;
    loading = true;
    changeStatusCard: boolean = false;
    updateUserCard: boolean = false;
    addUserDialogCard: boolean = false;
    changeStatusId: string;
    updateUserId: string;
    public form: any;
    public Addform: any;
    private getUserSubscription = new Subject<void>();

    roles = [
        { name: 'admin', code: 'admin' },
        { name: 'user', code: 'user' },
    ];

    selectedDept: any;
    selectedRole: any;

    @ViewChild('filter') filter!: ElementRef;
    AllDepartments: any;
    deleteUserCard: boolean;
    deleteUserId: string;
    citiesDemo: { name: string; code: string }[];
    formGroupDemo: any;
    constructor(
        private user: UserService,
        public auth: AuthService,
        public dept: DepartmentService,
        private messageService: MessageService,
        public formBuilder: FormBuilder,
        public AddUserFormBuilder: FormBuilder
    ) {}

    ngOnInit() {
        this.getAllusers();
        this.getAllDepartments();
        this.cols = [
            { field: 'username', header: 'Username' },
            { field: 'email', header: 'Email' },
            { field: 'department', header: 'Department' },
            { field: 'status', header: 'Status' },
            { field: 'role', header: 'Role' },
        ];

        this.statuses = [
            { label: 'Inactive', value: 'unqualified' },
            { label: 'Active', value: 'qualified' },
            { label: 'Pending', value: 'proposal' },
        ];
        this.deptDropdownValue = [
            {
                name: 'office of the secretary',
                code: 'office of the secretary',
            },
            {
                name: 'office of the vice-president',
                code: 'office of the vice-president',
            },
            {
                name: 'office of the president',
                code: 'office of the president',
            },
            {
                name: 'information and communications technology',
                code: 'information and communications technology',
            },
            {
                name: 'department of finance',
                code: 'department of finance',
            },
        ];

        this.createForm();
        this.createFormAddUser();

        this.formGroupDemo = new FormGroup({
            selectedCity: new FormControl(),
        });
    }

    createForm() {
        this.form = this.formBuilder.group({
            username: ['', [Validators.required]],
            email: ['', [Validators.required]],
            department: ['', [Validators.required]],
        });
    }

    createFormAddUser() {
        this.Addform = this.AddUserFormBuilder.group({
            username: ['', [Validators.required]],
            email: [
                '',
                [
                    Validators.required,
                    Validators.email,
                    Validators.pattern('^.+@chmsu.edu.ph$'),
                ],
            ],
            department: new FormControl(),
            password: ['', [Validators.required]],
            confirm: ['', [Validators.required]],
        });
    }

    getAllusers() {
        this.loading = true;
        this.user
            .getRoute('get', 'users', 'getAllUsers')
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                this.users = data.users;
                this.loading = false;
            });
    }

    ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.getUserSubscription.unsubscribe();
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

    updateUser(data) {
        this.selectedDept = data.department;
        this.selectedRole = data.role;

        this.formGroupDemo.setValue({
            selectedCity: this.deptDropdownValue.find(
                (dept) => dept.name === data.department
            ),
        });
        this.form.setValue({
            username: data.username,
            email: data.email,
            department: data.department,
        });

        this.updateUserCard = true;
        this.updateUserId = data.id;
    }

    updateUserExecution(form) {
        let data = {
            id: this.updateUserId,
            username: form.value.username,
            email: form.value.email,
            department: this.formGroupDemo.value.selectedCity.name,
            // role: form.value.role.name,
        };

        this.user
            .getRoute('put', 'users', 'updateUser', data)
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    this.getAllusers();
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    this.updateUserCard = false;
                } else {
                    this.messageService.add({
                        severity: 'danger  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }

    deleteUser(id: string) {
        this.deleteUserCard = true;
        this.deleteUserId = id;
    }
    deleteUserExec() {
        this.user
            .getRoute('put', 'users', 'setInactiveUser', {
                id: this.deleteUserId,
            })
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    this.getAllusers();
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    this.deleteUserCard = false;
                } else {
                    this.messageService.add({
                        severity: 'danger  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }

    changeUserStatus(id: any) {
        this.changeStatusCard = true;
        this.changeStatusId = id;
    }
    changeUserStatuExecution(id?: any) {
        this.changeStatusCard = false;
        this.user
            .getRoute('put', 'users', 'changeUserStatus', {
                id: this.changeStatusId,
            })
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    this.getAllusers();
                    this.changeStatusCard = false;
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                } else {
                    this.messageService.add({
                        severity: 'danger  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                    this.changeStatusCard = false;
                }
            });
    }

    getAllDepartments() {
        this.dept
            .getRoute('get', 'department', 'getAllDepartment')
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                this.AllDepartments = data.department;
            });
    }

    addUser(form: any) {
        let data = {
            username: form.value.username,
            email: form.value.email,
            department: this.formGroupDemo.value.selectedCity.name,
            password: form.value.password,
            confirm: form.value.confirm,
        };

        // if username || email || password || confirm is empty
        if (
            !data.username ||
            !data.email ||
            !data.password ||
            !data.confirm ||
            !data.department
        ) {
            return this.messageService.add({
                severity: 'error  ',
                summary: 'Error',
                detail: 'Please fill in all required fields.',
            });
        }

        this.user
            .getRoute('post', 'users', 'addUser', data)
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    this.getAllusers();
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    this.addUserDialogCard = false;
                    this.Addform.reset();
                } else {
                    this.messageService.add({
                        severity: 'error  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }

    addUserDialogButton() {
        this.addUserDialogCard = true;
    }

    getErrorMessage(formControlName: string) {
        if (this.Addform.get(formControlName)?.hasError('required')) {
            return 'You must enter a value.';
        } else if (this.Addform.get(formControlName)?.hasError('email')) {
            return 'Please enter a valid email address.';
        } else if (this.Addform.get(formControlName)?.hasError('pattern')) {
            return 'Only Chmsu addresses (chmsu.edu.ph) are accepted.';
        }
        return '';
    }
}
