import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { passwordStrength, passwordsMatch } from '../../shared/validators/password';
import { AuthService } from '../../shared/auth.service';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-signup',
  styleUrl: './signup.css',
  templateUrl: './signup.html',
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  constructor(private auth: AuthService, private router: Router) {}

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

    this.auth.signup(this.form.value.firstName, this.form.value.lastName, this.form.value.dob, this.form.value.email, this.form.value.password).subscribe((success) => {
      if (success) {
        this.router.navigateByUrl('/groups');
      } else {
        this.form.get('email')?.setErrors({signupFailed: true})
        this.form.get('email')?.setValue('');
      }
    });
  }
}
