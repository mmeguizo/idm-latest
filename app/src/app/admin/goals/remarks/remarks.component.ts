import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    EventEmitter,
    Output,
    SimpleChanges,
} from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { BaseService } from 'src/app/demo/service/base.service';
import { Subject, pipe, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/demo/service/auth.service';

@Component({
    selector: 'app-remarks',
    templateUrl: './remarks.component.html',
    styleUrl: './remarks.component.scss',
})
export class RemarksComponent implements OnInit, OnDestroy {
    @Input() remarksFromGoalParent: string;
    @Output() childAddObjectiveEvent = new EventEmitter<object>();
    private remarksSubscriptions = new Subject<void>();
    text: string | undefined;
    items!: MenuItem[];
    remarks: any[] = [];
    remarksDialogCard: boolean = false;
    showEditorDialogCard: boolean = false;
    clickRemarksFromObjectiveTable: any;
    objectiveData: any;
    objectiveId: any;
    USERID: string;
    constructor(
        private baseService: BaseService,
        private messageService: MessageService,
        private authService: AuthService
    ) {}
    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['remarksFromGoalParent']?.currentValue) {
            this.USERID = this.authService.getTokenUserID();
            this.clickRemarksFromObjectiveTable =
                changes['remarksFromGoalParent']?.currentValue;
            console.log(this.clickRemarksFromObjectiveTable);
            const { remarksDialogCard, data } =
                this.clickRemarksFromObjectiveTable;
            const { userId, id } = data;
            this.objectiveId = id;
            this.objectiveData = { userId, objectiveId: id };
            //load the remarks
            this.getRemarks();
            this.remarksDialogCard = remarksDialogCard ?? false;
        }
    }

    async getRemarks() {
        this.baseService
            .getRoutePublic('get', 'remark', `remarks/${this.objectiveId}`)
            .pipe(takeUntil(this.remarksSubscriptions))
            .subscribe(async (data) => {
                console.log(data);
                this.remarks = data;
            });
    }

    async addRemarks() {
        console.log('adding remarks');
        this.showEditorDialogCard = true;
    }

    async submitRemarks() {
        console.log('submitting remarks');
        this.showEditorDialogCard = false;
        if (this.text) {
            const plainText = this.text.replace(/<\/?[^>]+(>|$)/g, '');
            console.log(plainText, this.objectiveData);

            this.baseService
                .getRoutePublic('post', 'remark', 'remarks', {
                    remarks: plainText,
                    objectiveId: this.objectiveId,
                    userId: this.USERID,
                })
                .pipe(takeUntil(this.remarksSubscriptions))
                .subscribe(async (data) => {
                    // reload the remarks
                    this.getRemarks();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Remarks added',
                    });
                    this.text = '';
                });
        }
    }
    ngOnDestroy() {
        this.remarksSubscriptions.next();
        this.remarksSubscriptions.complete();
    }
}
