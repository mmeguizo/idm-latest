import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AiService } from 'src/app/demo/service/ai.service';
import { AuthService } from 'src/app/demo/service/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-ai',
    templateUrl: './ai.component.html',
    styleUrls: ['./ai.component.scss'],
})
export class AiComponent implements OnInit {
    messages: { text: string; isPersonal: boolean; isLoading?: boolean }[] = [];
    newMessageText: string = '';

    private getAisub = new Subject<void>();

    @ViewChild('messageInput') messageInput!: ElementRef;
    @ViewChild('messagesContent') messagesContent!: ElementRef;

    constructor(private chatService: AiService, private auth: AuthService) {}

    ngOnInit(): void {}

    sendMessage(): void {
        if (this.newMessageText.trim() === '') return;
        this.messages.push({ text: this.newMessageText, isPersonal: true });
        console.log({
            userMessage: this.newMessageText,
            userId: this.auth.getTokenUserID(),
        });

        this.chatService
            .getRoute('post', 'ai', 'chat-with-gemini', {
                message: this.newMessageText,
                userId: this.auth.getTokenUserID(),
            })
            .pipe(takeUntil(this.getAisub))
            .subscribe((data: any) => {
                console.log(data);
                this.messages.push({ text: data.response, isPersonal: false });
                this.newMessageText = '';
                this.scrollToBottom();
            });
    }
    scrollToBottom(): void {
        try {
            this.messagesContent.nativeElement.scrollTop =
                this.messagesContent.nativeElement.scrollHeight;
        } catch (err) {}
    }

    ngOnDestroy() {
        this.getAisub.unsubscribe();
    }
}

/*
async getAllDepartmentForDashboard() {
        await this.dept
            .getRoute('get', 'department', 'getAllDepartmentDropdown')
            .pipe(takeUntil(this.getDashboardSubscription))
            .subscribe((data: any) => {
                this.departmentList = data.data[0];
            });
    }
*/
