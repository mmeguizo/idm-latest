import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    SimpleChanges,
    Output,
    EventEmitter,
    ChangeDetectorRef,
} from '@angular/core';
import {
    Subject,
    pipe,
    takeUntil,
    tap,
    catchError,
    Observable,
    throwError,
} from 'rxjs';
import { FileService } from 'src/app/demo/service/file.service';

@Component({
    selector: 'app-view-file-history',
    templateUrl: './view-file-history.component.html',
    styleUrl: './view-file-history.component.scss',
})
export class ViewFileHistoryComponent implements OnInit, OnDestroy {
    private getGoalSubscription = new Subject<void>();

    @Input() viewFilesHistory: string;
    viewObjectiveFileHistoryDialogCard: boolean = false;
    loading: boolean = false;
    AllObjectivesHistoryFiles: any[] = [];

    objectiveIDforFile: any;

    constructor(
        private fileService: FileService,
        private changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit() {}

    ngOnDestroy(): void {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['viewFilesHistory']?.currentValue) {
            const { data, viewFilesHistory } =
                changes['viewFilesHistory']?.currentValue;
            this.objectiveIDforFile = data.id;
            console.log('viewFiles', viewFilesHistory);
            //use this when triggering the child component for adding file
            this.getAllFilesHistoryFromObjectiveLoad(data.userId, data.id);
            this.viewObjectiveFileHistoryDialogCard = viewFilesHistory;
        }
    }

    hideViewFileHistoryDialogCard() {
        this.viewObjectiveFileHistoryDialogCard = false;
    }

    async getAllFilesHistoryFromObjectiveLoad(
        id: string,
        objectiveID: string
    ): Promise<Boolean> {
        this.loading = true;
        this.fileService
            .getAllFilesHistoryFromObjectiveLoad(id, objectiveID)
            .pipe(takeUntil(this.getGoalSubscription))
            .subscribe((data: any) => {
                this.AllObjectivesHistoryFiles = data.data;
                this.changeDetectorRef.detectChanges();
                this.loading = false;
            });
        return true;
    }
}
