import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Member } from '../../shared/models';
import { MOCK_MEMBERS } from '../../shared/mock-data';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-kick-request',
  styleUrl: './kick-request.css',
  templateUrl: './kick-request.html',
})
export class KickRequestComponent implements OnInit {
  private fb = inject(FormBuilder);
  constructor(private route: ActivatedRoute) {}

  members: Member[] = MOCK_MEMBERS;
  groupId = '';

  form = this.fb.group({
    memberId: ['', Validators.required],
    reason: ['', Validators.required]
  });

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.members.length) {
      this.form.patchValue({ memberId: this.members[0].id });
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('kick request', this.groupId, this.form.value);
    // TODO: GroupService.requestKick(...)
  }
}
