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
import { FileService } from 'src/app/demo/service/file.service';

AuthService;
@Component({
    selector: 'app-goals',
    templateUrl: './goals.component.html',
    styleUrl: './goals.component.scss',
})
export class GoalsComponent implements OnInit, OnDestroy {
    private getGoalSubscription = new Subject<void>();
    @ViewChild('filter') filter!: ElementRef;

    //table data
    goals: any[] = [];
    Alldepts: any[] = [];

    //table columns
    cols!: any;
    loading = true;

    //variables used in the component
    userID: string;
    updateGoalID: string;
    subObjectiveGoalID: string;
    subObjectiveHeaders: string;
    uploadedFiles: any[] = [];
    objectiveDatas: any;
    deptDropdownValue: any[] = [];

    //variables used in the table
    tobeUpdatedSubGoal: any;
    goal_ObjectId: string;
    frequencys: { name: string; code: string }[];

    //cards dialog
    subGoalObjective: boolean = false;
    addGoalDialogCard: boolean = false;
    addObjectiveGoalDialogCard: boolean = false;
    updateGoalDialogCard: boolean = false;
    viewObjectiveFileDialogCard: boolean = false;
    addObjectiveFileDialogCard: boolean;
    updateObjectiveGoalFlag: boolean;

    //forms
    public addGoalform: any;
    public updateGoalform: any;
    public addObjectiveGoalform: any;
    public addFileForm: any;

    //dropdowns
    formGroupDropdown: any;
    frequency: { name: string; code: string }[];
    dropdwonSelection: { name: string; code: string }[];
    objectiveIDforFile: any;

    constructor(
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private confirmationService: ConfirmationService,
        private goal: GoalService,
        private auth: AuthService,
        private obj: ObjectiveService,
        private dept: DepartmentService,
        private fileService: FileService
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
        this.frequencys = [
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
        this.addFileForm();

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
    createaddFileForm() {
        this.addFileForm = this.formBuilder.group({
            file: ['', [Validators.required]],
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

    getObjectives(id: string, objectId?: string, subHeader?: string) {
        //passed data needed for the subgoal table
        this.subObjectiveGoalID = id;
        this.goal_ObjectId = objectId;
        this.subGoalObjective = true;
        this.subObjectiveHeaders = this.customTitleCase(subHeader);

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

    viewFiles(objectiveData: any) {
        // alert(objectiveID);
        this.viewObjectiveFileDialogCard = true;
        // alert(JSON.stringify(objectiveData));
    }

    addFiles(objectiveData: any) {
        // alert(objectiveID);
        this.addObjectiveFileDialogCard = true;
        this.objectiveIDforFile = objectiveData.id;
        // alert(JSON.stringify(objectiveData));
    }

    onUpload(event: any) {
        for (const file of event.files) {
            this.uploadedFiles.push(file);
        }

        if (!this.validateFileType(this.uploadedFiles)) {
            this.messageService.add({
                severity: 'error',
                summary: 'File Unsupported',
                detail: 'Unsupported file type! Please select only images, documents, or spreadsheets',
            });
            event.preventDefault();
        }

        this.fileService
            .addMultipleFiles(
                this.auth.getTokenUserID(),
                this.objectiveIDforFile,
                this.uploadedFiles
            )
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                console.log({ UploadFilesResponse: data });

                if (data.success) {
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    this.addObjectiveFileDialogCard = false;
                    this.addFileForm.reset();
                    this.uploadedFiles = [];
                } else {
                    this.messageService.add({
                        severity: 'error  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }

    customTitleCase(str: string): string {
        // Split the string into words
        const words = str.split(/\s+/);
        const formattedWords = words.map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        );
        // Join the formatted words back into a string
        return formattedWords.join(' ');
    }

    //validate file type
    validateFileType(files: any) {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/svg+xml',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/rtf',
            'application/pdf',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                return false; // Return false if any file has an unsupported type
            }
        }

        return true; // Return true if all files have allowed types
    }
}
