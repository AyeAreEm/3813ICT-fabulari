import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../shared/auth.service';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-profile',
  styleUrl: './profile.css',
  templateUrl: './profile.html',
})
export class ProfileComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  avatarPreview = signal<string | null>(null);

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    firstName: [this.auth.currentUser?.firstName, Validators.required],
    lastName: [this.auth.currentUser?.lastName, Validators.required],
    dob: [this.auth.currentUser?.dob, Validators.required],
    email: [{ value: this.auth.currentUser?.email, disabled: true }]
  });

  constructor() {
    if (this.auth.currentUser?.avatar) {
      this.avatarPreview.set(this.attachmentUrl(this.auth.currentUser.avatar));
    }
  }

  onAvatarSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => (this.avatarPreview.set(reader.result as string));
    reader.readAsDataURL(file);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.auth.updateProfile(this.auth.currentUser?.email!, this.form.getRawValue(), this.avatarPreview());
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl("/");
  }

  private readonly serverOrigin = 'http://localhost:3000';
  attachmentUrl(path: string): string {
    return this.serverOrigin + path;
  }
}
