import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
} from '@angular/core';

import { Subject, pipe, takeUntil } from 'rxjs';
import { ObjectiveService } from 'src/app/demo/service/objective.service';
import {
    FormBuilder,
    Validators,
    FormControl,
    FormGroup,
} from '@angular/forms';
@Component({
    selector: 'app-objectives',
    templateUrl: './objectives.component.html',
    styleUrl: './objectives.component.scss',
})
export class ObjectivesComponent implements OnInit, OnDestroy {
    private objectiveSubscription = new Subject<void>();
    @ViewChild('filter') filter!: ElementRef;

    objectives: any[] = [];

    //table columns
    cols!: any;
    loading = true;

    constructor(private obj: ObjectiveService) {}

    ngOnInit() {
        console.log('test');
    }

    ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.objectiveSubscription.unsubscribe();
    }
}
