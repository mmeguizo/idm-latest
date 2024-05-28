import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/demo/service/user.service';
import { Subject, takeUntil } from 'rxjs';
@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
    users: any;
    private getUserSubscription = new Subject<void>();

    constructor(public userService: UserService) {}

    ngOnInit() {
        this.getAllusers();
    }
    ngOnDestroy() {
        this.getUserSubscription.unsubscribe();
    }

    getAllusers() {
        this.userService
            .getRoute('get', 'users', 'getAllUsers')
            .pipe(takeUntil(this.getUserSubscription))
            .subscribe((data: any) => {
                this.users = data.users.length;
            });
    }
}
