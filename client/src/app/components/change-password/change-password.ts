import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordStrength, passwordsMatch } from '../../shared/validators/password';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-change-password',
  styleUrl: './change-password.css',
  templateUrl: './change-password.html',
})
export class ChangePasswordComponent {
  showCurrent: boolean = false;
  showNew: boolean = false;
  showConfirm: boolean = false;

  private fb = inject(FormBuilder);

  form = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, passwordStrength]],
    confirmNewPassword: ['', Validators.required]
  }, { validators: passwordsMatch('newPassword', 'confirmNewPassword') });

  toggle(field: 'current' | 'new' | 'confirm') {
    if (field === 'current') this.showCurrent = !this.showCurrent;
    else if (field === 'new') this.showNew = !this.showNew;
    else this.showConfirm = !this.showConfirm;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('change password', this.form.value);
    // TODO: call AuthService.changePassword(...)
  }
}
