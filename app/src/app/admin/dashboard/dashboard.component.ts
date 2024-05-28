import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/demo/service/user.service';
import { Subject, takeUntil } from 'rxjs';
import { GoalService } from 'src/app/demo/service/goal.service';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
    users: any[] = [];
    goals: any[] = [];
    private getDashboardSubscription = new Subject<void>();

    constructor(
        public userService: UserService,
        private goalService: GoalService
    ) {}

    ngOnInit() {
        this.getAllusers();
        this.getAllGoals();
    }
    ngOnDestroy() {
        this.getDashboardSubscription.unsubscribe();
    }

    getAllusers() {
        this.userService
            .getRoute('get', 'users', 'getAllUsers')
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data: any) => {
                this.users = data.users.length;
            });
    }
    getAllGoals() {
        this.goalService
            .getRoute('get', 'goals', 'getAllGoals')
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data: any) => {
                this.goals = data.goals.length;
            });
    }
}
