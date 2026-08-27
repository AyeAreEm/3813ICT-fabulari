import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/auth.service';

@Component({
  imports: [RouterLink],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class HomeComponent {
  auth = inject(AuthService);
  logoLink = this.auth.currentUser?.isSuperAdmin ? '/admin/create-requests' : '/groups';
}
