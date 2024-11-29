import {
    Component,
    signal,
    ChangeDetectorRef,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
    CalendarOptions,
    DateSelectArg,
    EventClickArg,
    EventApi,
} from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { ObjectiveService } from 'src/app/demo/service/objective.service';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/demo/service/auth.service';
import { CardModule } from 'primeng/card';
import { UserService } from 'src/app/demo/service/user.service';

import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import {
    IcampusDropdown,
    IdepartmentDashboardDropdown,
} from 'src/app/interface/campus.interface';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { IdepartmentDropdown } from 'src/app/interface/department.interface';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        RouterOutlet,
        FullCalendarModule,
        SkeletonModule,
        ChartModule,
        DropdownModule,
        ReactiveFormsModule,
        FormsModule,
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
    COLORS = ['#f06292', '#ba68c8', '#4dd0e1', '#aed581', '#ffca28'];
    calendarVisible = signal(true);
    private objectiveSubscription = new Subject<void>();
    calendarOptions = signal<CalendarOptions>({
        plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
        headerToolbar: {
            // left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        },
        initialView: 'dayGridMonth',
        weekends: true,
        editable: false,
        selectable: false,
        selectMirror: true,
        dayMaxEvents: false,
        navLinks: false,
        select: this.handleDateSelect.bind(this),
        eventClick: this.handleEventClick.bind(this),
        eventsSet: this.handleEvents.bind(this),
    });
    currentEvents = signal<EventApi[]>([]);
    loading = true;
    USERID: string;

    selectedBarDepartmentDropdown: IdepartmentDropdown | undefined;
    getAllObjectivesUnderAOfficeHeadData: any;
    goalBarChartList: IdepartmentDashboardDropdown[] | undefined;
    PieChartOptions: any;
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
    options: any;
    barCharts: any;
    pieCharts: any;
    completedGoalsFromApi: any;
    uncompletedGoalsFromApi: any;
    goals: any;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private obj: ObjectiveService,
        private auth: AuthService,
        public userService: UserService
    ) {}

    ngOnInit() {
        this.USERID = this.auth.getTokenUserID();
        this.getAllObjectivesUnderAOfficeHead();
    }

    transformEvents(data: any[]): any[] {
        return data.map((item) => {
            const title =
                ` ${item.functional_objective.toUpperCase()} : ` +
                this.getCurrentGoalAndActual(item);
            let endDate = new Date(item.createdAt);
            if (item.frequency_monitoring === 'yearly') {
                // endDate.setFullYear(endDate.getFullYear() + 1);
                endDate = this.getEndDateAfter12Months(item.createdAt);
            } else if (item.frequency_monitoring === 'semi_annual') {
                // endDate.setMonth(endDate.getMonth() + 6);
                endDate = this.getEndDateAfter6Months(item.createdAt);
            } else if (item.frequency_monitoring === 'quarterly') {
                // endDate.setMonth(endDate.getMonth() + 3);
                endDate = this.getEndDateAfter3Months(item.createdAt);
            }

            return {
                id: item.id,
                title: title,
                start: item.createdAt,
                end: endDate,
                backgroundColor: item.completed ? '#1f6f78' : '#2c5d63',
                borderColor: '#352f44',
                allDay: true,
                extendedProps: {
                    user: item.users.username,
                    imageUrl: this.auth.domain + item.users.profile_pic,
                    goal:
                        item.goal_quarter_0 ||
                        item.goal_month_0 ||
                        item.goal_semi_annual_0,
                    actual:
                        item.quarter_0 || item.month_0 || item.semi_annual_0,
                },
            };
        });
    }
    getCurrentGoalAndActual(entry: any): string {
        // Parse the createdAt date into a Date object
        const createdAt = new Date(entry.createdAt);
        const currentDate = new Date(); // Get the current date

        // Calculate the difference in months from createdAt to currentDate
        const diffMonths =
            (currentDate.getFullYear() - createdAt.getFullYear()) * 12 +
            currentDate.getMonth() -
            createdAt.getMonth();

        // Check the frequency_monitoring field
        const frequency = entry.frequency_monitoring;

        if (frequency === 'yearly') {
            // Use the current month index directly
            const currentMonth = currentDate.getMonth() + 1;
            return `Goal: ${
                entry[`goal_month_${currentMonth}`] ?? 'Not Available'
            } | Actual: ${entry[`month_${currentMonth}`] ?? 'Not Available'}`;
        } else if (frequency === 'quarterly') {
            // Find the current quarter index (0 to 3)
            const currentQuarter = Math.floor(diffMonths / 3) % 4;

            return `Goal: ${
                entry[`goal_quarter_${currentQuarter}`] ?? 'Not Available'
            } | Actual: ${
                entry[`quarter_${currentQuarter}`] ?? 'Not Available'
            }`;
        } else if (frequency === 'semi_annual') {
            // Find the current half-year index (0 or 1)
            const currentHalf = Math.floor(diffMonths / 6) % 2;

            return `Goal: ${
                entry[`goal_semi_annual_${currentHalf}`] ?? 'Not Available'
            } | Actual: ${
                entry[`semi_annual_${currentHalf}`] ?? 'Not Available'
            }`;
        } else {
            // Return a fallback message for unsupported or undefined frequency
            return 'Frequency not supported or data not available';
        }
    }

    getEndDateAfter12Months(createdAt) {
        // Parse the input 'createdAt' into a Date object
        let startDate = new Date(createdAt);
        // Create a new Date object for the end date
        let endDate = new Date(startDate);
        // Add 12 months
        endDate.setMonth(endDate.getMonth() + 12);
        return endDate;
    }

    getEndDateAfter6Months(createdAt) {
        // Parse the input 'createdAt' into a Date object
        let startDate = new Date(createdAt);
        // Create a new Date object for the end date
        let endDate = new Date(startDate);
        // Add 6 months
        endDate.setMonth(endDate.getMonth() + 6);
        return endDate;
    }

    getEndDateAfter3Months(createdAt) {
        // Parse the input 'createdAt' into a Date object
        let startDate = new Date(createdAt);
        // Create a new Date object for the end date
        let endDate = new Date(startDate);
        // Add 3 months
        endDate.setMonth(endDate.getMonth() + 3);
        return endDate;
    }

    updateCalendarEvents(events: any[]) {
        this.calendarOptions.update((options) => ({
            ...options,
            events: events,
        }));
    }

    ngOnDestroy(): void {
        this.objectiveSubscription.unsubscribe();
    }

    handleCalendarToggle() {
        this.calendarVisible.update((bool) => !bool);
    }

    handleWeekendsToggle() {
        this.calendarOptions.update((options) => ({
            ...options,
            weekends: !options.weekends,
        }));
    }

    handleDateSelect(selectInfo: DateSelectArg) {
        // const title = prompt('Please enter a new title for your event');
        // const calendarApi = selectInfo.view.calendar;
        // calendarApi.unselect(); // clear date selection
        // if (title) {
        //     calendarApi.addEvent({
        //         id: createEventId(),
        //         title,
        //         start: selectInfo.startStr,
        //         end: selectInfo.endStr,
        //         allDay: selectInfo.allDay,
        //     });
        // }
    }

    handleEventClick(clickInfo: EventClickArg) {
        // if (
        //     confirm(
        //         `Are you sure you want to delete the event '${clickInfo.event.title}'`
        //     )
        // ) {
        //     clickInfo.event.remove();
        // }
    }

    handleEvents(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
    }

    async onChangeDepartment(event: any = '') {
        this.barCharts = [];
        if (event.value) {
            const matchingGoals = this.goals.filter(
                (goal) => goal.department === event.value.name
            );
            this.barChartType = 'bar';

            await this.selectedBarChartDepartments(matchingGoals);
        }
    }

    async getAllObjectivesUnderAOfficeHead() {
        await this.userService
            .fetch(
                'get',
                'office_head_query',
                `getAllObjectivesUnderAOfficeHeadV2/${this.USERID}`
            )
            .pipe(takeUntil(this.objectiveSubscription))
            .subscribe((data: any) => {
                this.getAllObjectivesUnderAOfficeHeadData = data;
                this.completedGoalsFromApi = data.completedGoals;
                this.uncompletedGoalsFromApi = data.uncompletedGoals;
                this.goals = data.goals || [];
                this.goalBarChartList = data.dropdown || [];
                this.pieChart(data.goals || this.goals || []);
                this.thisBarCharts(data.objectiveCompletions);
                this.processDashboardData(data);
            });
    }

    async processDashboardData(data) {
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

    async pieChart(data: any = []) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const labels = data.flatMap((e) =>
            e.objectivesDetails.map((x) => x.functional_objective)
        );
        const budgets = data.flatMap((e) =>
            e.objectivesDetails.map((x) => x.budget)
        );

        this.pieCharts = {
            labels: labels,
            datasets: [
                {
                    data: budgets,
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

    async selectedBarChartDepartments(data: any) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue(
            '--text-color-secondary'
        );
        const surfaceBorder =
            documentStyle.getPropertyValue('--surface-border');
        const labels: string[] = [];
        const dataGoal: number[] = [];
        const dataGoalObjective: number[] = [];
        const dataRemainingBudget: number[] = [];

        data.forEach((t: any) => {
            labels.push(t.department);
            dataGoal.push(t.budget);
            dataGoalObjective.push(
                t.objectivesDetails
                    .map((o: any) => o.budget)
                    .reduce((a: any, b: any) => a + b, 0)
            );
            dataRemainingBudget.push(t.remainingBudget);
        });

        this.barCharts = {
            labels: labels,
            // labels: this.months({ count: currentMonth }),
            datasets: [
                {
                    type: 'bar',
                    label: 'Goal Budget',
                    data: dataGoal,
                    backgroundColor:
                        documentStyle.getPropertyValue('--blue-500'),
                    borderWidth: 1,
                },
                {
                    type: 'bar',
                    label: 'Goal Remaining',
                    data: dataRemainingBudget,
                    backgroundColor:
                        documentStyle.getPropertyValue('--green-500'),
                    borderWidth: 1,
                },
                {
                    type: 'bar',
                    label: 'Objective Budget Total',
                    data: dataGoalObjective,
                    backgroundColor:
                        documentStyle.getPropertyValue('--yellow-500'),
                    borderWidth: 1,
                },
            ],
        };

        this.options = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                },
                legend: {
                    labels: {
                        color: textColor,
                    },
                },
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                    },
                },
                y: {
                    stacked: true,
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
    onClearDepartment() {
        this.barCharts = [];
        this.selectedBarDepartmentDropdown = undefined;
        this.barChartType = 'line';
        this.thisBarCharts(this.goals);
    }

    async thisBarCharts(data: any = []) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue(
            '--text-color-secondary'
        );
        const surfaceBorder =
            documentStyle.getPropertyValue('--surface-border');

        const objectiveName = [];
        const actualBudget = [];
        const actualBudgetCompleted = [];
        const budgetData = [];
        const percentageCompletion = [];

        data.forEach((goal) => {
            goal.objectivesDetails.map((e) => {
                objectiveName.push(e.functional_objective);
                // budgetData.push(e.budget);
                // actualBudget.push(goal.budget);
                percentageCompletion.push(e.completion_percentage);
                if (e.complete) {
                    actualBudgetCompleted.push(goal.budget);
                }
            });
        });

        const datasets = [
            {
                label: 'Percentage Completion',
                backgroundColor: documentStyle.getPropertyValue('--green-500'),
                borderColor: 'white',
                data: percentageCompletion,
                // data: budgetData,
                stack: 'combined',
                type: 'bar',
            },
            // {
            //     label: 'Actual Budget',
            //     backgroundColor: documentStyle.getPropertyValue('--orange-500'),
            //     data: actualBudget,
            //     stack: 'combined',
            // },
        ];

        this.barCharts = {
            // labels: this.months({ count: currentMonth }),
            labels: objectiveName,
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
}
