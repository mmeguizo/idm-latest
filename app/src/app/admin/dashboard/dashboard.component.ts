import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/demo/service/user.service';
import { Subject, takeUntil } from 'rxjs';
import { GoalService } from 'src/app/demo/service/goal.service';
import { DepartmentService } from 'src/app/demo/service/department.service';
import { ObjectiveService } from 'src/app/demo/service/objective.service';
import { get } from 'lodash';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
    users: any;
    goals: any;
    private getDashboardSubscription = new Subject<void>();

    objectivePieData: any;
    objectiveDoughnutData: any;

    chartOptions: any;
    deparmentData: any;
    objectivesData: any;
    options: any;

    constructor(
        public userService: UserService,
        private goalService: GoalService,
        private dept: DepartmentService,
        private obj: ObjectiveService
    ) {}

    ngOnInit() {
        this.getAllusers();
        this.getAllGoals();
        this.getAllDept();
        this.getAllObjectives();
        this.getObjectiveViewPieChart();
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
                this.initChartsDoughnut({
                    complete: data.data[0].objectiveCompleted,
                    uncomplete: data.data[0].objectiveUncompleted,
                });
            });
    }

    getObjectiveViewPieChart() {
        this.goalService
            .getRoute('get', 'goals', `getObjectivesViewTable`)
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data: any) => {
                console.log({ getObjectiveViewPieChart: data });
                // this.initCharts(data);
            });
    }

    // initCharts(data: any) {
    //     const documentStyle = getComputedStyle(document.documentElement);
    //     const textColor = documentStyle.getPropertyValue('--text-color');
    //     const textColorSecondary = documentStyle.getPropertyValue(
    //         '--text-color-secondary'
    //     );
    //     const surfaceBorder =
    //         documentStyle.getPropertyValue('--surface-border');

    //     const goals = data.data.map((goal) => goal.goals);
    //     const goalsBudgets = data.data.map((goal) => {
    //         return goal.objectives.reduce(
    //             (total, obj) => total + obj.budget,
    //             0
    //         );
    //     });

    //     const objectiveLabels = data.data.flatMap((goal) =>
    //         goal.objectives.map((obj) => goal.goals)
    //     );
    //     const objectiveBudgets = data.data.flatMap((goal) =>
    //         goal.objectives.map((obj) => obj.budget)
    //     );

    //     const userAndDeptLabels = data.data.map(
    //         (goal) =>
    //             `${goal.users[0].username}  (${goal.objectives.map(
    //                 (e) => e.functional_objective
    //             )})`
    //     );
    //     const userAndDeptBudgets = data.data.map((goal) => {
    //         return goal.objectives.reduce(
    //             (total, obj) => total + obj.budget,
    //             0
    //         );
    //     });

    //     this.objectivePieData = {
    //         labels: [...goals],
    //         // labels: [...goals, ...objectiveLabels, ...userAndDeptLabels],
    //         datasets: [
    //             {
    //                 label: 'Budget',
    //                 data: [
    //                     ...goalsBudgets,
    //                     // ...objectiveBudgets,
    //                     // ...userAndDeptBudgets,
    //                 ],
    //                 backgroundColor: [
    //                     documentStyle.getPropertyValue('--blue-500'),
    //                     documentStyle.getPropertyValue('--yellow-500'),
    //                     documentStyle.getPropertyValue('--green-500'),
    //                 ],
    //                 hoverBackgroundColor: [
    //                     documentStyle.getPropertyValue('--blue-400'),
    //                     documentStyle.getPropertyValue('--yellow-400'),
    //                     documentStyle.getPropertyValue('--green-400'),
    //                 ],
    //             },
    //         ],
    //     };

    //     this.options = {
    //         scales: {
    //             y: {
    //                 beginAtZero: true,
    //             },
    //         },
    //         plugins: {
    //             legend: {
    //                 labels: {
    //                     usePointStyle: true,
    //                     color: textColor,
    //                 },
    //             },
    //             // tooltips: {
    //             //     callbacks: {
    //             //         label: function (tooltipItem) {
    //             //             const dataIndex = tooltipItem.dataIndex;
    //             //             console.log(dataIndex);
    //             //             console.log(goals.length);
    //             //         },
    //             //     },
    //             // },
    //         },
    //     };
    // }

    initChartsDoughnut(data: any) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        this.objectiveDoughnutData = {
            labels: ['Complete', 'In Progress'],
            datasets: [
                {
                    data: [data.complete, data.uncomplete],
                    backgroundColor: [
                        documentStyle.getPropertyValue('--blue-500'),
                        documentStyle.getPropertyValue('--yellow-500'),
                        documentStyle.getPropertyValue('--green-500'),
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--blue-400'),
                        documentStyle.getPropertyValue('--yellow-400'),
                        documentStyle.getPropertyValue('--green-400'),
                    ],
                },
            ],
        };

        this.options = {
            cutout: '60%',
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                    },
                },
            },
        };
    }
}
