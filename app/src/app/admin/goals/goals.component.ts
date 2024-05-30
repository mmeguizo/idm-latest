import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { Subject, pipe, takeUntil } from 'rxjs';
import { Table } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GoalService } from 'src/app/demo/service/goal.service';
import {
    FormBuilder,
    Validators,
    FormControl,
    FormGroup,
} from '@angular/forms';
import { AuthService } from 'src/app/demo/service/auth.service';
import { ObjectiveService } from 'src/app/demo/service/objective.service';
import { DepartmentService } from 'src/app/demo/service/department.service';

AuthService;
@Component({
    selector: 'app-goals',
    templateUrl: './goals.component.html',
    styleUrl: './goals.component.scss',
})
export class GoalsComponent implements OnInit, OnDestroy {
    private getGoalSubscription = new Subject<void>();
    @ViewChild('filter') filter!: ElementRef;
    goals: any[] = [];
    Alldepts: any[] = [];
    cols!: any;
    loading = true;

    userID: string;
    updateGoalID: string;
    subObjectiveGoalID: string;

    subGoalObjective: boolean = false;

    addGoalDialogCard: boolean = false;
    addObjectiveGoalDialogCard: boolean = false;
    updateGoalDialogCard: boolean = false;

    public addGoalform: any;
    public updateGoalform: any;
    public addObjectiveGoalform: any;
    formGroupDropdown: any;
    frequency: any;

    objectiveDatas: any;
    deptDropdownValue: any[] = [];
    dropdwonSelection: { name: string; code: string }[];
    updateObjectiveGoalFlag: boolean;
    tobeUpdatedSubGoal: any;
    goal_ObjectId: string;

    constructor(
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService,
        private goal: GoalService,
        private auth: AuthService,
        private obj: ObjectiveService,
        private dept: DepartmentService
    ) {}

    ngOnInit() {
        this.getAllDept();
        console.log('GoalsComponent');
        this.getGoals();

        this.frequency = [
            { name: 'daily', code: 'Daily' },
            { name: 'weekly', code: 'Weekly' },
            { name: 'monthly', code: 'Monthly' },
            { name: 'yearly', code: 'Yearly' },
            { name: 'quarterly', code: 'Quarterly' },
            { name: 'biannually', code: 'Biannually' },
        ];

        this.dropdwonSelection = [
            { name: 'daily', code: 'Daily' },
            { name: 'weekly', code: 'Weekly' },
            { name: 'monthly', code: 'Monthly' },
            { name: 'yearly', code: 'Yearly' },
            { name: 'quarterly', code: 'Quarterly' },
            { name: 'biannually', code: 'Biannually' },
        ];

        this.cols = [
            { field: 'goals', header: 'Goals' },
            { field: 'budget', header: 'Budget' },
            { field: 'createdBy', header: 'CreatedBy' },
            { field: 'createdAt', header: 'CreatedAt' },
            { field: 'options', header: 'Options' },
        ];

        this.createAddGoalForm();
        this.createUpdateGoalForm();
        this.createAddObjectiveGoalform();

        this.formGroupDropdown = new FormGroup({
            selectedDropdown: new FormControl(),
        });
    }

    ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.getGoalSubscription.unsubscribe();
    }

    createAddGoalForm() {
        this.addGoalform = this.formBuilder.group({
            goals: ['', [Validators.required]],
            budget: ['', [Validators.required]],
        });
    }
    createAddObjectiveGoalform() {
        this.addObjectiveGoalform = this.formBuilder.group({
            // department: ['', [Validators.required]],
            userId: ['', [Validators.required]],
            goalId: ['', [Validators.required]],
            functional_objective: ['', [Validators.required]],
            performance_indicator: ['', [Validators.required]],
            target: ['', [Validators.required]],
            formula: ['', [Validators.required]],
            programs: ['', [Validators.required]],
            responsible_persons: ['', [Validators.required]],
            clients: ['', [Validators.required]],
            timetable: ['', [Validators.required]],
            frequency_monitoring: ['', [Validators.required]],
            data_source: ['', [Validators.required]],
            budget: ['', [Validators.required]],
        });
    }

    createUpdateGoalForm() {
        this.updateGoalform = this.formBuilder.group({
            goals: ['', [Validators.required]],
            budget: ['', [Validators.required]],
        });
    }

    getGoals() {
        this.goal
            .getRoute('get', 'goals', 'getAllGoals')
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                this.goals = data.goals;
                this.loading = false;
                console.log(this.goals);
            });
    }
    getAllDept() {
        this.dept
            .getRoute('get', 'department', 'getAllDepartment')
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                let map = data.departments.map((e) => ({
                    name: e.department,
                    code: e.department,
                }));
                this.deptDropdownValue.push(...map);
            });
    }

    updateGoal(goal) {
        this.updateGoalDialogCard = true;
        this.updateGoalID = goal.id;
        this.updateGoalform = this.formBuilder.group({
            goals: [goal.goals || '', [Validators.required]],
            budget: [goal.budget || 0, [Validators.required]],
        });
    }
    deleteGoal(id: string) {
        console.log('deleteGoal', id);
    }

    getObjectives(id: string, objectId?: string) {
        console.log('getObjectives', id);
        console.log('getObjectives', objectId);

        this.subObjectiveGoalID = id;
        this.goal_ObjectId = objectId;
        this.subGoalObjective = true;

        this.obj
            .getRoute('get', 'objectives', `getAllByIdObjectives/${id}`)
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                this.objectiveDatas = data.Objectives;
                this.loading = false;
                console.log(this.objectiveDatas);
            });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    addGoal() {
        this.addGoalDialogCard = true;
        console.log('addGoal');
    }

    addGoalDialogExec(form: any) {
        this.userID = this.auth.getTokenUserID();

        let data = {
            goals: form.value.goals,
            budget: form.value.budget,
            createdBy: this.userID,
        };

        this.goal
            .getRoute('post', 'goals', 'addGoals', data)
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    this.getGoals();
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    this.addGoalDialogCard = false;
                    this.addGoalform.reset();
                } else {
                    this.messageService.add({
                        severity: 'error  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }

    updateGoalDialogExec(form: any) {
        let data = {
            id: this.updateGoalID,
            goals: form.value.goals,
            budget: form.value.budget,
        };
        this.goal
            .getRoute('put', 'goals', 'updateGoals', data)
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    this.getGoals();
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    this.updateGoalDialogCard = false;
                    this.updateGoalform.reset();
                } else {
                    this.messageService.add({
                        severity: 'error  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }

    deleteGoalDialog(event: Event, _id: any) {
        this.confirmationService.confirm({
            key: 'deleteGoal',
            target: event.target || new EventTarget(),
            message:
                'Stop! Deleting this goal will delete all objectives under it?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.goal
                    .getRoute('put', 'goals', 'deleteGoals', { _id: _id })
                    .pipe(takeUntil(this.getGoalSubscription))
                    .subscribe((data: any) => {
                        if (data.success) {
                            this.getGoals();
                            this.messageService.add({
                                severity: 'success  ',
                                summary: 'Done',
                                detail: data.message,
                            });
                            this.updateGoalDialogCard = false;
                            this.updateGoalform.reset();
                        } else {
                            this.messageService.add({
                                severity: 'error  ',
                                summary: 'Error',
                                detail: data.message,
                            });
                        }
                    });
            },
        });
    }

    updateSubGoal(data: any) {
        console.log({ updateSubGoal: data });
        this.tobeUpdatedSubGoal = data.id;
        //reset every after click
        this.addObjectiveGoalform.reset();
        // this.formGroupDropdown.reset();

        this.updateObjectiveGoalFlag = true;
        this.addObjectiveGoalDialogCard = true;
        this.formGroupDropdown.setValue({
            selectedDropdown: this.dropdwonSelection.find(
                (dept) => dept.name === data.frequency_monitoring
            ) || { name: 'daily', code: 'Daily' },
        });

        this.addObjectiveGoalform.patchValue({
            // department: ['', [Validators.required]],
            userId: data.userId,
            goalId: data.goalId,
            functional_objective: data.functional_objective,
            performance_indicator: data.performance_indicator,
            target: data.target,
            formula: data.formula,
            programs: data.programs,
            responsible_persons: data.responsible_persons,
            clients: data.clients,
            timetable: [
                new Date(data.timetable[0]),
                new Date(data.timetable[1]),
            ],
            frequency_monitoring: data.frequency_monitoring,
            data_source: data.data_source,
            budget: data.budget,
        });
    }

    clearAddObjectiveGoalDialogCardDatas() {
        this.addObjectiveGoalDialogCard = false;
        this.tobeUpdatedSubGoal = null;
    }

    deleteSubGoal(id: string, goalId: string) {
        console.log('deleteSubGoal', id);

        this.confirmationService.confirm({
            key: 'deleteSubGoal',
            target: event.target || new EventTarget(),
            message: 'Are you sure that you want to delete this Objectives?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.goal
                    .getRoute('put', 'objectives', 'setInactiveObjectives', {
                        id: id,
                    })
                    .pipe(takeUntil(this.getGoalSubscription))
                    .subscribe((data: any) => {
                        if (data.success) {
                            this.getObjectives(goalId);
                            this.messageService.add({
                                severity: 'success  ',
                                summary: 'Done',
                                detail: data.message,
                            });
                            this.updateGoalDialogCard = false;
                            this.updateGoalform.reset();
                        } else {
                            this.messageService.add({
                                severity: 'error  ',
                                summary: 'Error',
                                detail: data.message,
                            });
                        }
                    });
            },
        });
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    closeSubGoalTable() {
        console.log('closeSubGoalTable');

        this.subGoalObjective = false;
        this.objectiveDatas = [];
    }

    addSubGoal() {
        console.log('addSubGoal', this.subObjectiveGoalID);
        this.addObjectiveGoalDialogCard = true;
    }

    addSubObjectiveGoalDialogExec(e) {
        console.log({ goal_ObjectId: this.goal_ObjectId });

        e.value.userId = this.auth.getTokenUserID();
        e.value.goalId = this.subObjectiveGoalID;
        e.value.goal_Id = this.goal_ObjectId;
        e.value.frequency_monitoring =
            this.formGroupDropdown.value.selectedDropdown.name;
        e.value.createdBy = this.auth.getTokenUserID();
        console.log(e.value);

        this.obj
            .getRoute('post', 'objectives', 'addObjectives', e.value)
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                console.log(data.data.Objectives.goal_Id);
                console.log({ 'this.goal_ObjectId': this.goal_ObjectId });

                if (data.success) {
                    this.getObjectives(this.subObjectiveGoalID);
                    this.addObjectiveGoalDialogCard = false;
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    //fix the error becomes null after adding new objective
                    this.goal_ObjectId = data.data.Objectives.goal_Id;
                    console.log({ 'this.goal_ObjectId': this.goal_ObjectId });

                    this.addObjectiveGoalform.reset();
                    this.formGroupDropdown.reset();
                } else {
                    this.messageService.add({
                        severity: 'error  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }

    updateSubObjectiveGoalDialogExec(form: any) {
        form.value.id = this.tobeUpdatedSubGoal;
        form.value.frequency_monitoring =
            this.formGroupDropdown.value.selectedDropdown.name;
        console.log(form.value);
        console.log(this.formGroupDropdown.value.selectedDropdown.name);
        this.obj
            .getRoute('put', 'objectives', 'updateObjectives', form.value)
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    this.getObjectives(this.subObjectiveGoalID);
                    this.addObjectiveGoalDialogCard = false;
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
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
}
