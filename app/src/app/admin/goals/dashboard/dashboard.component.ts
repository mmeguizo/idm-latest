import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { GoalService } from 'src/app/demo/service/goal.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class GoalDashboardComponent {
    goals: any[] = [];
    loading = true;
    dashboardSubscription = new Subject<void>();
    constructor(private goal: GoalService) {
        this.getGoals();
    }

    getGoals() {
        this.goal
            .getRoute('get', 'goals', 'getGoalsForDashboard')
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data: any) => {
                this.goals = data?.data[0]?.totalBudget[0]?.totalAmount || 0;
                this.loading = false;
            });
    }

    ngOnDestroy(): void {
        this.dashboardSubscription.unsubscribe();
    }
}
