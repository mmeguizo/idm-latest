import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { GoalService } from 'src/app/demo/service/goal.service';
import { ObjectiveService } from 'src/app/demo/service/objective.service';
import { ProductService } from 'src/app/demo/service/product.service';
import { Product } from 'src/app/demo/api/product';
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
    donutData: any;
    donutOptions: any;
    goalForTables: any;

    constructor(
        private goal: GoalService,
        private goalService: GoalService,
        private obj: ObjectiveService,
        private productService: ProductService
    ) {}

    ngOnInit() {
        this.productService
            .getProductsWithOrdersSmall()
            .then((data) => (this.products = data));

        this.getAllObjectivesForTable();
        this.getGoals();
        this.getObjectiveViewPieChart();
        this.getAllObjectives();
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
            .fetch('get', 'goals', 'getGoalsForDashboard')
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
            .fetch('get', 'objectives', `getAllObjectivesBudget`)
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data: any) => {
                this.objectiveBudget = data.data;
            });
    }
    getAllObjectivesForTable() {
        this.obj
            .fetch('get', 'goals', `getAllObjectivesWithObjectives`)
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data: any) => {
                console.log('getAllObjectivesForTabledata', data);
                this.goals = data.goals;
            });
    }

    getObjectiveViewPieChart() {
        this.goalService
            .fetch('get', 'goals', `getObjectivesViewTable`)
            .pipe(takeUntil(this.dashboardSubscription))
            .subscribe((data?: any) => {
                this.initBarCharts(data?.data);
            });
    }

    ngOnDestroy(): void {
        this.dashboardSubscription.unsubscribe();
    }
    initBarCharts(goal?: any) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue(
            '--text-color-secondary'
        );
        const surfaceBorder =
            documentStyle.getPropertyValue('--surface-border');

        // Function to generate random color

        const getIncrementalColor = () => {
            const randomColor = [
                Math.floor(Math.random() * 256), // Red
                Math.floor(Math.random() * 256), // Green
                Math.floor(Math.random() * 256), // Blue
            ];

            // Return the color in rgba format with fixed alpha of 0.5
            return `rgba(${randomColor[0]}, ${randomColor[1]}, ${randomColor[2]}, 0.5)`;
        };

        console.log({ goal });
        const labels = [];
        const labelsDataset = [];
        const dataInsideDatasets = [];
        const totalBudget = [];
        const CompletedDataInsideDatasets = [];
        const completedLabels = [];
        goal.map((t) => {
            t.objectives.map((x: any) => {
                labelsDataset.push(x.functional_objective);
                dataInsideDatasets.push(x.budget);
                totalBudget.push(x.totalBudget);
                completedLabels.push(
                    x.complete ? 'Completed' : 'Not Completed'
                );
                CompletedDataInsideDatasets.push(
                    x.complete ? 'Completed' : 'Not Completed'
                );
                labels.push(x.functional_objective);
            });
        });
        const datasets = [
            {
                label: 'Budget of Objective',
                data: dataInsideDatasets,
                backgroundColor: getIncrementalColor(),
                borderColor: getIncrementalColor(),
                stack: 'combined',
                type: 'bar',
            },
            {
                label: 'Total Budget of the Goal',
                data: totalBudget,
                backgroundColor: getIncrementalColor(),
                borderColor: getIncrementalColor(),
                stack: 'combined',
            },
        ];

        console.log({ datasets, labels });

        this.donutData = {
            labels: labels,
            datasets: datasets,
        };

        this.donutOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
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
                        font: {
                            weight: 500,
                        },
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
