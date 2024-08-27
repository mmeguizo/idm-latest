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
        // this.addObjectiveGoalform
        //     .get('frequency_monitoring')
        //     ?.valueChanges.pipe(takeUntil(this.addObjectiveSubscription))
        //     .subscribe((value) => {
        //         this.onFrequencyChange(value);
        //     });
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
    onFrequencyChange(event: any) {
        const frequency = event.value.name;
        console.log(frequency);
        console.log(event.value.name);
        // Clear existing dynamic controls
        this.clearDynamicControls();

        if (frequency === 'yearly') {
            this.addMonthlyControls();
        } else if (frequency === 'quarterly') {
            this.addQuarterlyControls();
        } else if (frequency === 'semi_annual') {
            this.addSemiAnnualControls();
        }
        console.log(frequency);

        // Update the form control value
        this.addObjectiveGoalform
            .get('frequency_monitoring')
            .setValue(frequency);
    }

    clearDynamicControls() {
        this.months.forEach((_, i) => {
            if (this.addObjectiveGoalform.contains(`month_${i}`)) {
                this.addObjectiveGoalform.removeControl(`month_${i}`);
            }
        });
        this.quarters.forEach((_, i) => {
            if (this.addObjectiveGoalform.contains(`quarter_${i}`)) {
                this.addObjectiveGoalform.removeControl(`quarter_${i}`);
            }
        });
        this.semi_annual.forEach((_, i) => {
            if (this.addObjectiveGoalform.contains(`semi_annual_${i}`)) {
                this.addObjectiveGoalform.removeControl(`semi_annual_${i}`);
            }
        });
    }

    addMonthlyControls() {
        this.months.forEach((_, i) => {
            this.addObjectiveGoalform.addControl(
                `month_${i}`,
                new FormControl(0, Validators.min(0))
            );
        });
    }

    addQuarterlyControls() {
        this.quarters.forEach((_, i) => {
            this.addObjectiveGoalform.addControl(
                `quarter_${i}`,
                new FormControl(0, Validators.min(0))
            );
        });
    }

    addSemiAnnualControls() {
        this.semi_annual.forEach((_, i) => {
            this.addObjectiveGoalform.addControl(
                `semi_annual_${i}`,
                new FormControl(0, Validators.min(0))
            );
        });
    }

    // onFrequencyChange(event: any) {
    //     const selectedFrequency = event.value?.name;

    //     this.addObjectiveGoalform
    //         .get('frequency_monitoring')
    //         .setValue(event.value.name);
    //     // Reset and disable all timetable fields first
    //     for (let i = 0; i < 12; i++) {
    //         this.addObjectiveGoalform.get(`month_${i}`)?.reset();
    //         this.addObjectiveGoalform.get(`month_${i}`)?.disable();
    //     }
    //     for (let i = 1; i <= 4; i++) {
    //         // Adjust loop for quarters (1-indexed)
    //         this.addObjectiveGoalform.get(`quarter_${i}`)?.reset();
    //         this.addObjectiveGoalform.get(`quarter_${i}`)?.disable();
    //     }
    //     for (let i = 0; i < 2; i++) {
    //         // Adjust loop for semi-annual
    //         this.addObjectiveGoalform.get(`semi_annual_${i}`)?.reset();
    //         this.addObjectiveGoalform.get(`semi_annual_${i}`)?.disable();
    //     }

    //     // Now, enable only the relevant fields based on the selected frequency
    //     if (selectedFrequency === 'yearly') {
    //         for (let i = 0; i < 12; i++) {
    //             this.addObjectiveGoalform.get(`month_${i}`)?.enable();
    //         }
    //     } else if (selectedFrequency === 'quarterly') {
    //         for (let i = 1; i <= 4; i++) {
    //             this.addObjectiveGoalform.get(`quarter_${i}`)?.enable();
    //         }
    //     } else if (selectedFrequency === 'semi-annual') {
    //         this.addObjectiveGoalform.get(`semi_annual_0`)?.enable();
    //         this.addObjectiveGoalform.get(`semi_annual_1`)?.enable();
    //     }
    // }

    ngAfterViewInit() {
        // Set the initial value of the frequency_monitoring form control
        // this.addObjectiveGoalform
        //     .get('frequency_monitoring')
        //     ?.setValue(this.frequencyOptions[0].code); // Or your desired default value
        // Subscribe to changes in the frequency_monitoring form control
        // this.addObjectiveGoalform
        //     .get('frequency_monitoring')
        //     ?.valueChanges.pipe(takeUntil(this.addObjectiveSubscription))
        //     .subscribe((value) => {
        //         this.onFrequencyChange(value);
        //     });
    }

    createAddObjectiveGoalform() {
        this.addObjectiveGoalform = this.formBuilder.group({
            userId: ['', [Validators.required]],
            goalId: ['', [Validators.required]],
            functional_objective: ['', [Validators.required]],
            performance_indicator: ['', [Validators.required]],
            target: ['', [Validators.required]],
            formula: ['', [Validators.required]],
            programs: ['', [Validators.required]],
            responsible_persons: ['', [Validators.required]],
            clients: ['', [Validators.required]],
            timetable: ['', [Validators.required]], // You might want to adjust this later
            frequency_monitoring: ['', [Validators.required]],
            data_source: ['', [Validators.required]],
            remarks: ['', [Validators.required]],
            budget: ['', [Validators.required]],

            // Add form controls for monthly and quarterly timetable values
            month_0: [0],
            month_1: [0],
            month_2: [0],
            month_3: [0],
            month_4: [0],
            month_5: [0],
            month_6: [0],
            month_7: [0],
            month_8: [0],
            month_9: [0],
            month_10: [0],
            month_11: [0],

            quarter_1: [0],
            quarter_2: [0],
            quarter_3: [0],
            quarter_4: [0],

            semi_annual_1: [0],
            semi_annual_2: [0],
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
                    });
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
            goalId: addExecutionGoalId,
            goal_Id: this.addExecutionGoal_Id,
            createdBy: USERID,
            timetable: new Map(), // Initialize the timetable Map
        };

        // Populate the timetable based on the selected frequency
        if (data.frequency_monitoring === 'yearly') {
            // Remove quarterly and semi_annual fields
            for (let quarter = 1; quarter <= 4; quarter++) {
                delete data[`quarter_${quarter}`];
            }
            for (let i = 0; i <= 2; i++) {
                delete data[`semi_annual_${i}`];
            }

            for (let month = 0; month < 12; month++) {
                const monthName = new Date(0, month).toLocaleString('default', {
                    month: 'short',
                });
                data.timetable.set(monthName, e.value[`month_${month}`]);
            }
        } else if (data.frequency_monitoring === 'quarterly') {
            // Remove yearly and semi_annual fields
            for (let month = 0; month <= 12; month++) {
                delete data[`month_${month}`];
            }
            for (let i = 0; i <= 2; i++) {
                delete data[`semi_annual_${i}`];
            }
            for (let quarter = 1; quarter <= 4; quarter++) {
                data.timetable.set(
                    `Q${quarter}`,
                    e.value[`quarter_${quarter}`]
                );
            }
        } else if (data.frequency_monitoring === 'semi_annual') {
            // Remove yearly and quarterly fields
            for (let month = 0; month <= 12; month++) {
                delete data[`month_${month}`];
            }
            for (let quarter = 1; quarter <= 4; quarter++) {
                delete data[`quarter_${quarter}`];
            }
            for (let i = 0; i < 2; i++) {
                const periodName = this.semi_annual[i];
                data.timetable.set(periodName, e.value[`semi_annual_${i}`]);
            }
        }

        console.log({ addObjectives: data });

        this.obj
            .getRoute('post', 'objectives', 'addObjectives', data)
            .pipe(takeUntil(this.addObjectiveSubscription))
            .subscribe((data: any) => {
                console.log({ addSubObjectiveGoalDialogExec: data });

                if (data.success) {
                    this.addObjectiveGoalDialogCard = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Done',
                        detail: data.message,
                    });
                    this.goal_ObjectId = data.data.goal_Id;
                    this.addObjectiveGoalform.reset();
                    this.formGroupDropdown.reset();
                    this.goalDataRemainingBudget = 0;
                    this.childAddObjectiveEvent.emit(data.data);
                } else {
                    this.messageService.add({
                        severity: 'warn',
                    });
                }
            });
    }

    onGoalChange(event: any) {
        // capture here the goallist id if needed
    }
}

// import {
//     Component,
//     OnInit,
//     OnDestroy,
//     Input,
//     SimpleChanges,
//     Output,
//     EventEmitter,
// } from '@angular/core';

// import { AuthService } from 'src/app/demo/service/auth.service';

// import { Subject, pipe, takeUntil } from 'rxjs';
// import { MessageService } from 'primeng/api';
// import {
//     FormBuilder,
//     Validators,
//     FormControl,
//     FormGroup,
// } from '@angular/forms';
// import { ObjectiveService } from 'src/app/demo/service/objective.service';
// import { GoallistService } from 'src/app/demo/service/goallists.service';

// @Component({
//     selector: 'app-add-objective',
//     templateUrl: './add-objective.component.html',
//     styleUrl: './add-objective.component.scss',
// })
// export class AddObjectiveComponent implements OnInit, OnDestroy {
//     @Input() addNewObjective: string;
//     @Output() childAddObjectiveEvent = new EventEmitter<object>();
//     addGoalTrigger: any;
//     addObjectiveGoalform: FormGroup;
//     formGroupDropdown: FormGroup;
//     addObjectiveGoalDialogCard: boolean = false;
//     dropdwonSelection: { name: string; code: string }[];
//     dropdwonGoallistSelection: { name: string; code: string }[];
//     USERID: string;
//     private addObjectiveSubscription = new Subject<void>();
//     subObjectiveGoalID: string;
//     goal_ObjectId: string;
//     customFunctionalName: string;
//     goalDataRemainingBudget: number = 0;
//     addExecutionGoalId: string;
//     addExecutionGoal_Id: any;
//     constructor(
//         private formBuilder: FormBuilder,
//         private messageService: MessageService,
//         private auth: AuthService,
//         private obj: ObjectiveService,
//         private goallistService: GoallistService
//     ) {
//         this.USERID = this.auth.getTokenUserID();
//     }

//     ngOnInit() {
//         this.createAddObjectiveGoalform();
//         this.formGroupDropdown = new FormGroup({
//             selectedDropdown: new FormControl(),
//         });
//         this.dropdwonSelection = [
//             { name: 'daily', code: 'Daily' },
//             { name: 'weekly', code: 'Weekly' },
//             { name: 'monthly', code: 'Monthly' },
//             { name: 'yearly', code: 'Yearly' },
//             { name: 'quarterly', code: 'Quarterly' },
//             { name: 'biannually', code: 'Biannually' },
//         ];
//     }
//     ngOnDestroy(): void {
//         this.addObjectiveSubscription.next();
//         this.addObjectiveSubscription.complete();
//     }

//     async ngOnChanges(changes: SimpleChanges) {
//         this.addGoalTrigger = changes['addNewObjective']?.currentValue;
//         let id = this.addGoalTrigger?.goallistsId;
//         this.addExecutionGoalId = this.addGoalTrigger?.goalId;
//         this.addExecutionGoal_Id = this.addGoalTrigger?.goal_ObjectId;
//         if (
//             this.addGoalTrigger?.addObjective &&
//             this.addGoalTrigger?.goallistsId
//         ) {
//             this.getAllGoallistsDropdown(id);
//             setTimeout(() => {
//                 this.addObjectiveGoalDialogCard = true;
//             }, 0);
//         }
//     }

//     createAddObjectiveGoalform() {
//         this.addObjectiveGoalform = this.formBuilder.group({
//             // department: ['', [Validators.required]],
//             userId: ['', [Validators.required]],
//             goalId: ['', [Validators.required]],
//             functional_objective: ['', [Validators.required]],
//             performance_indicator: ['', [Validators.required]],
//             target: ['', [Validators.required]],
//             formula: ['', [Validators.required]],
//             programs: ['', [Validators.required]],
//             responsible_persons: ['', [Validators.required]],
//             clients: ['', [Validators.required]],
//             timetable: ['', [Validators.required]],
//             frequency_monitoring: ['', [Validators.required]],
//             data_source: ['', [Validators.required]],
//             remarks: ['', [Validators.required]],
//             budget: ['', [Validators.required]],
//         });
//     }

//     async getAllGoallistsDropdown(id: string) {
//         this.goallistService
//             .getRoute(
//                 'get',
//                 'goallists',
//                 `getAllAddObjectivesGoallistsDropdown/${id}`
//             )
//             .pipe(takeUntil(this.addObjectiveSubscription))
//             .subscribe({
//                 next: (data: any) => {
//                     this.dropdwonGoallistSelection = data.objectives;
//                 },
//                 error: (error) => {
//                     this.messageService.add({
//                         severity: 'error',
//                         summary: 'Error',
//                         detail: 'Failed to Goallist Dropdown',
//                     }); // Display error message
//                 },
//                 complete: () => {},
//             });
//     }

//     clearAddObjectiveGoalDialogCardDatas() {
//         this.addObjectiveGoalDialogCard = false;
//         this.addObjectiveGoalform.reset();
//     }

//     addSubObjectiveGoalDialogExec(e: any) {
//         const { addExecutionGoalId, formGroupDropdown, goal_ObjectId, USERID } =
//             this;

//         let data = {
//             ...e.value,
//             functional_objective: e.value.functional_objective.name,
//             userId: USERID,
//             goalId: addExecutionGoalId, // Final goalId value
//             goal_Id: this.addExecutionGoal_Id,
//             frequency_monitoring: formGroupDropdown.value.selectedDropdown.name,
//             createdBy: USERID,
//         };

//         console.log({ addObjectives: data });

//         this.obj
//             .getRoute('post', 'objectives', 'addObjectives', data)
//             .pipe(takeUntil(this.addObjectiveSubscription))
//             .subscribe((data: any) => {
//                 console.log({ addSubObjectiveGoalDialogExec: data });

//                 if (data.success) {
//                     this.addObjectiveGoalDialogCard = false;
//                     this.messageService.add({
//                         severity: 'success  ',
//                         summary: 'Done',
//                         detail: data.message,
//                     });
//                     //fix the error becomes null after adding new objective
//                     this.goal_ObjectId = data.data.goal_Id;
//                     // clear the data
//                     this.addObjectiveGoalform.reset();
//                     this.formGroupDropdown.reset();
//                     this.goalDataRemainingBudget = 0;
//                     this.childAddObjectiveEvent.emit(data.data);
//                 } else {
//                     this.messageService.add({
//                         severity: 'warn  ',
//                         summary: 'Error',
//                         detail: data.message,
//                     });
//                 }
//             });
//     }

//     onGoalChange(event: any) {
//         // capture here the goallist id if needed
//     }
// }
