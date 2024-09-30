import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
    ChangeDetectorRef,
    EventEmitter,
} from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GoalService } from 'src/app/demo/service/goal.service';
import { Subject, pipe, takeUntil } from 'rxjs';
@Component({
    selector: 'app-goal',
    templateUrl: './goal.component.html',
    styleUrl: './goal.component.scss',
})
export class GoalComponent implements OnInit, OnDestroy {
    private deleteGoalSubscription = new Subject<void>();
    //add goal
    parentAddnewGoal: object = {};
    parentEmitAddnewGoal: object = {};

    //edit goal
    parentEditGoal: object = {};
    parentEmitEditGoal: object = {};

    //delete goal
    parentEmitDeleteGoal: object = {};
    parentDeleteGoal: object = {};

    //get objective
    parentGetObjective: object = {};
    parentEmitGetObjective: object = {};

    ConfirmationService;
    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private goal: GoalService
    ) {}

    ngOnInit() {}

    ngOnDestroy(): void {
        this.deleteGoalSubscription.next();
        this.deleteGoalSubscription.complete();
    }
    receivedAddGoalEvent(event: any) {
        if (event?.success) {
            this.parentEmitAddnewGoal = {
                addedNewGoal: true,
                userId: event.userId,
            };
        }
    }

    receivedAddNewGoalButtonClick(event: any) {
        this.parentAddnewGoal = { addGoal: event.addNewGoal };
    }

    receivedEditGoalEvent(event: any) {
        if (event?.success) {
            this.parentEmitEditGoal = {
                editedAGoal: true,
                goal: event.data,
            };
        }
    }

    receivedEditGoalButtonClick(event: any) {
        this.parentEditGoal = {
            editGoal: event.editGoal,
            goal: event.goal,
        };
    }

    receivedGetObjectiveButtonClick(event: any) {
        const {
            id: id,
            _id: _id,
            listsId: listsId,
            goal: goal,
            remainingBudget: remainingBudget,
            goalData: goalData,
        } = event;
        this.parentGetObjective = {
            getObjective: true,
            id: id,
            _id: _id,
            listsId: listsId,
            goal: goal,
            remainingBudget: remainingBudget,
            goalData: goalData,
        };
    }

    receivedGetObjectiveEvent(event: any) {
        // this.parentEmitGetObjective = {
        //     getObjective: true,
        // };
    }
}
