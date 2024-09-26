import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    ChangeDetectorRef,
    SimpleChanges,
    Output,
    EventEmitter,
} from '@angular/core';
import {
    FormBuilder,
    Validators,
    FormControl,
    FormGroup,
} from '@angular/forms';
import { Subject, pipe, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/demo/service/auth.service';
import { DepartmentService } from 'src/app/demo/service/department.service';
import { CampusService } from 'src/app/demo/service/campus.service';
import { ROLE_OPTIONS } from '../contants';
import { UserService } from 'src/app/demo/service/user.service';
import { Campus } from 'src/app/interface/campus-location.interface';
@Component({
    selector: 'app-edit-user',
    templateUrl: './edit-user.component.html',
    styleUrl: './edit-user.component.scss',
})
export class EditUserComponent implements OnInit, OnDestroy {
    @Input() updateUser: string;
    @Output() childEditUserEvent = new EventEmitter<object>();
    deptDropdownCampusValue: any[] = [];
    deptDropdownValue: any[] = [];
    updateUserCard: boolean = false;
    public form: FormGroup;
    formGroupDemo: FormGroup;
    formGroupCampus: FormGroup;
    editNewUserEventFromParent: any;
    private getUserSubscription = new Subject<void>();
    selectedDept: string;
    selectedRole: string;
    updateUserId: string;
    roleOptions = ROLE_OPTIONS;

    constructor(
        public AddUserFormBuilder: FormBuilder,
        public auth: AuthService,
        public dept: DepartmentService,
        public camp: CampusService,
        public user: UserService,
        private messageService: MessageService,
        public formBuilder: FormBuilder
    ) {}
    ngOnInit() {
        this.createForm();
        this.formGroupDemo = new FormGroup({
            selectDepartment: new FormControl(),
        });
        this.formGroupCampus = new FormGroup({
            selectedCampus: new FormControl(),
        });

        this.getAllCampuses();
        this.getAllDepartmentDropdown();
    }

    ngOnChanges(changes: SimpleChanges) {
        const data = changes['updateUser']?.currentValue?.data;
        this.editNewUserEventFromParent = changes['updateUser']?.currentValue;
        if (
            this.editNewUserEventFromParent &&
            this.editNewUserEventFromParent.updateUser
        ) {
            this.updateUserCard =
                this.editNewUserEventFromParent.updateUserCard;

            this.selectedDept = data.department;
            this.selectedRole = data.role;

            this.formGroupDemo.setValue({
                selectDepartment: this.deptDropdownValue.find(
                    (dept) => dept.name === data.department
                ),
            });

            // set role
            this.form.controls['role'].setValue(
                this.roleOptions.find((role) => role === data.role)
            );

            this.formGroupCampus.setValue({
                selectedCampus: this.deptDropdownCampusValue.find(
                    (dept) => dept.name === data.campus
                ),
            });

            this.form.setValue({
                username: data.username,
                email: data.email,
                department: data.department,
                campus: data.campus,
                role: data.role,
                password: '',
                confirm: '',
            });

            this.updateUserCard = true;
            this.updateUserId = data.id;
        }
    }

    createForm() {
        this.form = this.formBuilder.group({
            username: ['', [Validators.required]],
            email: ['', [Validators.required]],
            department: ['', [Validators.required]],
            campus: ['', [Validators.required]],
            role: ['', [Validators.required]],
            password: ['', [Validators.required]],
            confirm: ['', [Validators.required]],
        });
    }

    getAllCampuses() {
        this.camp
            .fetch('get', 'campus', 'getAllCampus')
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                this.deptDropdownCampusValue = data.data[0];
            });
    }
    getAllDepartmentDropdown() {
        this.camp
            .fetch('get', 'department', 'getAllDepartmentDropdown')
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                this.deptDropdownValue = data.data[0];
            });
    }
    ngOnDestroy(): void {
        this.getUserSubscription.next();
        this.getUserSubscription.complete();
    }

    updateUserExecution(form: FormGroup): void {
        let data = {
            id: this.updateUserId,
            username: form.value.username,
            email: form.value.email,
            department: this.formGroupDemo.value.selectDepartment.name,
            campus: this.formGroupCampus.value.selectedCampus.name,
            role: form.value.role,
            password: form.value.password.trim(),
            confirm: form.value.confirm.trim(),
        };
        this.user
            .fetch('put', 'users', 'updateUser', data)
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    this.childEditUserEvent.emit({
                        data: data.data,
                        addEditedUser: true,
                    });

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
}
