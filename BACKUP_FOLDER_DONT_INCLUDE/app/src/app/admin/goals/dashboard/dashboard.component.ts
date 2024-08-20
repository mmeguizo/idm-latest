import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { GoalService } from 'src/app/demo/service/goal.service';
import { ObjectiveService } from 'src/app/demo/service/objective.service';
import { ProductService } from 'src/app/demo/service/product.service';
import { Product } from 'src/app/demo/api/product';
import { Chart } from 'chart.js';
interface expandedRows {
    [key: string]: boolean;
}
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class GoalDashboardComponent implements OnInit, OnDestroy {
    dashboardSubscription = new Subject<void>();
    goals: any[] = [];
    products: Product[] = [];
    loading = true;
    barOptions: any;
    barData: any;
    objectiveBudget: number;
    isExpanded: boolean = false;
    expandedRows: expandedRows = {};
    totalObjectives: any;
    completedObjectives: any;
    myChart: any;
    goalCount: any;
    donutData: {
        labels: any[];
        datasets: {
            label: string;
            backgroundColor: string;
            borderColor: string;
            data: any[];
        }[];
    };
    donutOptions: {
        plugins: { legend: { labels: { fontColor: string } } };
        scales: {
            x: {
                ticks: { color: string; font: { weight: number } };
                grid: { display: boolean; drawBorder: boolean };
            };
            y: {
                ticks: { color: string };
                grid: { color: string; drawBorder: boolean };
            };
        };
    };
    goalForTables: any;

    constructor(
        private goal: GoalService,
        private goalService: GoalService,
        private obj: ObjectiveService,
        private productService: ProductService
    ) {
        this.getGoals();
        this.getObjectiveViewPieChart();
        this.getAllObjectives();
    }

    ngOnInit() {
        this.productService
            .getProductsWithOrdersSmall()
            .then((data) => (this.products = data));

        this.getAllObjectivesForTable();
    }

    getCompletedObjectives(goal: any): number {
        return (
            goal.objectivesDetails?.filter((o) => o.complete && !o.deleted)
                .length || 0
        );
    }

    getIncompleteObjectives(goal: any): number {
        return (
            goal.objectivesDetails?.filter((o) => !o.complete && !o.deleted)
                .length || 0
        );
    }

    getGoals() {
        this.goal
            .getRoute('get', 'goals', 'getGoalsForDashboard')
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data: any) => {
                this.goalForTables =
                    data?.data[0]?.totalBudget[0]?.totalAmount || 0;
                this.goalCount = data?.data[0]?.goalCount;
                this.loading = false;
            });
    }

    getAllObjectives() {
        this.obj
            .getRoute('get', 'objectives', `getAllObjectivesBudget`)
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data: any) => {
                this.objectiveBudget = data.data;
            });
    }
    getAllObjectivesForTable() {
        this.obj
            .getRoute('get', 'goals', `getAllObjectivesWithObjectives`)
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data: any) => {
                this.goals = data.goals;
                console.log({ getAllObjectivesForTable: this.goalForTables });
            });
    }

    getObjectiveViewPieChart() {
        this.goalService
            .getRoute('get', 'goals', `getObjectivesViewTable`)
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data?: any) => {
                this.initBarCharts(data?.data);
            });
    }

    ngOnDestroy(): void {
        this.dashboardSubscription.unsubscribe();
    }
    initBarCharts(goal?: any) {
        let objectivesData = goal?.map((e) => e.objectives);
        let objectivesDataTrue = goal?.map((e) =>
            e.objectives.filter((x) => x.deleted == false)
        );

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue(
            '--text-color-secondary'
        );
        const surfaceBorder =
            documentStyle.getPropertyValue('--surface-border');

        this.donutData = {
            labels: [...goal?.map((e) => e.goals)],
            datasets: [
                {
                    label: 'Goals',
                    backgroundColor:
                        documentStyle.getPropertyValue('--primary-500'),
                    borderColor:
                        documentStyle.getPropertyValue('--primary-500'),
                    data: [...goal?.map((e) => 1)],
                },
                {
                    label: 'Objectives',
                    backgroundColor:
                        documentStyle.getPropertyValue('--primary-200'),
                    borderColor:
                        documentStyle.getPropertyValue('--primary-200'),
                    data: [
                        ...objectivesDataTrue.map((e) =>
                            e.length ? e.length : 0
                        ),
                    ],
                },
            ],
        };

        this.donutOptions = {
            plugins: {
                legend: {
                    labels: {
                        fontColor: textColor,
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500,
                        },
                    },
                    grid: {
                        display: false,
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

    expandAll() {
        if (!this.isExpanded) {
            this.products.forEach((product) =>
                product && product.name
                    ? (this.expandedRows[product.name] = true)
                    : ''
            );
        } else {
            this.expandedRows = {};
        }
        this.isExpanded = !this.isExpanded;
    }
}
