import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
    ChangeDetectorRef,
} from '@angular/core';
import { Table } from 'primeng/table';

import { Subject, pipe, takeUntil } from 'rxjs';
import { ObjectiveService } from 'src/app/demo/service/objective.service';
import {
    FormBuilder,
    Validators,
    FormControl,
    FormGroup,
} from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Footer } from './footer';
import { FileService } from 'src/app/demo/service/file.service';
import { AuthService } from 'src/app/demo/service/auth.service';
import { GoalService } from 'src/app/demo/service/goal.service';
import { Role } from 'src/app/interface/role.interface';

@Component({
    selector: 'app-objectives',
    templateUrl: './objectives.component.html',
    styleUrl: './objectives.component.scss',
})
export class ObjectivesComponent implements OnInit, OnDestroy {
    private objectiveSubscription = new Subject<void>();
    ref: DynamicDialogRef | undefined;
    @ViewChild('filter') filter!: ElementRef;

    objectives: any[] = [];
    objectiveDatas: any[] = [];
    onclickCompletionButton = [];
    AllObjectivesFiles: any[] = [];
    uploadedFiles: any[] = [];
    AllObjectivesHistoryFiles: any[] = [];
    //table columns
    cols!: any;
    loading = true;
    blockedPanel: boolean;
    viewObjectiveFileDialogCard: boolean;
    addObjectiveFileDialogCard: boolean;
    updateObjectiveGoalFlag: boolean;
    addObjectiveGoalDialogCard: boolean = false;
    tobeUpdatedSubGoal: any;
    USERID: any;
    objectiveIDforFile: any;
    public addFileForm: any;
    public addObjectiveGoalform: any;
    formGroupDropdown: any;
    dropdwonSelection: { name: string; code: string }[];
    viewObjectiveFileHistoryDialogCard: boolean;
    role: Role;
    constructor(
        private obj: ObjectiveService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        public dialogService: DialogService,
        private fileService: FileService,
        private formBuilder: FormBuilder,
        private auth: AuthService,
        private goal: GoalService,
        private cd: ChangeDetectorRef
    ) {
        this.USERID = this.auth.getTokenUserID();
        this.role = this.auth.getUserRole() as Role;
        this.getAllobjectivesGoalsUsers();
    }

    ngOnInit() {
        console.log('test');
        // this.getAllobjectives();
        this.getAllobjectivesGoalsUsers();
        this.createaddFileForm();

        this.dropdwonSelection = [
            { name: 'daily', code: 'Daily' },
            { name: 'weekly', code: 'Weekly' },
            { name: 'monthly', code: 'Monthly' },
            { name: 'yearly', code: 'Yearly' },
            { name: 'quarterly', code: 'Quarterly' },
            { name: 'biannually', code: 'Biannually' },
        ];

        this.createAddObjectiveGoalform();
        this.formGroupDropdown = new FormGroup({
            selectedDropdown: new FormControl(),
        });
    }

    createaddFileForm() {
        this.addFileForm = this.formBuilder.group({
            files: ['', [Validators.required]],
        });
    }

    getAllobjectives() {
        this.loading = true;
        this.obj
            .getRoute('get', 'objectives', 'getAllObjectives/' + this.USERID)
            .pipe(takeUntil(this.objectiveSubscription))
            .subscribe(async (data: any) => {
                console.log({ getAllobjectives: data.Objectives });
                this.objectiveDatas = await data.Objectives;
                for (let i = 0; i < this.objectiveDatas.length; i++) {
                    this.onclickCompletionButton[i] = false;
                }
                this.loading = false;
                this.cd.detectChanges();
            });
    }

    getAllobjectivesGoalsUsers() {
        this.loading = true;
        this.obj
            .getRoute(
                'get',
                'objectives',
                'getAllByIdObjectivesWithGoalsAndUsers/' + this.USERID
            )
            .pipe(takeUntil(this.objectiveSubscription))
            .subscribe((data: any) => {
                this.objectiveDatas = data.data;
                console.log({ getAllobjectivesGoalsUsers: data });
                this.loading = false;
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

    updateObjectiveComplete(
        event: Event,
        data: any,
        index = 0,
        completeStatus: any
    ) {
        this.onclickCompletionButton[index] = true;
        let goalIDs = data.goalId;

        if (completeStatus === true && this.role === 'user') {
            this.messageService.add({
                severity: 'error  ',
                summary: 'Nice Try!!!',
                detail: 'Only Admin can enable this..',
            });
            this.onclickCompletionButton[index] = false;
            return;
        }

        this.confirmationService.confirm({
            key: 'updateObjectiveComplete',
            target: event.target as EventTarget,
            message: `Marking Objective ${
                completeStatus
                    ? 'as Incomplete'
                    : ' as Complete? Will Lock Files'
            }, Are You Sure?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'none',
            rejectIcon: 'none',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.loading = true;
                this.obj
                    .getRoute(
                        'put',
                        'objectives',
                        'updateobjectivecompletion',
                        {
                            id: data.id,
                        }
                    )
                    .pipe(takeUntil(this.objectiveSubscription))
                    .subscribe(async (results: any) => {
                        if (results.success) {
                            this.messageService.add({
                                severity: 'success  ',
                                summary: 'Done',
                                detail: results.message,
                                life: 5000,
                            });
                            // this.getAllobjectives();
                            this.getAllobjectivesGoalsUsers();
                            this.loading = false;
                        } else {
                            this.messageService.add({
                                severity: 'error  ',
                                summary: 'Error',
                                detail: results.message,
                            });
                        }
                    });
                // this.onclickCompletionButton = false;
                this.onclickCompletionButton[index] = false;
            },
            reject: () => {
                this.onclickCompletionButton[index] = false;
                this.messageService.add({
                    severity: 'info',
                    summary: 'Done',
                    detail: 'Nothing happens',
                    life: 3000,
                });
            },
        });
    }

    async viewFiles(objectiveData: any) {
        //block view files if complete
        this.blockedPanel = objectiveData.complete;
        // alert(objectiveID);
        this.viewObjectiveFileDialogCard = true;
        this.objectiveIDforFile = objectiveData.id;

        console.log(objectiveData);
        console.log(this.objectiveIDforFile);

        // alert(JSON.stringify(objectiveData));
        this.getAllFilesFromObjectiveLoad(this.USERID, objectiveData.id);
    }

    hideViewFileDialogCard() {
        // destroy the data needed on that dialog
        this.objectiveIDforFile = null;
        this.viewObjectiveFileDialogCard = false;
    }

    addFiles(objectiveData: any) {
        // alert(objectiveID);
        this.addObjectiveFileDialogCard = true;
        // alert(JSON.stringify(objectiveData));
    }

    async getAllFilesFromObjectiveLoad(
        id: string,
        objectiveID: string
    ): Promise<Boolean> {
        this.loading = true;
        this.fileService
            .getAllFilesFromObjective(id, objectiveID)
            .pipe(takeUntil(this.objectiveSubscription))
            .subscribe((data: any) => {
                console.log({ getAllFilesFromObjectiveLoad: data });

                this.AllObjectivesFiles = data.data;
                this.loading = false;
            });
        return true;
    }

    onUpload(event: any) {
        console.log('clicked upload');

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
                this.USERID,
                this.objectiveIDforFile,
                this.uploadedFiles
            )
            .pipe(takeUntil(this.objectiveSubscription))
            .subscribe((data: any) => {
                // after adding files it did not add the new files just reload, clear the data to fix the issue
                this.AllObjectivesFiles = [];
                this.getAllFilesFromObjectiveLoad(
                    this.USERID,
                    this.objectiveIDforFile
                );
                if (data.success) {
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'View the files',
                        detail: 'Files added successfully',
                    });
                    this.addObjectiveFileDialogCard = false;
                    this.addFileForm.reset();
                    this.uploadedFiles = [];
                    this.viewObjectiveFileDialogCard = false;
                } else {
                    this.messageService.add({
                        severity: 'error  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }

    clearAddObjectiveGoalDialogCardDatas() {
        this.addObjectiveGoalDialogCard = false;
        this.updateObjectiveGoalFlag = false;
        this.tobeUpdatedSubGoal = null;
        this.addObjectiveGoalform.reset();
    }

    updateSubGoal(data: any) {
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

    updateSubObjectiveGoalDialogExec(form: any) {
        this.loading = true;

        form.value.id = this.tobeUpdatedSubGoal;
        form.value.frequency_monitoring =
            this.formGroupDropdown.value.selectedDropdown.name;
        this.obj
            .getRoute('put', 'objectives', 'updateObjectives', form.value)
            .pipe(takeUntil(this.objectiveSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    // this.getAllObjectivesWithObjectives();
                    // this.getObjectives(this.subObjectiveGoalID);
                    // this.getAllobjectives();
                    this.getAllobjectivesGoalsUsers();
                    this.getAllFilesFromObjectiveLoad(
                        this.USERID,
                        this.objectiveIDforFile
                    );
                    this.addObjectiveGoalDialogCard = false;
                    this.messageService.add({
                        severity: 'success  ',
                        summary: 'Done',
                        detail: data.message,
                    });
                    this.loading = false;
                } else {
                    this.messageService.add({
                        severity: 'error  ',
                        summary: 'Error',
                        detail: data.message,
                    });
                }
            });
    }

    validateFileType(files: any) {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/svg+xml',
            'image/gif',
            'image/x-jif',
            'image/x-jiff',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/rtf',
            'application/pdf',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/csv',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'application/zip',
            'image/x-photoshop',
            'image/vnd.dxf',
            'audio/mpeg',
            'audio/wav',
            'audio/aac',
        ];
        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                console.log(`Invalid file type: ${file.type}`); // Log the type of any file that fails validation
                return false;
            }
        }

        return true;
    }

    // show(data: any) {
    //     this.ref = this.dialogService.open(data, {
    //         header: 'Select a Product',
    //         width: '50vw',
    //         contentStyle: { overflow: 'auto' },
    //         breakpoints: {
    //             '960px': '75vw',
    //             '640px': '90vw',
    //         },
    //         templates: {
    //             footer: Footer,
    //         },
    //     });

    //     this.ref.onClose.subscribe((data: any) => {
    //         console.log('this is close');

    //         // let summary_and_detail;
    //         // if (data) {
    //         //     const buttonType = data?.buttonType;
    //         //     summary_and_detail = buttonType
    //         //         ? {
    //         //               summary: 'No Product Selected',
    //         //               detail: `Pressed '${buttonType}' button`,
    //         //           }
    //         //         : { summary: 'Product Selected', detail: data?.name };
    //         // } else {
    //         //     summary_and_detail = {
    //         //         summary: 'No Product Selected',
    //         //         detail: 'Pressed Close button',
    //         //     };
    //         // }
    //         // this.messageService.add({
    //         //     severity: 'info',
    //         //     ...summary_and_detail,
    //         //     life: 3000,
    //         // });
    //     });

    //     this.ref.onMaximize.subscribe((value) => {
    //         this.messageService.add({
    //             severity: 'info',
    //             summary: 'Maximized',
    //             detail: `maximized: ${value.maximized}`,
    //         });
    //     });
    // }

    viewFilesHistory(objectiveData: any) {
        this.viewObjectiveFileHistoryDialogCard = true;
        this.getAllFilesHistoryFromObjectiveLoad(this.USERID, objectiveData.id);
    }

    async getAllFilesHistoryFromObjectiveLoad(
        id: string,
        objectiveID: string
    ): Promise<Boolean> {
        this.loading = true;
        this.fileService
            .getAllFilesHistoryFromObjectiveLoad(id, objectiveID)
            .pipe(takeUntil(this.objectiveSubscription))
            .subscribe((data: any) => {
                this.AllObjectivesHistoryFiles = data.data;
                this.loading = false;
            });
        return true;
    }
    hideViewFileHistoryDialogCard() {
        this.viewObjectiveFileHistoryDialogCard = false;
    }
    getIcon(name: string) {
        const fileExtension = name.split('.').pop();
        switch (fileExtension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg':
                return 'pi pi-image';
            case 'doc':
            case 'docx':
            case 'rtf':
                return 'pi pi-file-word';
            case 'pdf':
                return 'pi pi-file-pdf';
            case 'xls':
            case 'xlsx':
                return 'pi pi-file-excel';
            case 'csv':
                return 'pi pi-file-csv';
            case 'ppt':
            case 'pptx':
                return 'pi pi-file-powerpoint';
            case 'txt':
                return 'pi pi-ticket';
            case 'zip':
                return 'pi pi-file-zip';
            case 'psd':
                return 'pi pi-image';
            case 'dxf':
                return 'pi pi-image';
            case 'mp3':
            case 'wav':
            case 'aac':
                return 'pi pi-volume-up';
            default:
                return 'pi pi-file';
        }
    }

    deleteSubGoal(id: string, goalId: string) {
        this.confirmationService.confirm({
            key: 'deleteSubGoal',
            target: event.target || new EventTarget(),
            message: 'Deleting Objectives Will Delete All Files. Continue?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.loading = true;
                this.goal
                    .getRoute('put', 'objectives', 'setInactiveObjectives', {
                        id: id,
                    })
                    .pipe(takeUntil(this.objectiveSubscription))
                    .subscribe((data: any) => {
                        if (data.success) {
                            this.getAllobjectives();
                            this.loading = false;
                            this.messageService.add({
                                severity: 'success  ',
                                summary: 'Done',
                                detail: data.message,
                            });
                            // this.updateGoalDialogCard = false;
                            // this.updateGoalform.reset();
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

    deleteSubGoalFile(id: string, source: string) {
        // alert(`delete sub goal file ${id} ${source}`);
        this.confirmationService.confirm({
            key: 'deleteSubGoalFile',
            target: event.target || new EventTarget(),
            message: 'Delete File',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.fileService
                    .deleteFileObjective({
                        id: id,
                        source: source,
                    })
                    .pipe(takeUntil(this.objectiveSubscription))
                    .subscribe((data: any) => {
                        if (data.success) {
                            this.getAllobjectives();
                            this.messageService.add({
                                severity: 'success  ',
                                summary: 'Done',
                                detail: data.message,
                            });
                            this.viewObjectiveFileDialogCard = false;
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
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }
    ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.objectiveSubscription.unsubscribe();
    }
}