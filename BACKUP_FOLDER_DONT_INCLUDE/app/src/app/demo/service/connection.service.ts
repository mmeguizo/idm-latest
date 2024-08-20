import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ConnectionService {
    //ngrok development
    // public domain: string = 'https://a51f-136-158-184-122.ngrok-free.app ';

    //localhost dev
    public domain: string = 'http://localhost:3000';

    // if deployed online
    // public domain: string = '';
}
