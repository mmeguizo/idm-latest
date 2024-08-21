import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpErrorResponse,
} from '@angular/common/http';
import { ConnectionService } from './connection.service';
import { AuthService } from './auth.service';
import { MessageService } from 'primeng/api';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class UserService {
    public authToken;
    public options;
    picture: HttpHeaders;

    constructor(
        public auth: AuthService,
        public cs: ConnectionService,
        private http: HttpClient,
        private messageService: MessageService
    ) {
        this.getAllUsers();
    }

    createAuthenticationHeaders() {
        this.loadToken();
        this.options = new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'image/jpeg',
            authorization: this.authToken,
        });
    }

    loadToken() {
        const token = localStorage.getItem('token');
        this.authToken = token;
    }

    getRoute(endpoint: any, model?: any, apiName?: any, data?: any) {
        this.createAuthenticationHeaders();
        let url = `${this.cs.domain}/${model}/${apiName}`;

        if (endpoint === 'get' && apiName === 'profile') {
            url = `${this.cs.domain}/${model}/${apiName}/${data}`;
        }

        const requestConfig = {
            body: data,
            headers: this.options,
        };

        return this.http.request(endpoint, url, requestConfig).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error(`API Error (${error.status}):`, error.error);
                if (error.status === 401 || error.status === 403) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'You are unauthorized!',
                    });
                    this.auth.logout();
                } else if (error.status === 500) {
                    // Internal server error Or Token Expired
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Internal server error Or Token Expired. Please try again later.',
                    });
                } else if (error.status === 404) {
                    // Not found error
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'The requested resource was not found.',
                    });
                } else {
                    // Other errors
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.error,
                    });
                }

                return throwError(error);
            })
        );
    }
    getAllUsers() {
        this.createAuthenticationHeaders();
        return this.http
            .get(this.cs.domain + '/users/getAllUser', {
                headers: this.options,
            })
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error(`API Error (${error.status}):`, error.error);
                    if (error.status === 401 || error.status === 403) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'You are unauthorized!',
                        });
                        this.auth.logout();
                    } else if (error.status === 500) {
                        // Internal server error Or Token Expired
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Internal server error Or Token Expired. Please try again later.',
                        });

                        this.auth.logout();
                    } else if (error.status === 404) {
                        // Not found error
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'The requested resource was not found.',
                        });
                    } else {
                        // Other errors
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.error,
                        });
                    }

                    return throwError(error);
                })
            );
    }

    getUserProfilePic(data) {
        this.createAuthenticationHeaders();
        this.picture = new HttpHeaders({
            // 'Accept': 'image/jpeg',
            'Content-Type': 'application/octet-stream',
            authorization: this.authToken,
        });
        return this.http
            .get(this.cs.domain + '/users/UserProfilePic/' + data, {
                headers: this.picture,
                responseType: 'blob',
            })
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error(`API Error (${error.status}):`, error.error);
                    if (error.status === 401 || error.status === 403) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'You are unauthorized!',
                        });
                        this.auth.logout();
                    } else if (error.status === 500) {
                        // Internal server error Or Token Expired
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Internal server error Or Token Expired. Please try again later.',
                        });

                        this.auth.logout();
                    } else if (error.status === 404) {
                        // Not found error
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'The requested resource was not found.',
                        });
                    } else {
                        // Other errors
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.error,
                        });
                    }

                    return throwError(error);
                })
            );
    }
}

/*
 getRoute(endpoint: any, model?: any, apiName?: any, data?: any) {
    console.log("getRoute", { endpoint, model, apiName, data });
    this.createAuthenticationHeaders();
    let url = `${this.cs.domain}/${model}/${apiName}`;
    if (endpoint == "get" && apiName === "profile") {
      url = `${this.cs.domain}/${model}/${apiName}/${data}`;
    }
    return this.http.request(endpoint, url, {
      body: data,
      headers: this.options,
    });
  }
*/
