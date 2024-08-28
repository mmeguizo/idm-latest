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
                    ...wholeData
                } = data;

                console.log({ ngOnChanges: data });

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
                    wholeData,
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
        wholeData,
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
                        frequency_monitoring: frequency_monitoring,
                        data_source: data_source,
                        budget: budget,
                        remarks: remarks,
                    });
                    this.selectedfrequencyOptions = {
                        name: frequency_monitoring,
                        code: frequency_monitoring,
                    };

                    await this.onFrequencyChange(
                        frequency_monitoring,
                        wholeData
                    );

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

    async onFrequencyChange(event: any, data?: any) {
        const frequency = event?.value?.name || event;
        this.selectedfrequencyOptions = {
            name: event?.value?.name || event,
            code: event?.value?.name || event,
        };
        // Clear existing dynamic controls
        this.clearDynamicControls();

        if (frequency === 'yearly') {
            await this.addMonthlyControls(data);
        } else if (frequency === 'quarterly') {
            await this.addQuarterlyControls(data);
        } else if (frequency === 'semi_annual') {
            await this.addSemiAnnualControls(data);
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

    async addMonthlyControls(data?: any) {
        this.months.forEach((_, i) => {
            const monthValue = data ? data[`month_${i}`] || 0 : 0;
            this.editObjectiveGoalform.addControl(
                `month_${i}`,
                new FormControl(monthValue, Validators.min(0))
            );
        });
    }

    async addQuarterlyControls(data?: any) {
        this.quarters.forEach((_, i) => {
            const monthValue = data ? data[`quarter_${i}`] || 0 : 0;
            this.editObjectiveGoalform.addControl(
                `quarter_${i}`,
                new FormControl(monthValue, Validators.min(0))
            );
        });
    }

    async addSemiAnnualControls(data?: any) {
        this.semi_annual.forEach((_, i) => {
            const monthValue = data ? data[`semi_annual_${i}`] || 0 : 0;
            this.editObjectiveGoalform.addControl(
                `semi_annual_${i}`,
                new FormControl(monthValue, Validators.min(0))
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
    clearEditObjectiveGoalDialogCardDatas() {
        this.editObjectiveGoalDialogCard = false;
    }

    updateSubObjectiveGoalDialogExec(form: any) {
        form.value.id = this.tobeUpdatedSubGoal;
        // form.value.frequency_monitoring =
        //     this.formGroupDropdown.value.selectedDropdown.name;
        form.value.functional_objective = form.value.functional_objective.name;

        let data = {
            ...form.value,
            // functional_objective: form.value.functional_objective.name,
            timetable: new Map(), // Initialize the timetable Map
        };

        if (data.frequency_monitoring === 'yearly') {
            // Remove quarterly and semi_annual fields
            for (let quarter = 1; quarter <= 4; quarter++) {
                delete data[`quarter_${quarter}`];
            }
            for (let i = 0; i <= 2; i++) {
                delete data[`semi_annual_${i}`];
            }

            const timetableMap = new Map();
            for (let month = 0; month < 12; month++) {
                const monthName = new Date(0, month).toLocaleString('default', {
                    month: 'short',
                });
                timetableMap.set(monthName, form.value[`month_${month}`]);
            }
            data.timetable = Array.from(timetableMap.entries());
        } else if (data.frequency_monitoring === 'quarterly') {
            // Remove yearly and semi_annual fields
            for (let month = 0; month <= 12; month++) {
                delete data[`month_${month}`];
            }
            for (let i = 0; i <= 2; i++) {
                delete data[`semi_annual_${i}`];
            }

            const timetableMap = new Map();
            for (let quarter = 1; quarter <= 4; quarter++) {
                timetableMap.set(
                    `Q${quarter}`,
                    form.value[`quarter_${quarter}`]
                );
            }
            data.timetable = Array.from(timetableMap.entries());
        } else if (data.frequency_monitoring === 'semi_annual') {
            // Remove yearly and quarterly fields
            for (let month = 0; month <= 12; month++) {
                delete data[`month_${month}`];
            }
            for (let quarter = 1; quarter <= 4; quarter++) {
                delete data[`quarter_${quarter}`];
            }

            const timetableMap = new Map();
            for (let i = 0; i < 2; i++) {
                const periodName = this.semi_annual[i];
                timetableMap.set(periodName, form.value[`semi_annual_${i}`]);
            }
            data.timetable = Array.from(timetableMap.entries());
        }

        this.obj
            .getRoute('put', 'objectives', 'updateObjectives', data)
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
