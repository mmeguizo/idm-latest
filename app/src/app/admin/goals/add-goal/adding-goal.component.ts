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
import { DepartmentService } from 'src/app/demo/service/department.service';
import { MessageService } from 'primeng/api';
import { CampusService } from 'src/app/demo/service/campus.service';
import { AuthService } from 'src/app/demo/service/auth.service';
import { GoallistService } from 'src/app/demo/service/goallists.service';
import { GoalService } from 'src/app/demo/service/goal.service';

@Component({
    selector: 'app-adding-goal',
    templateUrl: './adding-goal.component.html',
    styleUrl: './adding-goal.component.scss',
})
export class AddingGoalComponent implements OnInit, OnDestroy {
    @Input() addNewGoal: string;
    @Output() childAddGoalEvent = new EventEmitter<object>();
    private addGoalSubscription = new Subject<void>();
    public addGoalform: FormGroup;
    formGroupDemo: any;
    deptDropdownValue: any[] = [];
    formGroupCampus: any;
    deptDropdownCampusValue: any[] = [];
    deptDropdownGoalListValue: any[] = [];
    addGoalDialogCard: boolean = false;
    addGoalTrigger: any;
    customGoalName: string;
    USERID: string;
    selectedGoalId: any;

    constructor(
        private formBuilder: FormBuilder,
        private dept: DepartmentService,
        private messageService: MessageService,
        private camp: CampusService,
        private auth: AuthService,
        private goallistService: GoallistService,
        private goal: GoalService
    ) {
        this.USERID = this.auth.getTokenUserID();
    }

    ngOnInit() {
        this.createAddGoalForm();
        this.initializeDropdown();
        this.getAllCampuses();
        this.getAllDept();
        this.getAllGoallistsDropdown();
    }

    initializeDropdown() {
        this.formGroupDemo = new FormGroup({
            selectDepartment: new FormControl(),
        });
        this.formGroupCampus = new FormGroup({
            selectedCampus: new FormControl(),
        });
    }
    // campus dropdown
    getAllCampuses() {
        this.camp
            .fetch('get', 'campus', 'getAllCampus')
            .pipe(takeUntil(this.addGoalSubscription))
            .subscribe({
                next: (data: any) => {
                    this.deptDropdownCampusValue = data.data[0];
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to Campus Dropdown',
                    }); // Display error message
                },
                complete: () => {},
            });
    }
    getAllGoallistsDropdown() {
        this.goallistService
            .getRoute('get', 'goallists', 'getAllGoallistsDropdown')
            .pipe(takeUntil(this.addGoalSubscription))
            .subscribe({
                next: (data: any) => {
                    this.deptDropdownGoalListValue = data.data[0];
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to Goallist Dropdown',
                    }); // Display error message
                },
                complete: () => {},
            });
    }

    // department dropdown
    getAllDept() {
        this.dept
            .getRoute('get', 'department', 'getAllDepartmentDropdown')
            .pipe(takeUntil(this.addGoalSubscription))
            .subscribe({
                next: (data: any) => {
                    this.deptDropdownValue = data.data[0];
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to Department Dropdown',
                    }); // Display error message
                },
                complete: () => {},
            });
    }

    createAddGoalForm() {
        this.addGoalform = this.formBuilder.group({
            goals: ['', [Validators.required]],
            budget: ['', [Validators.required]],
            campus: ['', [Validators.required]],
            department: ['', [Validators.required]],
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        this.addGoalTrigger = changes['addNewGoal']?.currentValue;
        if (this.addGoalTrigger && this.addGoalTrigger.addGoal) {
            this.addGoalDialogCard = true;
        }
    }

    addGoalDialogExec(form: FormGroup) {
        let data = {
            goals: form.value.goals.name || this.customGoalName,
            budget: form.value.budget,
            campus: this.formGroupCampus.value.selectedCampus.name,
            department: this.formGroupDemo.value.selectDepartment.name,
            createdBy: this.USERID,
            goallistsId: this.selectedGoalId || '',
        };

        if (
            data.goals === '' ||
            data.budget === '' ||
            data.campus === '' ||
            data.department === ''
        ) {
            // Handle the error (display a message, log to console, etc.)
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error: One or more required fields are missing or empty.',
            }); // Display error message
            return; // Stop further execution
        }

        this.goal
            .fetch('post', 'goals', 'addGoals', data)
            .pipe(takeUntil(this.addGoalSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    // this.getAllObjectivesWithObjectives();
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    this.addGoalDialogCard = false;
                    this.addGoalform.reset();
                    this.formGroupDemo.reset();
                    this.formGroupCampus.reset();
                    this.childAddGoalEvent.emit({
                        success: true,
                        message: 'Added Goal Successfully',
                    });
                } else {
                    this.messageService.add({
                        severity: 'error  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }

    onHide() {
        this.addGoalDialogCard = false;
    }

    onGoalChange(event: any) {
        if (event.value) {
            this.selectedGoalId = event.value.id;
        }
    }

    ngOnDestroy(): void {
        this.addGoalSubscription.next();
        this.addGoalSubscription.complete();
    }
}
