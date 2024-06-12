import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/demo/service/user.service';
import { Subject, takeUntil } from 'rxjs';
import { GoalService } from 'src/app/demo/service/goal.service';
import { DepartmentService } from 'src/app/demo/service/department.service';
import { ObjectiveService } from 'src/app/demo/service/objective.service';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
    users: any;
    goals: any;
    private getDashboardSubscription = new Subject<void>();

    chartData: any;

    chartOptions: any;
    deparmentData: any;
    objectivesData: any;

    constructor(
        public userService: UserService,
        private goalService: GoalService,
        private dept: DepartmentService,
        private obj: ObjectiveService
    ) {}

    ngOnInit() {
        this.initChart();

        this.getAllusers();
        this.getAllGoals();
        this.getAllDept();
        this.getAllObjectives();
    }
    ngOnDestroy() {
        this.getDashboardSubscription.unsubscribe();
    }

    getAllusers() {
        this.userService
            .getRoute('get', 'users', 'getAllUsersForDashboard')
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data: any) => {
                console.log({ getAllusers: data });
                this.users = data.data[0];
            });
    }
    getAllGoals() {
        this.goalService
            .getRoute('get', 'goals', 'getGoalsForDashboard')
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data: any) => {
                console.log({ getAllGoals: data });
                this.goals = data.data[0];
            });
    }

    getAllDept() {
        this.dept
            .getRoute('get', 'department', 'getAllDepartmentForDashboard')
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data: any) => {
                console.log(data);
                console.log({ getAllDept: data });
                this.deparmentData = data.data[0];
            });
    }

    getAllObjectives() {
        this.obj
            .getRoute('get', 'objectives', `getAllObjectivesForDashboard`)
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data: any) => {
                console.log({ getAllObjectives: data });
                this.objectivesData = data.data[0];
            });
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue(
            '--text-color-secondary'
        );
        const surfaceBorder =
            documentStyle.getPropertyValue('--surface-border');

        this.chartData = {
            labels: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
            ],
            datasets: [
                {
                    label: 'First Dataset',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    fill: false,
                    backgroundColor:
                        documentStyle.getPropertyValue('--bluegray-700'),
                    borderColor:
                        documentStyle.getPropertyValue('--bluegray-700'),
                    tension: 0.4,
                },
                {
                    label: 'Second Dataset',
                    data: [28, 48, 40, 19, 86, 27, 90],
                    fill: false,
                    backgroundColor:
                        documentStyle.getPropertyValue('--green-600'),
                    borderColor: documentStyle.getPropertyValue('--green-600'),
                    tension: 0.4,
                },
            ],
        };

        this.chartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                    },
                },
                y: {
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                    },
                },
            },
        };
    }
}
