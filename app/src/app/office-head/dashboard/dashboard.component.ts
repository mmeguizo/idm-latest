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
@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, CardModule, RouterOutlet, FullCalendarModule],
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
    userId: string;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private obj: ObjectiveService,
        private auth: AuthService
    ) {}

    ngOnInit() {
        this.userId = this.auth.getTokenUserID();
        this.getAllobjectivesGoalsUsers();
    }

    getAllobjectivesGoalsUsers() {
        this.loading = true;
        this.obj
            .fetch(
                'get',
                'objectives',
                `getObjectiveForCalendar/${this.userId}`
            )
            .pipe(takeUntil(this.objectiveSubscription))
            .subscribe((data: any) => {
                console.log(data.data);
                const events = this.transformEvents(data.data);
                this.updateCalendarEvents(events);
                this.loading = false;
            });
    }

    transformEvents(data: any[]): any[] {
        return data.map((item) => {
            const title =
                ` ${item.functional_objective.toUpperCase()} : ` +
                this.getCurrentGoalAndActual(item);
            console.log({
                getCurrentGoalAndActual: this.getCurrentGoalAndActual(item),
            });
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

        console.log({ diffMonths: diffMonths }); // Debugging: Show the difference in months

        // Check the frequency_monitoring field
        const frequency = entry.frequency_monitoring;

        if (frequency === 'yearly') {
            // Use the current month index directly
            const currentMonth = currentDate.getMonth() + 1;
            console.log({ currentMonth: currentMonth }); // Debugging: Log current month index
            console.log({ goalmonth: entry[`goal_month_${currentMonth}`] });
            console.log({ actualmonth: entry[`month_${currentMonth}`] });

            return `Goal: ${
                entry[`goal_month_${currentMonth}`] ?? 'Not Available'
            } | Actual: ${entry[`month_${currentMonth}`] ?? 'Not Available'}`;
        } else if (frequency === 'quarterly') {
            // Find the current quarter index (0 to 3)
            const currentQuarter = Math.floor(diffMonths / 3) % 4;
            console.log({ currentQuarter: currentQuarter }); // Debugging: Log current quarter index

            return `Goal: ${
                entry[`goal_quarter_${currentQuarter}`] ?? 'Not Available'
            } | Actual: ${
                entry[`quarter_${currentQuarter}`] ?? 'Not Available'
            }`;
        } else if (frequency === 'semi_annual') {
            // Find the current half-year index (0 or 1)
            const currentHalf = Math.floor(diffMonths / 6) % 2;
            console.log({ currentHalf: currentHalf }); // Debugging: Log current half-year index

            return `Goal: ${
                entry[`goal_semi_annual_${currentHalf}`] ?? 'Not Available'
            } | Actual: ${
                entry[`semi_annual_${currentHalf}`] ?? 'Not Available'
            }`;
        } else {
            // Return a fallback message for unsupported or undefined frequency
            console.log('Frequency not supported or data missing');
            return 'Frequency not supported or data not available';
        }
    }
    // getCurrentGoalAndActual(entry: any): string {
    //     // Parse the createdAt date into a Date object
    //     const createdAt = new Date(entry.createdAt);
    //     const currentDate = new Date(); // Get the current date

    //     // Calculate the difference in months from createdAt to currentDate
    //     const diffMonths =
    //         (currentDate.getFullYear() - createdAt.getFullYear()) * 12 +
    //         currentDate.getMonth() -
    //         createdAt.getMonth();
    //     console.log({ diffMonths: diffMonths });
    //     // Check the frequency_monitoring field
    //     const frequency = entry.frequency_monitoring;

    //     if (frequency === 'yearly') {
    //         const currentMonth = diffMonths % 12; // Current month within the year
    //         console.log({
    //             currentMonth: currentMonth,
    //         });
    //         return `Goal: ${
    //             entry[`goal_month_${currentMonth}`] ?? 'Not Available'
    //         } | Actual: ${entry[`month_${currentMonth}`] ?? 'Not Available'}`;
    //     } else if (frequency === 'quarterly') {
    //         const currentQuarter = Math.floor(diffMonths / 3) % 4; // Calculate current quarter
    //         console.log({
    //             currentQuarter: currentQuarter,
    //         });
    //         return `Goal: ${
    //             entry[`goal_quarter_${currentQuarter}`] ?? 'Not Available'
    //         } | Actual: ${
    //             entry[`quarter_${currentQuarter}`] ?? 'Not Available'
    //         }`;
    //     } else if (frequency === 'semi_annual') {
    //         const currentHalf = Math.floor(diffMonths / 6) % 2; // Calculate current half of the year
    //         console.log({
    //             currentHalf: currentHalf,
    //         });
    //         return `Goal: ${
    //             entry[`goal_semi_annual_${currentHalf}`] ?? 'Not Available'
    //         } | Actual: ${
    //             entry[`semi_annual_${currentHalf}`] ?? 'Not Available'
    //         }`;
    //     } else {
    //         // Return a fallback message for undefined or unsupported frequency
    //         return 'Frequency not supported or data not available';
    //     }
    // }

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
}

/*


ngOnInit() {
    this.userId = this.auth.getTokenUserID();
    this.loadCustomData();
}

loadCustomData() {
    this.loading = true;
    const data =
    const events = this.transformEvents(data);
    this.updateCalendarEvents(events);
    this.loading = false;
}

transformEvents(data: any[]): any[] {
    return data.map((item) => {
        const goalAchieved = item.quarter_0 >= item.goal_quarter_0 || item.month_0 >= item.goal_month_0 || item.semi_annual_0 >= item.goal_semi_annual_0;
        const title = `${item.goals.goals} - ${goalAchieved ? 'Achieved' : 'Pending'}`;
        const color = goalAchieved ? '#28a745' : '#dc3545';

        return {
            id: item.id,
            title: title,
            start: item.timetable[0] || new Date(),
            end: item.timetable[1] || new Date(),
            backgroundColor: color,
            borderColor: color,
            allDay: true,
            extendedProps: {
                user: item.users.username,
                imageUrl: this.auth.domain + item.users.profile_pic,
                goal: item.goal_quarter_0 || item.goal_month_0 || item.goal_semi_annual_0,
                actual: item.quarter_0 || item.month_0 || item.semi_annual_0,
            }
        };
    });
}

updateCalendarEvents(events: any[]) {
    this.calendarOptions.update((options) => ({
        ...options,
        events: events,
    }));
}


*/
