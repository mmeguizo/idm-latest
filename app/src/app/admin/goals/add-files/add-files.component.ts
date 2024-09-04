import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    ChangeDetectorRef,
    SimpleChanges,
    Output,
    EventEmitter,
} from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FileService } from 'src/app/demo/service/file.service';
import { Subject, pipe, takeUntil } from 'rxjs';
import {
    FormBuilder,
    Validators,
    FormControl,
    FormGroup,
} from '@angular/forms';
import { AuthService } from 'src/app/demo/service/auth.service';

@Component({
    selector: 'app-add-files',
    templateUrl: './add-files.component.html',
    styleUrl: './add-files.component.scss',
})
export class AddFilesComponent implements OnInit, OnDestroy {
    @Input() addNewFile: string;
    @Output() childAddFile = new EventEmitter<object>();

    private getAddFilesComponentSubscription = new Subject<void>();
    addFileTrigger: any;

    uploadedFiles: any[] = [];
    userID: string;
    USERID: string;
    frequencyFileName: string;
    objectiveIDforFile: any;
    AllObjectivesFiles: any[] = [];
    loading: boolean;
    addObjectiveFileDialogCard: boolean;
    public addFileForm: FormGroup;
    viewObjectiveFileDialogCard: boolean;

    constructor(
        private messageService: MessageService,
        private fileService: FileService,
        private formBuilder: FormBuilder,
        private auth: AuthService
    ) {
        this.USERID = this.auth.getTokenUserID();
    }

    ngOnChanges(changes: SimpleChanges) {
        const addFileTrigger = changes['addNewFile']?.currentValue;
        this.addFileTrigger = changes['addNewFile']?.currentValue;
        if (addFileTrigger && addFileTrigger.addFile) {
            this.addObjectiveFileDialogCard = true;
            this.objectiveIDforFile = addFileTrigger?.objectiveId;
            this.frequencyFileName = addFileTrigger?.frequencyFileName;
        }
    }

    ngOnInit() {
        this.createaddFileForm();
    }

    ngOnDestroy() {
        this.getAddFilesComponentSubscription.next();
        this.getAddFilesComponentSubscription.complete();
    }

    createaddFileForm() {
        this.addFileForm = this.formBuilder.group({
            files: ['', [Validators.required]],
        });
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
                this.USERID,
                this.objectiveIDforFile,
                this.uploadedFiles,
                this.frequencyFileName ? this.frequencyFileName : ''
            )
            .pipe(takeUntil(this.getAddFilesComponentSubscription))
            .subscribe({
                next: (data: any) => {
                    this.childAddFile.emit({
                        USERID: this.USERID,
                        objectiveId: this.objectiveIDforFile,
                        viewObjectiveFileDialogCard: false,
                        frequencyFileNameForUpdate: data.fileNames[0],
                        frequencyFileName: this.frequencyFileName,
                    });
                    this.addObjectiveFileDialogCard = false;
                    this.AllObjectivesFiles = [];
                    if (data.success) {
                        this.messageService.add({
                            severity: 'success  ',
                            summary: 'View the files',
                            detail: 'Files added successfully',
                        });
                        this.addFileForm.reset();
                        this.uploadedFiles = [];
                        this.addObjectiveFileDialogCard = false;

                        // this.viewObjectiveFileDialogCard = false;
                    }
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error  ',
                        summary: 'Error',
                        detail: error.message,
                    });
                },
                complete: () => {},
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
}
