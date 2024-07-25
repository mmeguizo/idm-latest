import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/demo/service/user.service';
import { Subject, takeUntil } from 'rxjs';
import { GoalService } from 'src/app/demo/service/goal.service';
import { DepartmentService } from 'src/app/demo/service/department.service';
import { ObjectiveService } from 'src/app/demo/service/objective.service';
import { IdepartmentDropdown } from 'src/app/interface/department.interface';
import { IcampusDropdown } from 'src/app/interface/campus.interface';
import { CampusService } from 'src/app/demo/service/campus.service';
import { BranchService } from 'src/app/demo/service/branch.service';

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

    constructor(
        public userService: UserService,
        private goalService: GoalService,
        private dept: DepartmentService,
        private obj: ObjectiveService,
        private campus: CampusService,
        private branch: BranchService
    ) {}

    ngOnInit() {
        this.getAllusers();
        this.getAllGoals();
        this.getAllDept();
        this.getAllObjectives();
        this.getAllObjectivesWithObjectives();
        this.getAllCampusForDashboard();
        // this.initCharts();
    }
    ngOnDestroy() {
        this.getDashboardSubscription.unsubscribe();
    }

    async getAllCampusForDashboard() {
        await this.branch.getCampus().then((campus) => {
            console.log({ getAllCampusForDashboard: campus });
            this.campusList = campus;
        });
    }

    async getAllusers() {
        await this.userService
            .getRoute('get', 'users', 'getAllUsersForDashboard')
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data: any) => {
                this.users = data.data[0];
            });
    }
    async getAllGoals() {
        await this.goalService
            .getRoute('get', 'goals', 'getGoalsForDashboard')
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data: any) => {
                console.log({ getAllGoalsNewGoals: data });
                this.NewGoals = data.data;
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
                this.objectivesData = data.data[0];
            });
    }

    async getAllObjectivesWithObjectives(campus?: string) {
        this.loading = true;
        await this.goalService
            .getRoute(
                'get',
                'goals',
                `getAllObjectivesWithObjectivesForDashboard/${campus}`
            )
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe(async (data: any) => {
                this.goals = data.goals;
                this.loading = false;
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

    showDetails(goal: any) {
        console.log({ showDetails: goal });
    }

    selectedGoal(goal: any) {
        console.log({ selectedGoal: goal });
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
                    console.log({ getAllByIdObjectives: data });

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
        console.log({ onChangeCampus: event?.value });
        this.loading = true;
        this.selectedAgoal = false;
        this.goals = [];
        this.getAllObjectivesWithObjectives(event?.value?.name ?? '');
    }

    onClearCampus() {
        this.loading = true;
        this.selectedAgoal = false;
        this.goals = [];
        this.getAllObjectivesWithObjectives();
    }

    initCharts(data?: any) {
        console.log({ initCharts: data });
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
}
