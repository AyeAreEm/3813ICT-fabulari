import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  avatarPreview: string | null = null;

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  form = this.fb.group({
    firstName: [this.auth.currentUser?.firstName, Validators.required],
    lastName: [this.auth.currentUser?.lastName, Validators.required],
    dob: [this.auth.currentUser?.dob, Validators.required],
    email: [{ value: this.auth.currentUser?.email, disabled: true }]
  });

    onAvatarSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => (this.avatarPreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('profile save', this.form.getRawValue(), this.avatarPreview);
    // TODO: call UserService.updateProfile(...)
  }
}
