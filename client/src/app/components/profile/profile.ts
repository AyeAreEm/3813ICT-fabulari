import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

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

  // TODO: prefill via resolver/service with the logged-in user's data
  form = this.fb.group({
    firstName: ['Jane', Validators.required],
    lastName: ['Doe', Validators.required],
    dob: ['1992-04-12', Validators.required],
    email: [{ value: 'jane.doe@email.com', disabled: true }]
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
