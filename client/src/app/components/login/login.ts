import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../shared/auth.service';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class LoginComponent {
  showPassword: boolean = false;

  private fb = inject(FormBuilder);
  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  })

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.auth.login(this.form.value.email, this.form.value.password).subscribe((success) => {
      if (success) {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/groups';
        this.router.navigateByUrl(returnUrl);
      } else {
        this.form.get('email')?.setErrors({invalid: true})
        this.form.get('password')?.setErrors({invalid: true})
        this.form.get('email')?.setValue('');
        this.form.get('password')?.setValue('');
      }
    });
  }
}
