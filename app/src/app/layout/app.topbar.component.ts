import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { LayoutService } from './service/app.layout.service';
import { AuthService } from '../demo/service/auth.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DomSanitizer } from '@angular/platform-browser';
import { FileService } from '../demo/service/file.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UserService } from '../demo/service/user.service';
import { FormBuilder, Validators } from '@angular/forms';
@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    styles: `
   ::ng-deep .p-button.p-button-icon-only {
    width: 2rem !important;
}


.display-photo {
  height: 150px;
  width: 150px;
  border: 2px solid #eee;
  border-radius: 50%;
  background-color: #ccc;
  background-size: cover;
  background-position: center;
  margin: auto;
position: relative;
}

.display-photo:hover::after {
    content: "+";
    color: white;
    background-color: green;
    position: absolute;
    top: 0;
    left: 0;
    font-size: 3em;
    border-radius: 50%;
    opacity: 0.7;
    width: 100%;
    height: 100%;
    transition: opacity 0.2s ease-in-out;
    display: flex;
    justify-content: center;
    align-items: center;
}

.display-photo:hover {
  opacity: 0.8; /* Slightly dim image on hover */
  transition: opacity 0.2s ease-in-out; /* Smooth transition */
}

.rounded-full{
    border-radius: 9999px;
    height: 45px;
}

.d-none {
  display: none !important;
}


.footer-button {
   justify-content: center;
}

 ::ng-deep .p-menuitem-link {
    padding: 10% !important;
}
::ng-deep .p-menubar .p-submenu-list {
 width: 8.5rem;
}

.p-element{
    margin-top: 3px;
}
.rounded-full {
    height: 38px;
}

::ng-deep .p-menubar {
    padding: 0rem !important;
}

    `,
})
export class AppTopBarComponent implements OnInit {
    private getSubscription = new Subject<void>();
    userData: any;
    public form: any;
    id: string;
    elEventListenerActive: boolean;
    items!: MenuItem[];
    Listitems!: MenuItem[];
    dangerousUrl: any;
    password!: string;
    email!: string;
    username!: string;
    confirmPassword!: string;
    public profile_pic: string;
    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    visible: boolean = false;
    logout: boolean = false;

    ref: DynamicDialogRef | undefined;
    name: string;

    passwordNotMatch: boolean = true;

    constructor(
        public layoutService: LayoutService,
        public auth: AuthService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        public dialogService: DialogService,
        private sanitizer: DomSanitizer,
        public file: FileService,
        public user: UserService,
        public formBuilder: FormBuilder
    ) {
        this.name = this.auth.getTokenUsername() || '';
        this.profile_pic = this.auth.getUserProfilePic() || 'no-photo.png';
    }

    ngOnInit() {
        this.id = this.auth.getTokenUserID() || '';
        this.Listitems = [
            {
                // icon: 'pi pi-fw pi-cog',
                items: [
                    {
                        label: 'Update',
                        icon: 'pi pi-user-edit',
                        command: () => {
                            this.visible = true;
                        },
                    },
                    {
                        label: 'Logout',
                        icon: 'pi pi-fw pi-sign-in',
                        command: () => {
                            this.logout = true;
                        },
                    },
                ],
            },
            // { separator: true },
        ];

        this.getUserData();
        this.dangerousUrl = this.sanitizer.bypassSecurityTrustUrl(
            this.auth.domain + '/images/' + this.profile_pic || 'no-photo.png'
        );
        this.createForm();
    }

    createForm() {
        this.form = this.formBuilder.group({
            firstname: ['', [Validators.required, Validators.required]],
            lastname: ['', [Validators.required, Validators.required]],
            username: ['', [Validators.required]],
            email: ['', [Validators.required]],
            old_password: ['', [Validators.required]],
            password: ['', [Validators.required]],
            confirmPassword: ['', [Validators.required]],
        });
    }

    kickout() {
        this.auth.logout();
    }

    getUserData() {
        this.user
            .fetch('get', 'users', 'profile', this.id)
            .pipe(takeUntil(this.getSubscription))
            .subscribe((data: any) => {
                this.form = this.formBuilder.group({
                    firstname: [data.user.firstname, [Validators.required]],
                    lastname: [data.user.lastname, [Validators.required]],
                    username: [data.user.username, [Validators.required]],
                    email: [data.user.email, [Validators.required]],
                    password: ['', [Validators.required]],
                    old_password: ['', [Validators.required]],
                    confirmPassword: ['', [Validators.required]],
                });
            });
    }

    confirm2(event: any) {
        this.confirmationService.confirm({
            key: 'confirm2',
            target: event.target || new EventTarget(),
            message: 'Are you sure that you want to logout?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.auth.logout();
            },
            reject: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thanks',
                    detail: 'Thanks for staying',
                });
            },
        });
    }

    updates(form: any) {
        // this.confirmationService.

        form.value.id = this.id;
        form.value.profile_pic = this.profile_pic;
        let data = form.value;

        if (form.value.confirmPassword !== form.value.password) {
            this.passwordNotMatch = true;

            return this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Passwords do not match',
            });
        }

        if (
            form.value.firstname == null ||
            (!form.value.firstname && !form.value.lastname) ||
            form.value.lastname == null
        ) {
            return this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'First Name and Last Name are required',
            });
        }

        console.log('updates', data);
        console.log('updates', form.value.lastname);
        console.log('updates', !form.value.lastname);

        this.user
            .fetch('put', 'users', 'updateProfile', data)
            .pipe(takeUntil(this.getSubscription))
            .subscribe((data: any) => {
                if (data.success) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Done, Please Login Again',
                        detail: data.message,
                    });
                    this.visible = false;
                    setTimeout(() => {
                        this.auth.logout();
                    }, 2000);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: `Error updating ${this.name}`,
                        detail: data.message,
                    });
                }
            });
    }
    openFile(ev, id) {
        let file,
            el = document.getElementById(id);
        el.click();
        let handler = (fc) => {
            try {
                let fileList: any;
                let fd = new FormData();
                if (fc.target['files'][0]['name'] !== undefined) {
                    fileList = fc.target;
                    let file: File = fileList.files[0];
                    fd.append('avatar', file, file.name);
                    this.file
                        .addAvatar(fd)
                        .pipe(takeUntil(this.getSubscription))
                        .subscribe((data: any) => {
                            this.elEventListenerActive = false;
                            this.profile_pic = data.data.source;
                            el.removeEventListener('change', handler);
                        });
                } else {
                    // this.Product.image = '';
                    ev.target.innerHTML = 'Browse';
                    this.elEventListenerActive = false;
                    el.removeEventListener('change', handler);
                }
            } catch (e) {
                // this.Product.image = '';
                ev.target.innerHTML = 'Browse';
                this.elEventListenerActive = false;
                el.removeEventListener('change', handler);
            }
        };
        if (!this.elEventListenerActive) {
            el.addEventListener('change', handler);
            this.elEventListenerActive = true;
        }
    }
}
