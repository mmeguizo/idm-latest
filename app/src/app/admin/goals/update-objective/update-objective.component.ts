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
import { FileService } from 'src/app/demo/service/file.service';

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

    // file service
    uploadedFiles: any[] = [];
    addFileTrigger: any;
    userID: string;
    objectiveIDforFile: any;
    AllObjectivesFiles: any[] = [];
    loading: boolean;
    disableUpload: boolean = false;
    uploadSuccessFlag: boolean = false;

    // file service child
    showAddFilesComponent = false;
    parentAddnewFile: any;

    constructor(
        private formBuilder: FormBuilder,
        private messageService: MessageService,
        private auth: AuthService,
        private obj: ObjectiveService,
        private goallistService: GoallistService,
        private fileService: FileService
    ) {
        this.USERID = this.auth.getTokenUserID();

        for (let month = 0; month < 12; month++) {
            this.months.push(
                new Date(0, month).toLocaleString('default', { month: 'short' })
            );
        }

        // Initialize quarters array
        this.quarters = ['quarter_0', 'quarter_1', 'quarter_2', 'quarter_3'];
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
        this.uploadSuccessFlag = false;
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
                        await frequency_monitoring,
                        wholeData
                    );
                    // Update the form control value
                    this.editObjectiveGoalform
                        .get('frequency_monitoring')
                        .setValue(frequency_monitoring);
                    //add delay to prepare the forms
                    setTimeout(() => {
                        this.editObjectiveGoalDialogCard = true;
                    }, 300);
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

        console.log({ onFrequencyChange: frequency });

        if (frequency === 'yearly') {
            await this.addMonthlyControls(await data);
        } else if (frequency === 'quarterly') {
            await this.addQuarterlyControls(await data);
        } else if (frequency === 'semi_annual') {
            await this.addSemiAnnualControls(await data);
        }
    }

    clearDynamicControls() {
        // Clear monthly controls
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

        // Clear semi-annual controls
        this.semi_annual.forEach((_, i) => {
            if (this.editObjectiveGoalform.contains(`semi_annual_${i}`)) {
                this.editObjectiveGoalform.removeControl(`semi_annual_${i}`);
            }
        });
    }

    async addMonthlyControls(data?: any) {
        this.months.forEach((_, i) => {
            const monthValue = data ? data[`month_${i}`] || 0 : 0;
            const fileMonthValue = data ? data[`file_month_${i}`] || '' : '';
            this.editObjectiveGoalform.addControl(
                `month_${i}`,
                new FormControl(monthValue, Validators.min(0))
            );
            this.editObjectiveGoalform.addControl(
                `file_month_${i}`,
                new FormControl(fileMonthValue)
            );
        });
    }

    async addQuarterlyControls(data?: any) {
        // Add controls for quarters 0 to 3
        for (let quarter = 0; quarter <= 3; quarter++) {
            const quarterValue = data ? data[`quarter_${quarter}`] || 0 : 0;
            const fileQuarterValue = data
                ? data[`file_quarter_${quarter}`] || ''
                : '';
            this.editObjectiveGoalform.addControl(
                `quarter_${quarter}`,
                new FormControl(quarterValue, Validators.min(0))
            );
            this.editObjectiveGoalform.addControl(
                `file_quarter_${quarter}`,
                new FormControl(fileQuarterValue)
            );
        }
    }

    async addSemiAnnualControls(data?: any) {
        this.semi_annual.forEach((_, i) => {
            const monthValue = data ? data[`semi_annual_${i}`] || 0 : 0;
            const fileSemiAnnualValue = data
                ? data[`file_semi_annual_${i}`] || ''
                : '';
            this.editObjectiveGoalform.addControl(
                `semi_annual_${i}`,
                new FormControl(monthValue, Validators.min(0))
            );
            this.editObjectiveGoalform.addControl(
                `file_semi_annual_${i}`,
                new FormControl(fileSemiAnnualValue)
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
        form.value.functional_objective = form.value.functional_objective.name;
        let data = {
            ...form.value,
        };
        console.log({ update_objective: data });
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
                    //reset the flag
                    this.uploadSuccessFlag = false;
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

    onUpload(event: any, type: string, index: number) {
        console.log({ onUpload: { event, type, index } });
        this.showAddFilesComponent = true;
        this.parentAddnewFile = {
            addFile: true,
            objectiveId: this.tobeUpdatedSubGoal,
            frequencyFileName: `file_${type}_${index}`,
        };
    }

    receivedAddFileEvent(event: any) {
        if (event) {
            //close the child component
            this.showAddFilesComponent = false;
        }
        // Handle the event when a file is added
        console.log('File added receivedAddFileEvent update:', event);
        this.onFileUploadSuccess(
            event.frequencyFileName,
            event.frequencyFileNameForUpdate
        );
    }

    onFileUploadSuccess(controlName: string, fileName: string) {
        //hide the input and show the check icon
        this.uploadSuccessFlag = true;
        if (this.editObjectiveGoalform.contains(controlName)) {
            this.editObjectiveGoalform.get(controlName).setValue(fileName);
        } else {
            this.editObjectiveGoalform.addControl(
                controlName,
                new FormControl(fileName)
            );
        }
    }
}
