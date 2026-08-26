import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { passwordStrength, passwordsMatch } from '../../shared/validators/password';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-signup',
  styleUrl: './signup.css',
  templateUrl: './signup.html',
})
export class SignupComponent {
  private fb = inject(FormBuilder);

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dob: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordStrength]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordsMatch('password', 'confirmPassword') });


  toggle(field: 'password' | 'confirm') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirm') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log('signup', this.form.value);
  }
}
