import {
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    ChangeDetectorRef,
} from '@angular/core';
import { UserService } from 'src/app/demo/service/user.service';
import { Subject, takeUntil } from 'rxjs';
import { GoalService } from 'src/app/demo/service/goal.service';
import { DepartmentService } from 'src/app/demo/service/department.service';
import { ObjectiveService } from 'src/app/demo/service/objective.service';
import { IdepartmentDropdown } from 'src/app/interface/department.interface';
import { IcampusDropdown } from 'src/app/interface/campus.interface';
import { BranchService } from 'src/app/demo/service/branch.service';
import { MessageService } from 'primeng/api';
import { TabView, TabPanel } from 'primeng/tabview';
import { ChartComponent } from '@swimlane/ngx-charts';

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
    barData: any;
    barOptions: any;
    loading: boolean = false;
    NewGoals: any;
    cities: any[];
    countries: any[] = [];
    departmentList: IdepartmentDropdown[] | undefined;
    campusList: IcampusDropdown[] | undefined;

    selectedDepartmentDropdown: IdepartmentDropdown | undefined;
    selectedCampusDropdown: IcampusDropdown | undefined;

    selectedAgoal: Boolean = false;

    pieData: any;
    pieDataBool: Boolean = false;
    pieOptions: any;
    objectivesSideData: any[];
    selectedGoalData: any;

    totalBudget: number = 0;
    totalSubBudget: number = 0;
    remainingBudget: number = 0;
    completionPercentage: number = 0;
    completedGoals: number = 0;
    inProgressGoals: number = 0;
    notStartedGoals: number;
    knobValue: number;

    // charts data

    barCharts: any;

    // tabview and panel
    selectedIndex = 0;
    @ViewChild(TabView) tabView: TabView;
    constructor(
        public userService: UserService,
        private goalService: GoalService,
        private dept: DepartmentService,
        private obj: ObjectiveService,
        private branch: BranchService,
        private messageService: MessageService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        // Object.assign(this, { multi });
    }

    ngOnInit() {
        this.getAllusers();
        this.getAllGoals();
        this.getAllDept();
        this.getAllObjectives();
        this.getAllObjectivesWithObjectives();
        this.getAllCampusForDashboard();
        // this.thisBarCharts();
    }

    processDashboardData(data) {
        this.totalBudget =
            data.goals?.reduce((sum, goal) => sum + (goal.budget || 0), 0) || 0;

        this.totalSubBudget = (data.goals ?? []).reduce((sum, goal) => {
            return (
                sum +
                (goal.objectivesDetails?.reduce(
                    (subSum, obj) => subSum + (obj.budget || 0),
                    0
                ) ?? 0)
            );
        }, 0);

        this.knobValue = this.remainingBudget =
            (this.totalSubBudget !== 0 ? this.totalBudget : 0) -
            this.totalSubBudget;
        const goalsWithObjectives = (data.goals ?? []).filter(
            (goal) =>
                goal.objectivesDetails && goal.objectivesDetails.length > 0
        );

        // Calculate completed goals
        this.completedGoals = goalsWithObjectives.filter((goal) =>
            goal.objectivesDetails.every((obj) => obj.complete)
        ).length;

        // Calculate in-progress goals
        this.inProgressGoals = goalsWithObjectives.filter((goal) =>
            goal.objectivesDetails.some((obj) => !obj.complete)
        ).length;

        // Calculate not started goals
        this.notStartedGoals = data.goals?.length
            ? data.goals.length - this.inProgressGoals - this.completedGoals
            : 0;

        // Correctly calculate completion percentage (using filtered goals with objectives)
        this.completionPercentage =
            this.totalBudget > 0
                ? (this.completedGoals / goalsWithObjectives.length) * 100
                : 0;
    }

    async getAllCampusForDashboard() {
        await this.branch.getCampus().then((campus) => {
            this.campusList = campus;
        });
    }

    async getAllusers() {
        await this.userService
            .fetch('get', 'users', 'getAllUsersForDashboard')
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data: any) => {
                this.users = data.data[0];
            });
    }
    async getAllGoals() {
        await this.goalService
            .fetch('get', 'goals', 'getGoalsForDashboard')
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data: any) => {
                this.NewGoals = data.data[0];
            });
    }

    async getAllDept() {
        await this.dept
            .getRoute('get', 'department', 'getAllDepartmentForDashboard')
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data: any) => {
                this.deparmentData = data.data[0];
            });
    }

    async getAllObjectives() {
        await this.obj
            .getRoute('get', 'objectives', `getAllObjectivesForDashboard`)
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data: any) => {
                this.objectivesData = data.data[0] || [];
            });
    }

    async getAllObjectivesWithObjectives(campus?: string) {
        this.loading = true;
        this.goalService
            .fetch(
                'get',
                'goals',
                `getAllObjectivesWithObjectivesForDashboard/${campus}`
            )
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe({
                next: (data: any) => {
                    this.goals = data.goals || [];
                    this.thisBarCharts(data.goals);
                    this.processDashboardData(data);
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error fetching data:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to fetch goals',
                    }); // Display error message
                    this.loading = false;
                },
            });
    }

    async getAllDepartmentForDashboard() {
        await this.dept
            .getRoute('get', 'department', 'getAllDepartmentDropdown')
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data: any) => {
                this.departmentList = data.data[0];
            });
    }

    showDetails(goal: any) {}

    selectedGoal(goal: any) {
        this.selectedAgoal = true;
        this.selectedGoalData = goal;

        if (goal) {
            this.obj
                .getRoute(
                    'get',
                    'objectives',
                    `getAllObjectivesForDashboardPie/${goal.id}`
                )
                .pipe(takeUntil(this.getDashboardSubscription))
                .subscribe((data: any) => {
                    let {
                        objectiveCompleted,
                        objectiveUncompleted,
                        objectivesData,
                        completionPercentage,
                    } = data.data[0];
                    this.objectivesSideData = objectivesData;
                    this.pieDataBool = objectivesData.length > 1 ? true : false;
                    this.initCharts(objectivesData);
                    this.loading = false;
                });
        }
    }

    onChangeCampus(event: any = '') {
        this.loading = true;
        this.selectedAgoal = false;
        this.goals = [];
        this.totalBudget = 0;
        this.totalSubBudget = 0;
        this.remainingBudget = 0;
        this.completionPercentage = 0;
        this.completedGoals = 0;
        this.inProgressGoals = 0;
        this.notStartedGoals = 0;
        this.knobValue = 0;
        this.getAllObjectivesWithObjectives(event?.value?.name ?? '');
    }

    onClearCampus() {
        this.loading = true;
        this.selectedAgoal = false;
        this.goals = [];
        this.getAllObjectivesWithObjectives();
    }

    initCharts(data?: any) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue(
            '--text-color-secondary'
        );
        const surfaceBorder =
            documentStyle.getPropertyValue('--surface-border');

        this.pieData = {
            labels: data.map((e) => e.functional_objective),
            datasets: [
                {
                    data: data.map((e) => 1),
                    backgroundColor: [
                        documentStyle.getPropertyValue('--indigo-500'),
                        documentStyle.getPropertyValue('--purple-500'),
                        documentStyle.getPropertyValue('--teal-500'),
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--indigo-400'),
                        documentStyle.getPropertyValue('--purple-400'),
                        documentStyle.getPropertyValue('--teal-400'),
                    ],
                },
            ],
        };

        this.pieOptions = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor,
                    },
                },
            },
        };
    }

    // Create Pie Chart
    createPieChart() {
        if (this.objectivesSideData && this.objectivesSideData.length > 0) {
            const completed = this.objectivesSideData.filter(
                (obj) => obj.complete
            ).length;
            const notCompleted = this.objectivesSideData.length - completed;

            this.pieData = {
                labels: ['Completed', 'Not Completed'],
                datasets: [
                    {
                        data: [completed, notCompleted],
                        backgroundColor: ['#42A5F5', '#FFA726'],
                        hoverBackgroundColor: ['#64B5F6', '#FFB74D'],
                    },
                ],
            };
            this.pieDataBool = true;
        } else {
            this.pieDataBool = false;
        }
    }

    ngOnDestroy() {
        this.getDashboardSubscription.next();
        this.getDashboardSubscription.complete();
    }

    // tab view and panel

    onChange($event: any) {
        this.selectedIndex = $event.index;
    }

    getSelectedHeader() {
        alert(this.tabView.tabs[this.selectedIndex].header);
    }

    async thisBarCharts(data: any = []) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue(
            '--text-color-secondary'
        );
        const surfaceBorder =
            documentStyle.getPropertyValue('--surface-border');

        const labels = [];
        const sublabels = [];
        const datasets = [];
        const budgetData = [];
        const usedColors = new Set<string>(); //To keep track of used colors

        data.forEach((goal) => {
            if (goal.objectivesDetails) {
                goal.objectivesDetails.map((obj) => {
                    budgetData.push(obj.budget);
                    labels.push(obj.functional_objective);
                });
            }
        });

        datasets.push({
            label: 'Sub Goals',
            backgroundColor: [
                'rgba(255, 159, 64, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)',
            ],
            borderColor: [
                'rgb(255, 159, 64)',
                'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
            ],
            data: budgetData,
        });

        this.barCharts = {
            labels: labels,
            datasets: datasets,
        };

        this.options = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                    },
                },
                x: {
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
