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

@Component({
    selector: 'app-add-user',
    templateUrl: './add-user.component.html',
    styleUrl: './add-user.component.scss',
})
export class AddUserComponent implements OnInit, OnDestroy {
    @Input() addNewUser: string;
    @Output() childAddUserEvent = new EventEmitter<object>();

    // dropdown values
    deptDropdownCampusValue: any[] = [];
    dropdownVPValue: any[] = [];
    deptDropdownValue: any[] = [];
    selectVP: any[] = [];
    addUserDialogCard: boolean = false;
    roleOptions = ROLE_OPTIONS;

    addnewUserEventFromParent: any;
    private getUserSubscription = new Subject<void>();
    // public  FormGroup;
    Addform: FormGroup;
    formGroupCampus: FormGroup;
    formGroupDemo: FormGroup;
    formGroupVP: FormGroup;
    ngOnInit() {
        this.createFormAddUser();
        this.formGroupVP = new FormGroup({
            selectVP: new FormControl(),
        });
        this.formGroupDemo = new FormGroup({
            selectDepartment: new FormControl(),
        });
        this.formGroupCampus = new FormGroup({
            selectedCampus: new FormControl(),
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        this.addnewUserEventFromParent = changes['addNewUser']?.currentValue;
        if (
            this.addnewUserEventFromParent &&
            this.addnewUserEventFromParent.addNewUser
        ) {
            this.addUserDialogCard =
                this.addnewUserEventFromParent.addUserDialogCard;
            this.getAllCampuses();
            this.getAllDepartmentDropdown();
            this.getAllVicePresident();
        }
    }

    constructor(
        public AddUserFormBuilder: FormBuilder,
        public auth: AuthService,
        public dept: DepartmentService,
        public camp: CampusService,
        public user: UserService,
        private messageService: MessageService,
        public formBuilder: FormBuilder
    ) {}

    createFormAddUser() {
        this.Addform = this.AddUserFormBuilder.group({
            firstname: ['', [Validators.required]],
            lastname: ['', [Validators.required]],
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
            role: ['', [Validators.required]],
            vice_president: ['', [Validators.required]],
            director: ['', [Validators.required]],
        });
    }

    getAllVicePresident() {
        this.user
            .fetch('get', 'users', 'getAllVicePresident')
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                this.selectVP = data.data[0];
                console.log('getAllVicePresident', this.selectVP);
            });
    }

    getAllDirectors() {}

    getAllCampuses() {
        this.camp
            .fetch('get', 'campus', 'getAllCampus')
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                console.log('getAllCampuses', data);

                this.deptDropdownCampusValue = data.data[0];
            });
    }
    getAllDepartmentDropdown() {
        this.camp
            .fetch('get', 'department', 'getAllDepartmentDropdown')
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                console.log('getAllDepartmentDropdown', data);

                this.deptDropdownValue = data.data[0];
            });
    }

    async addUserFunction(form: FormGroup): Promise<void> {
        let data = {
            firstname: form.value.firstname,
            lastname: form.value.lastname,
            username: form.value.username,
            email: form.value.email,
            department: this.formGroupDemo.value.selectDepartment.code,
            campus: this.formGroupCampus.value.selectedCampus.name,
            password: form.value.password.trim(),
            confirm: form.value.confirm.trim(),
            role: form.value.role.code,
        };

        console.log('addUserFunction', data);
        this.user
            .fetch('post', 'users', 'addUser', data)
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    // this.getAllusers();
                    this.childAddUserEvent.emit({
                        data: data.data,
                        addNewUser: true,
                    });
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

    ngOnDestroy(): void {
        this.getUserSubscription.next();
        this.getUserSubscription.complete();
    }
}
