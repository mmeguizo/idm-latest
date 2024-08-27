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
    selectedfrequencyOptions: {
        name: string;
        code: string;
    };

    frequencyOptions = [
        { name: 'yearly', code: 'yearly' },
        { name: 'quarterly', code: 'quarterly' },
        { name: 'semi_annual', code: 'semi_annual' },
    ];

    months: string[] = [];
    quarters: string[] = [];
    semi_annual: string[] = [];

    constructor(
        private formBuilder: FormBuilder,
        private messageService: MessageService,
        private auth: AuthService,
        private obj: ObjectiveService,
        private goallistService: GoallistService
    ) {
        this.USERID = this.auth.getTokenUserID();

        for (let month = 0; month < 12; month++) {
            this.months.push(
                new Date(0, month).toLocaleString('default', { month: 'short' })
            );
        }

        // Initialize quarters array
        this.quarters = [
            'Q1 (Jan-Mar)',
            'Q2 (Apr-Jun)',
            'Q3 (Jul-Sep)',
            'Q4 (Oct-Dec)',
        ];
        this.semi_annual = [
            '(Jan-Feb-Mar-Apr-May-Jun)',
            '(Jul-Aug-Sep-Oct-Nov-Dec)',
        ];
    }

    ngOnInit() {
        this.createeditObjectiveGoalform();
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

            console.log({ data });

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
                next: async (data: any) => {
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
                        // timetable: [
                        //     new Date(timetable[0]),
                        //     new Date(timetable[1]),
                        // ],
                        frequency_monitoring: frequency_monitoring,
                        data_source: data_source,
                        budget: budget,
                        remarks: remarks,
                    });
                    this.selectedfrequencyOptions = {
                        name: frequency_monitoring,
                        code: frequency_monitoring,
                    };

                    await this.onFrequencyChange(frequency_monitoring);

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

    async onFrequencyChange(event: any) {
        const frequency = event?.value?.name || event;
        this.selectedfrequencyOptions = {
            name: event?.value?.name || event,
            code: event?.value?.name || event,
        };
        // Clear existing dynamic controls
        this.clearDynamicControls();

        if (frequency === 'yearly') {
            await this.addMonthlyControls();
        } else if (frequency === 'quarterly') {
            await this.addQuarterlyControls();
        } else if (frequency === 'semi_annual') {
            await this.addSemiAnnualControls();
        }
        console.log(frequency);

        // Update the form control value
        this.editObjectiveGoalform
            .get('frequency_monitoring')
            .setValue(frequency);
    }

    clearDynamicControls() {
        this.months.forEach((_, i) => {
            if (this.editObjectiveGoalform.contains(`month_${i}`)) {
                this.editObjectiveGoalform.removeControl(`month_${i}`);
            }
        });
        this.quarters.forEach((_, i) => {
            if (this.editObjectiveGoalform.contains(`quarter_${i}`)) {
                this.editObjectiveGoalform.removeControl(`quarter_${i}`);
            }
        });
        this.semi_annual.forEach((_, i) => {
            if (this.editObjectiveGoalform.contains(`semi_annual_${i}`)) {
                this.editObjectiveGoalform.removeControl(`semi_annual_${i}`);
            }
        });
    }

    async addMonthlyControls() {
        this.months.forEach((_, i) => {
            this.editObjectiveGoalform.addControl(
                `month_${i}`,
                new FormControl(0, Validators.min(0))
            );
        });
    }

    async addQuarterlyControls() {
        this.quarters.forEach((_, i) => {
            this.editObjectiveGoalform.addControl(
                `quarter_${i}`,
                new FormControl(0, Validators.min(0))
            );
        });
    }

    async addSemiAnnualControls() {
        this.semi_annual.forEach((_, i) => {
            this.editObjectiveGoalform.addControl(
                `semi_annual_${i}`,
                new FormControl(0, Validators.min(0))
            );
        });
    }

    createeditObjectiveGoalform() {
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
