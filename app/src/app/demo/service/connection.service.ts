import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ConnectionService {
    //ngrok development
    // public domain: string = 'https://unduly-enjoyed-parrot.ngrok-free.app/';

    //localhost dev
    public domain: string = 'http://localhost:3000';

    // if deployed online
    //public domain: string = '';
}
