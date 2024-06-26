import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { LogService } from 'src/app/demo/service/logs.service';
import { Subject, takeUntil } from 'rxjs';
import { Table } from 'primeng/table';

interface PageEvent {
    first: number;
    rows: number;
    page: number;
    pageCount: number;
}

LogService;
@Component({
    selector: 'app-logs',
    templateUrl: './logs.component.html',
    styleUrl: './logs.component.scss',
})
export class LogsComponent {
    private getdepartmenttSubscription = new Subject<void>();
    @ViewChild('filter') filter!: ElementRef;
    logs: any[] = [];
    loading = true;
    cols!: any;
    first: number = 0;

    rows: number = 10;

    constructor(public log: LogService) {
        this.getAllLogs();
        this.cols = [
            { field: 'method', header: 'Action' },
            { field: 'status', header: 'Results' },
            { field: 'url', header: ' Api Call' },
            { field: 'user.username', header: 'User' },
            { field: 'createdAt', header: 'Date' },
        ];
    }

    getAllLogs() {
        this.loading = true;
        this.log
            .getAllLogs('get', 'logs', 'getAllLogs')
            .pipe(takeUntil(this.getdepartmenttSubscription))
            .subscribe((data: any) => {
                this.logs = data.data[0];
                this.loading = false;
            });
    }

    onPageChange(event: PageEvent) {
        this.first = event.first;
        this.rows = event.rows;
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }
}
