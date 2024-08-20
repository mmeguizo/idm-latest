import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    SimpleChanges,
    Output,
    EventEmitter,
} from '@angular/core';

import { AuthService } from 'src/app/demo/service/auth.service';

import { Subject, pipe, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import {
    FormBuilder,
    Validators,
    FormControl,
    FormGroup,
} from '@angular/forms';
import { ObjectiveService } from 'src/app/demo/service/objective.service';
import { GoallistService } from 'src/app/demo/service/goallists.service';

@Component({
    selector: 'app-add-objective',
    templateUrl: './add-objective.component.html',
    styleUrl: './add-objective.component.scss',
})
export class AddObjectiveComponent implements OnInit, OnDestroy {
    @Input() addNewObjective: string;
    @Output() childAddObjectiveEvent = new EventEmitter<object>();
    addGoalTrigger: any;
    addObjectiveGoalform: FormGroup;
    formGroupDropdown: FormGroup;
    addObjectiveGoalDialogCard: boolean = false;
    dropdwonSelection: { name: string; code: string }[];
    dropdwonGoallistSelection: { name: string; code: string }[];
    USERID: string;
    private addObjectiveSubscription = new Subject<void>();
    subObjectiveGoalID: string;
    goal_ObjectId: string;
    customFunctionalName: string;
    goalDataRemainingBudget: number = 0;
    addExecutionGoalId: string;
    addExecutionGoal_Id: any;
    constructor(
        private formBuilder: FormBuilder,
        private messageService: MessageService,
        private auth: AuthService,
        private obj: ObjectiveService,
        private goallistService: GoallistService
    ) {
        this.USERID = this.auth.getTokenUserID();
    }

    ngOnInit() {
        this.createAddObjectiveGoalform();
        this.formGroupDropdown = new FormGroup({
            selectedDropdown: new FormControl(),
        });
        this.dropdwonSelection = [
            { name: 'daily', code: 'Daily' },
            { name: 'weekly', code: 'Weekly' },
            { name: 'monthly', code: 'Monthly' },
            { name: 'yearly', code: 'Yearly' },
            { name: 'quarterly', code: 'Quarterly' },
            { name: 'biannually', code: 'Biannually' },
        ];
    }
    ngOnDestroy(): void {
        this.addObjectiveSubscription.next();
        this.addObjectiveSubscription.complete();
    }

    async ngOnChanges(changes: SimpleChanges) {
        this.addGoalTrigger = changes['addNewObjective']?.currentValue;
        let id = this.addGoalTrigger?.goallistsId;
        this.addExecutionGoalId = this.addGoalTrigger?.goalId;
        this.addExecutionGoal_Id = this.addGoalTrigger?.goal_ObjectId;
        if (
            this.addGoalTrigger?.addObjective &&
            this.addGoalTrigger?.goallistsId
        ) {
            this.getAllGoallistsDropdown(id);
            setTimeout(() => {
                this.addObjectiveGoalDialogCard = true;
            }, 0);
        }
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
            remarks: ['', [Validators.required]],
            budget: ['', [Validators.required]],
        });
    }

    async getAllGoallistsDropdown(id: string) {
        this.goallistService
            .getRoute(
                'get',
                'goallists',
                `getAllAddObjectivesGoallistsDropdown/${id}`
            )
            .pipe(takeUntil(this.addObjectiveSubscription))
            .subscribe({
                next: (data: any) => {
                    this.dropdwonGoallistSelection = data.objectives;
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

    clearAddObjectiveGoalDialogCardDatas() {
        this.addObjectiveGoalDialogCard = false;
        this.addObjectiveGoalform.reset();
    }

    addSubObjectiveGoalDialogExec(e: any) {
        const { addExecutionGoalId, formGroupDropdown, goal_ObjectId, USERID } =
            this;

        let data = {
            ...e.value,
            functional_objective: e.value.functional_objective.name,
            userId: USERID,
            goalId: addExecutionGoalId, // Final goalId value
            goal_Id: this.addExecutionGoal_Id,
            frequency_monitoring: formGroupDropdown.value.selectedDropdown.name,
            createdBy: USERID,
        };

        console.log({ addObjectives: data });

        this.obj
            .getRoute('post', 'objectives', 'addObjectives', data)
            .pipe(takeUntil(this.addObjectiveSubscription))
            .subscribe((data: any) => {
                console.log({ addSubObjectiveGoalDialogExec: data });

                if (data.success) {
                    this.addObjectiveGoalDialogCard = false;
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    //fix the error becomes null after adding new objective
                    this.goal_ObjectId = data.data.goal_Id;
                    // clear the data
                    this.addObjectiveGoalform.reset();
                    this.formGroupDropdown.reset();
                    this.goalDataRemainingBudget = 0;
                    this.childAddObjectiveEvent.emit(data.data);
                } else {
                    this.messageService.add({
                        severity: 'warn  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }

    onGoalChange(event: any) {
        // capture here the goallist id if needed
    }
}
