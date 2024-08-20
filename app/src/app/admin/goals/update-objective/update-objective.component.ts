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
    selector: 'app-update-objective',
    templateUrl: './update-objective.component.html',
    styleUrl: './update-objective.component.scss',
})
export class UpdateObjectiveComponent implements OnInit, OnDestroy {
    @Input() updateObjective: string;
    @Output() childUpdateObjective = new EventEmitter<object>();
    editGoalTrigger: any;
    editObjectiveGoalform: FormGroup;
    formGroupDropdown: FormGroup;
    editObjectiveGoalDialogCard: boolean = false;
    dropdwonSelection: { name: string; code: string }[];
    dropdwonGoallistSelection: { name: string; code: string }[];
    USERID: string;
    private updateObjectiveSubscription = new Subject<void>();
    subObjectiveGoalID: string;
    goal_ObjectId: string;
    customFunctionalName: string;
    goalDataRemainingBudget: number = 0;
    addExecutionGoalId: string;
    addExecutionGoal_Id: any;
    functional_objectiveMatchingDropdown: any;
    tobeUpdatedSubGoal: any;
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
        this.updateObjectiveSubscription.next();
        this.updateObjectiveSubscription.complete();
    }

    async ngOnChanges(changes: SimpleChanges) {
        // add this to make sure it will not detect the previous value only current value
        if (changes['updateObjective']?.currentValue) {
            const { editGoal, data } = changes['updateObjective']?.currentValue;
            if (editGoal && data) {
                const {
                    id,
                    userId,
                    goalId,
                    functional_objective,
                    performance_indicator,
                    target,
                    formula,
                    programs,
                    responsible_persons,
                    clients,
                    timetable,
                    frequency_monitoring,
                    data_source,
                    budget,
                    remarks,
                } = data;

                //need for the backend
                this.tobeUpdatedSubGoal = id;

                this.getAllGoallistsDropdown({
                    userId,
                    goalId,
                    functional_objective,
                    performance_indicator,
                    target,
                    formula,
                    programs,
                    responsible_persons,
                    clients,
                    timetable,
                    frequency_monitoring,
                    data_source,
                    budget,
                    remarks,
                });
            }
        }
    }

    async getAllGoallistsDropdown({
        userId,
        goalId,
        functional_objective,
        performance_indicator,
        target,
        formula,
        programs,
        responsible_persons,
        clients,
        timetable,
        frequency_monitoring,
        data_source,
        budget,
        remarks,
    }) {
        this.goallistService
            .getRoute(
                'get',
                'goallists',
                `getAllEditObjectivesGoallistsDropdown/${goalId}`
            )
            .pipe(takeUntil(this.updateObjectiveSubscription))
            .subscribe({
                next: (data: any) => {
                    this.dropdwonGoallistSelection = data.objectives;
                    console.log({
                        getAllGoallistsDropdown: this.dropdwonGoallistSelection,
                        functional_objective: functional_objective,
                    });

                    this.formGroupDropdown.setValue({
                        selectedDropdown: this.dropdwonSelection.find(
                            (dept) => dept.name === frequency_monitoring
                        ) || { name: 'daily', code: 'Daily' },
                    });

                    this.editObjectiveGoalform.patchValue({
                        userId: userId,
                        goalId: goalId,
                        functional_objective:
                            this.dropdwonGoallistSelection.find(
                                (dept) => dept.name === functional_objective
                            ),
                        // functional_objective: functional_objective,
                        performance_indicator: performance_indicator,
                        target: target,
                        formula: formula,
                        programs: programs,
                        responsible_persons: responsible_persons,
                        clients: clients,
                        timetable: [
                            new Date(timetable[0]),
                            new Date(timetable[1]),
                        ],
                        frequency_monitoring: frequency_monitoring,
                        data_source: data_source,
                        budget: budget,
                        remarks: remarks,
                    });

                    this.editObjectiveGoalDialogCard = true;
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

    createAddObjectiveGoalform() {
        this.editObjectiveGoalform = this.formBuilder.group({
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
    clearEditObjectiveGoalDialogCardDatas() {}

    updateSubObjectiveGoalDialogExec(form: any) {
        form.value.id = this.tobeUpdatedSubGoal;
        form.value.frequency_monitoring =
            this.formGroupDropdown.value.selectedDropdown.name;
        form.value.functional_objective = form.value.functional_objective.name;

        this.obj
            .getRoute('put', 'objectives', 'updateObjectives', form.value)
            .pipe(takeUntil(this.updateObjectiveSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    //close the objective table
                    this.editObjectiveGoalDialogCard = false;
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    console.log(data.data);
                    this.childUpdateObjective.emit({
                        success: true,
                        id: data.data?.goalId,
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

    onGoalChange(event: any) {
        // capture here the goallist id if needed
    }
}
