import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    ElementRef,
    ViewChild,
    SimpleChanges,
    EventEmitter,
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
import { FileUpload } from 'primeng/fileupload';
import { getIcon } from 'src/app/utlis/file-utils';
import { CampusService } from 'src/app/demo/service/campus.service';
import { customTitleCase } from 'src/app/utlis/custom-title-case';

@Component({
    selector: 'app-objective-table',
    templateUrl: './objective-table.component.html',
    styleUrl: './objective-table.component.scss',
})
export class ObjectiveTableComponent implements OnInit, OnDestroy {
    private objectiveTableSubscription = new Subject<void>();
    @Input() getObjective = new EventEmitter<any>();

    subGoalObjective: boolean = false;
    loading: boolean = false;
    USERID: string;
    subOnjectiveHeaderData: any;
    getObjectiveTableTrigger: any;
    subObjectiveGoalID: any;
    goallistsId: any;
    goal_ObjectId: any;
    goalDataRemainingBudget: any;
    goalBudget: any;
    subObjectiveHeaders: any;
    objectiveDatas: any;
    constructor(
        private objective: ObjectiveService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private auth: AuthService,
        private department: DepartmentService,
        private file: FileService,
        private campus: CampusService
    ) {}

    ngOnInit() {
        this.loading = true;
        this.USERID = this.auth.getTokenUserID();
    }

    ngOnDestroy() {
        this.objectiveTableSubscription.unsubscribe();
    }

    hideViewObjectiveTable(id?: string) {
        this.subGoalObjective = false;
    }
    ngOnChanges(changes: SimpleChanges) {
        this.getObjectiveTableTrigger = changes['getObjective']?.currentValue;

        if (
            this.getObjectiveTableTrigger &&
            this.getObjectiveTableTrigger.getObjective
        ) {
            const {
                id: id,
                _id: objectId,
                listsId: goallistsId,
                goal: subHeader,
                remainingBudget: goalDataRemainingBudget,
                goalData: goalData,
            } = this.getObjectiveTableTrigger;

            this.loading = true;
            //passed data needed for the subgoal table or adding table modal
            this.subObjectiveGoalID = id;
            this.goallistsId = goallistsId;
            this.goal_ObjectId = objectId || goalData._id || '';
            //open the objective modal
            this.subGoalObjective = true;
            //remaining budget needed in adding objective input
            //headers in objective table

            this.subOnjectiveHeaderData = goalData;
            this.goalDataRemainingBudget =
                goalDataRemainingBudget ||
                this.subOnjectiveHeaderData?.remainingBudget;
            this.goalBudget = this.subOnjectiveHeaderData?.budget;

            this.subObjectiveHeaders = customTitleCase(
                subHeader || this.subObjectiveHeaders || ''
            );

            this.getTableData(id);
        }
    }
    getTableData(id: string) {
        if (id) {
            this.loading = true;
            this.objective
                .fetch('get', 'objectives', `getAllByIdObjectives/${id}`)
                .pipe(takeUntil(this.objectiveTableSubscription))
                .subscribe(async (data: any) => {
                    this.objectiveDatas = data.Objectives;
                    this.loading = false;
                });
        }
    }
}
