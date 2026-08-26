import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { ProfileComponent } from './components/profile/profile';
import { ChangePasswordComponent } from './components/change-password/change-password';
import { BrowseGroupsComponent } from './components/browse-groups/browse-groups';
import { GroupDetailsComponent } from './components/group-details/group-details';
import { RoomComponent } from './components/room/room';
import { GroupRequestsComponent } from './components/group-requests/group-requests';
import { KickRequestComponent } from './components/kick-request/kick-request';
import { BanRequestComponent } from './components/ban-request/ban-request';
import { CreateGroupRequestsComponent } from './components/create-group-requests/create-group-requests';
import { DeleteGroupRequestsComponent } from './components/delete-group-requests/delete-group-requests';
import { BanRequestsComponent } from './components/ban-requests/ban-requests';
import { AdminLogsComponent } from './components/admin-logs/admin-logs';
import { authGuard } from './shared/auth.guard';
import { superAdminGuard } from './shared/super-admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [authGuard] },
  { path: 'groups', component: BrowseGroupsComponent, canActivate: [authGuard] },
  { path: 'groups/:id', component: GroupDetailsComponent, canActivate: [authGuard] },
  { path: 'groups/:id/rooms/:roomId', component: RoomComponent, canActivate: [authGuard] },
  { path: 'groups/:id/requests', component: GroupRequestsComponent, canActivate: [authGuard] },
  { path: 'groups/:id/kick-request', component: KickRequestComponent, canActivate: [authGuard] },
  { path: 'ban-request', component: BanRequestComponent, canActivate: [authGuard] },
  { path: 'admin', component: CreateGroupRequestsComponent, canActivate: [superAdminGuard] },
  { path: 'admin/create-requests', component: CreateGroupRequestsComponent, canActivate: [superAdminGuard] },
  { path: 'admin/delete-requests', component: DeleteGroupRequestsComponent, canActivate: [superAdminGuard] },
  { path: 'admin/ban-requests', component: BanRequestsComponent, canActivate: [superAdminGuard] },
  { path: 'admin/logs', component: AdminLogsComponent, canActivate: [superAdminGuard] },
];
