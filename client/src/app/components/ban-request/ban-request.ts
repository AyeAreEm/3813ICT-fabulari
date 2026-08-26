import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-ban-request',
  styleUrl: './ban-request.css',
  templateUrl: './ban-request.html',
})
export class BanRequestComponent {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    userToBan: ['', Validators.required],
    requestFrom: ['Jane Doe', Validators.required], // TODO: prefill from AuthService.currentUser
    reason: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('ban request', this.form.value);
    // TODO: AdminService.requestPlatformBan(...)
  }
}
