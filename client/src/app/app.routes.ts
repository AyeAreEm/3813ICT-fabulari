import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { ProfileComponent } from './components/profile/profile';
import { ChangePasswordComponent } from './components/change-password/change-password';
import { BrowseGroupsComponent } from './components/browse-groups/browse-groups';
import { GroupDetailsComponent } from './components/group-details/group-details';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'groups', component: BrowseGroupsComponent },
  { path: 'groups/:id', component: GroupDetailsComponent },
];
