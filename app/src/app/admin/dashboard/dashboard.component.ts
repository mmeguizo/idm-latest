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
import {
    IcampusDropdown,
    IdepartmentDashboardDropdown,
} from 'src/app/interface/campus.interface';
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
    goalBarChartList: IdepartmentDashboardDropdown[] | undefined;

    selectedDepartmentDropdown: IdepartmentDropdown | undefined;
    selectedCampusDropdown: IcampusDropdown | undefined;
    selectedBarDepartmentDropdown: IdepartmentDropdown | undefined;

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
    totalObjectivesCount: number;
    knobValue: number;
    barChartType: string = 'line';

    // charts data

    barCharts: any;
    pieCharts: any;

    // tabview and panel
    selectedIndex = 0;
    @ViewChild(TabView) tabView: TabView;

    MONTHS = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    PieChartOptions: any;
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
        this.getAllObjectivesWithObjectivesForCharts();
        this.getAllCampusForDashboard();
        // this.thisBarCharts();
    }

    async processDashboardData(data) {
        console.log({ processDashboardData: data });
        // total of objectives

        const objectives =
            data.goals?.reduce(
                (sum, goal) => sum + (goal.objectivesDetails?.length || 0),
                0
            ) || 0;

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

        // Calculate remaining budget
        this.knobValue = this.remainingBudget =
            this.totalBudget - (this.totalSubBudget || 0);

        // Filter goals with objectives
        const goalsWithObjectives = (data.goals ?? []).filter(
            (goal) => goal.objectivesDetails?.length > 0
        );

        // Calculate completed, in-progress, and not-started goals
        const { completedGoals, inProgressGoals } = goalsWithObjectives.reduce(
            (acc, goal) => {
                const objectives = goal.objectivesDetails || [];

                objectives.forEach((obj) => {
                    if (obj.complete) {
                        acc.completedGoals++;
                    } else {
                        acc.inProgressGoals++;
                    }
                });

                return acc;
            },
            { completedGoals: 0, inProgressGoals: 0 }
        );

        // Assign calculated values
        this.completedGoals = completedGoals;
        this.inProgressGoals = inProgressGoals;

        // Calculate totalObjectivesCount by subtracting completed and in-progress goals and no negative values
        this.totalObjectivesCount = Math.abs(
            this.completedGoals + this.inProgressGoals
        );

        // Correctly calculate completion percentage
        this.completionPercentage =
            goalsWithObjectives.length > 0
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
                console.log(data.data);
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
            .fetch('get', 'objectives', `getAllObjectivesForDashboard`)
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data: any) => {
                this.objectivesData = data.data[0] || [];
            });
    }

    async getAllObjectivesWithObjectives(campus?: string) {
        console.log({ getAllObjectivesWithObjectives: campus });
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
                    console.log({ getAllObjectivesWithObjectives: data });
                    this.goals = data.goals || [];
                    // this.goalBarChartList = data.goalDropdown || [];
                    // this.pieChart(data.goals || this.goals || []);
                    // this.thisBarCharts(data.goals);
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

    async getAllObjectivesWithObjectivesForCharts(campus?: string) {
        console.log({ getAllObjectivesWithObjectives: campus });
        this.loading = true;
        this.goalService
            .fetch('get', 'goals', `getAllObjectivesWithObjectivesForCharts`)
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe({
                next: (data: any) => {
                    console.log({ getAllObjectivesWithObjectives: data });
                    this.goals = data.goals || [];
                    this.goalBarChartList = data.goalDropdown || [];
                    this.pieChart(data.goals || this.goals || []);
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
                .fetch(
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
                    console.log(data.data[0]);
                    this.objectivesSideData = objectivesData;
                    this.pieDataBool =
                        objectivesData.length >= 1 ? true : false;
                    console.log({
                        getAllObjectivesForDashboardPie: {
                            objectivesSideData: this.objectivesSideData.length,
                            pieData: this.pieDataBool,
                        },
                    });
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
        this.totalObjectivesCount = 0;
        this.knobValue = 0;
        this.getAllObjectivesWithObjectives(event?.value?.name ?? '');
    }
    async onChangeDepartment(event: any = '') {
        this.barCharts = [];
        console.log({ onChangeDepartment: event.value });
        if (event.value) {
            const matchingGoals = this.goals.filter(
                (goal) => goal.department === event.value.name
            );
            this.barChartType = 'bar';
            console.log(this.barChartType);
            console.log({ matchingGoals });
            await this.selectedBarChartDepartments(matchingGoals);
        }
    }

    async selectedBarChartDepartments(data: any) {
        console.log({ selectedBarChartDepartments: data });

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue(
            '--text-color-secondary'
        );
        const surfaceBorder =
            documentStyle.getPropertyValue('--surface-border');

        const labelsObjectiveName = [];
        const incompleteGoals = [];
        // const actualBudget = [];
        const completedGoals = [];
        // const monthData = [];
        // const currentMonth = new Date().getMonth() + 1; // Current month (1-12)
        console.log({ selectedBarChartDepartments: data });
        data.forEach((goal) => {
            let objectiveName = goal.objectivesDetails.map(
                (e) => e.functional_objective
            );
            if (goal.department && goal.budget && goal.date_added) {
                // const dateAdded = new Date(goal.date_added);
                // const monthAdded = dateAdded.getMonth() + 1; // Month (1-12)
                labelsObjectiveName.push(objectiveName);
                // actualBudget.push(goal.budget);
                completedGoals.push(
                    goal.completion_percentage === 100
                        ? goal.completion_percentage
                        : 0
                );
                console.log({ completedGoals });
                incompleteGoals.push(
                    goal.completion_percentage < 100
                        ? goal.completion_percentage
                        : 0
                );
                // monthData.push(monthAdded);
            }
        });

        console.log({ completedGoals, incompleteGoals });

        const datasets = [
            {
                label: 'Completed',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgb(75, 192, 192)',
                data: completedGoals,
            },
            {
                label: 'In Progress',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgb(153, 102, 255)',
                data: incompleteGoals,
            },
        ];

        this.barCharts = {
            labels: labelsObjectiveName,
            // labels: this.months({ count: currentMonth }),
            datasets: datasets,
        };

        this.options = {
            type: 'line',
            data: datasets,
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

    onClearCampus() {
        this.loading = true;
        this.selectedAgoal = false;
        this.goals = [];
        this.getAllObjectivesWithObjectives();
    }

    onClearDepartment() {
        console.log('onClearDepartment');
        this.barCharts = [];
        this.selectedBarDepartmentDropdown = undefined;
        this.barChartType = 'line';
        this.thisBarCharts(this.goals);
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

    async pieChart(data: any = []) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        const labels = data.map((goal) => goal.department);
        const budgets = data.map((goal) => goal.remainingBudget);
        const generateRandomColor = () => {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            return `rgba(${r}, ${g}, ${b}, 0.2)`;
        };

        const backgroundColors = labels.map(() => generateRandomColor());
        const hoverBackgroundColors = backgroundColors.map((color) =>
            color.replace('0.2', '0.4')
        );

        this.pieCharts = data = {
            labels: labels,
            datasets: [
                {
                    data: budgets,
                    backgroundColor: backgroundColors,
                    hoverBackgroundColor: hoverBackgroundColors,
                },
            ],
        };

        this.PieChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor,
                    },
                },
            },
            maintainAspectRatio: true,
        };
    }
    async thisBarCharts(data: any = []) {
        console.log({ thisBarCharts: data });
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue(
            '--text-color-secondary'
        );
        const surfaceBorder =
            documentStyle.getPropertyValue('--surface-border');

        const labelsObjectiveName = [];
        const labelsOfficeName = [];
        const actualBudget = [];
        const actualBudgetCompleted = [];
        const budgetData = [];
        const monthData = [];
        const currentMonth = new Date().getMonth() + 1; // Current month (1-12)

        data.forEach((goal) => {
            let objectiveName = goal.objectivesDetails.map(
                (e) => e.functional_objective
            );
            let objectiveCompleted = goal.objectivesDetails.map((e) => {
                if (e.complete) {
                    actualBudgetCompleted.push(goal.budget);
                }
            });
            if (goal.department && goal.budget && goal.date_added) {
                const dateAdded = new Date(goal.date_added);
                const monthAdded = dateAdded.getMonth() + 1; // Month (1-12)
                labelsObjectiveName.push(objectiveName);
                actualBudget.push(goal.budget);
                budgetData.push(goal.remainingBudget);
                monthData.push(monthAdded);
            }
        });

        const datasets = [
            {
                label: 'Budget',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgb(75, 192, 192)',
                data: budgetData,
                stack: 'combined',
                type: 'bar',
            },
            {
                label: 'Actual Budget',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgb(153, 102, 255)',
                data: actualBudget,
                stack: 'combined',
            },
            {
                label: 'Completed',
                backgroundColor: 'rgba(153, 82, 255, 0.2)',
                borderColor: 'rgb(153, 102, 255)',
                data: actualBudgetCompleted,
                // stack: 'combined',
                type: 'bar',
            },
            // {
            //     label: 'Current Month',
            //     backgroundColor: 'rgba(255, 159, 64, 0.2)',
            //     borderColor: 'rgb(255, 159, 64)',
            //     data: Array(labelsObjectiveName.length).fill(currentMonth),
            // },
        ];

        this.barCharts = {
            // labels: this.months({ count: currentMonth }),
            labels: labelsObjectiveName,
            datasets: datasets,
        };

        this.options = {
            type: 'line',
            data: datasets,
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
    months(config) {
        var cfg = config || {};
        var count = cfg.count || 12;
        var section = cfg.section;
        var values = [];
        var i, value;

        for (i = 0; i < count; ++i) {
            value = this.MONTHS[Math.ceil(i) % 12];
            values.push(value.substring(0, section));
        }

        return values;
    }
}
