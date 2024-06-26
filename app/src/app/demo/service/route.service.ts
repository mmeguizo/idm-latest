import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConnectionService } from './connection.service';
import { AuthService } from './auth.service';

@Injectable()
export class RouteService {
    public authToken;
    public options;

    constructor(
        private http: HttpClient,
        public auth: AuthService,
        public cs: ConnectionService
    ) {}

    loadToken() {
        const token = localStorage.getItem('token');
        this.authToken = token;
    }

    createAuthenticationHeaders() {
        this.loadToken();
        this.options = new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'image/jpeg',
            authorization: this.authToken,
        });
    }

    getRoute(endpoint: any, model?: any, apiName?: any, data?: any) {
        console.log('getRoute', { endpoint, model, apiName, data });
        this.createAuthenticationHeaders();
        const url = `${this.cs.domain}/${model}/${apiName}`;
        return this.http.request(endpoint, url, {
            body: data,
            headers: this.options,
        });
    }
}
