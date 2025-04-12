// root-redirect.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../demo/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RootRedirectGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.hasToken()) {
      const exp = this.authService.getUserTokenExp();
      const currentTime = Math.floor(Date.now() / 1000);

      if (exp >= currentTime) {
        // Optional: use user role to redirect to specific route
        const role = this.authService.getUserRole(); // You must implement this method
        switch (role) {
          case 'admin':
            this.router.navigate(['/admin']);
            break;
          case 'user':
            this.router.navigate(['/user']);
            break;
          case 'director':
            this.router.navigate(['/director']);
            break;
          case 'vice-president':
            this.router.navigate(['/vice-president']);
            break;
          case 'office-head':
            this.router.navigate(['/office-head']);
            break;
          default:
            this.router.navigate(['/template']);
            break;
        }
        return false;
      }
    }

    // If no token or expired
    this.router.navigate(['/login']);
    return false;
  }
}
