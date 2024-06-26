import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConnectionService } from './connection.service';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
    providedIn: 'root',
})
export class FileService {
    public authToken;
    public options;

    constructor(
        public auth: AuthService,
        public cs: ConnectionService,
        private http: HttpClient
    ) {
        //this.getAllUsers();
    }

    createAuthenticationHeaders() {
        this.loadToken();
        this.options = new HttpHeaders({
            // 'Content-Type': 'application/json',
            Accept: 'image/jpeg',
            authorization: this.authToken,
        });
    }

    loadToken() {
        const token = localStorage.getItem('token');
        this.authToken = token;
    }

    addFile(form, id = null) {
        this.createAuthenticationHeaders();
        return this.http.post(
            this.cs.domain + `/fileupload/addFile/${id}`,
            form,
            { headers: this.options, responseType: 'json' }
        );
    }

    addAvatar(data) {
        this.createAuthenticationHeaders();
        return this.http.post(this.cs.domain + '/fileupload/addAvatar', data, {
            headers: this.options,
            responseType: 'json',
        });
    }

    deleteFile(data) {
        this.createAuthenticationHeaders();
        return this.http.put(this.cs.domain + '/fileupload/deleteFile', data, {
            headers: this.options,
            responseType: 'json',
        });
    }
    deleteFileObjective(data) {
        this.createAuthenticationHeaders();
        return this.http.put(
            this.cs.domain + '/fileupload/deleteFileObjective',
            data,
            {
                headers: this.options,
                responseType: 'json',
            }
        );
    }

    getAllFiles(id) {
        this.createAuthenticationHeaders();
        return this.http.get(this.cs.domain + `/fileupload/getAllFiles/${id}`, {
            headers: this.options,
            responseType: 'json',
        });
    }

    addMultipleFiles(id: string, objectiveIDforFile: string, files?: any) {
        this.createAuthenticationHeaders();
        console.log({ addMultipleFiles: files });
        const formData: FormData = new FormData();

        for (let file of files) {
            formData.append('files', file, file.name);
        }

        return this.http.post(
            this.cs.domain +
                `/fileupload/addMultipleFiles/${id}/${objectiveIDforFile}`,
            formData,
            { headers: this.options, responseType: 'json' }
        );
    }

    getAllFilesFromObjective(id: string, objectId: string) {
        this.createAuthenticationHeaders();
        return this.http.get(
            this.cs.domain +
                `/fileupload/getAllFilesFromObjective/${id}/${objectId}`,
            { headers: this.options, responseType: 'json' }
        );
    }
    getAllFilesHistoryFromObjectiveLoad(id: string, objectId: string) {
        this.createAuthenticationHeaders();
        return this.http.get(
            this.cs.domain +
                `/fileupload/getAllFilesHistoryFromObjectiveLoad/${id}/${objectId}`,
            { headers: this.options, responseType: 'json' }
        );
    }

    getRoute(endpoint, apiName, data) {
        this.createAuthenticationHeaders();
        if (endpoint == 'put') {
            return this.http.put(
                this.cs.domain + `/fileupload/${apiName}`,
                data,
                { headers: this.options }
            );
        } else if (endpoint == 'post') {
            return this.http.post(
                this.cs.domain + `/fileupload/${apiName}`,
                data,
                { headers: this.options }
            );
        } else {
            return this.http.get(this.cs.domain + `/fileupload/${apiName}`, {
                headers: this.options,
            });
        }
    }
}
