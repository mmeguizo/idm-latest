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
import { GoalService } from 'src/app/demo/service/goal.service';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/demo/service/auth.service';
import { ObjectiveService } from 'src/app/demo/service/objective.service';

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
    cols!: any;
    loading = true;

    userID: string;
    updateGoalID: string;
    subObjectiveGoalID: string;

    subGoalObjective: boolean = false;

    addGoalDialogCard: boolean = false;
    updateGoalDialogCard: boolean = false;

    public addGoalform: any;
    public updateGoalform: any;
    objectiveData: any;

    constructor(
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService,
        private goal: GoalService,
        private auth: AuthService,
        private obj: ObjectiveService
    ) {}

    ngOnInit() {
        console.log('GoalsComponent');
        this.getGoals();

        this.cols = [
            { field: 'goals', header: 'Goals' },
            { field: 'budget', header: 'Budget' },
            { field: 'createdBy', header: 'CreatedBy' },
            { field: 'createdAt', header: 'CreatedAt' },
            { field: 'options', header: 'Options' },
        ];

        this.createAddGoalForm();
        this.createUpdateGoalForm();
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

    getObjectives(id: string) {
        console.log('getObjectives', id);

        this.subObjectiveGoalID = id;
        this.subGoalObjective = true;

        this.obj
            .getRoute('get', 'objectives', `getAllByIdObjectives/${id}`)
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                this.objectiveData = data.Objectives;
                this.loading = false;
                console.log(this.objectiveData);
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

    deleteGoalDialog(event: Event, id: any) {
        this.confirmationService.confirm({
            key: 'confirm2',
            target: event.target || new EventTarget(),
            message: 'Are you sure that you want to delete this goal?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.goal
                    .getRoute('put', 'goals', 'deleteGoals', { id: id })
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

    getAllSubObjectivesForGoal(id: string) {}

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }
}
