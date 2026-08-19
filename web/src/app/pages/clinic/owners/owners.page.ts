import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, EmptyStateComponent, RouterLink],
  template: `
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-display text-2xl font-semibold">{{ 'owners.title' | translate }}</h1>
        <p class="text-sm text-slate-500">{{ 'owners.subtitle' | translate }}</p>
      </div>
      <button type="button" class="btn-primary" (click)="open = true">{{ 'owners.new' | translate }}</button>
    </div>
    <div class="card mt-6 overflow-hidden p-0">
      <div class="border-b border-slate-200 p-4 dark:border-white/10">
        <input class="input" [placeholder]="'common.search' | translate" (input)="q.set($any($event.target).value); load()" />
      </div>
      @if (rows().length === 0) {
        <empty-state [title]="'owners.empty' | translate" />
      } @else {
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-white/5">
              <tr>
                <th class="px-4 py-3">{{ 'owners.name' | translate }}</th>
                <th class="px-4 py-3">{{ 'owners.email' | translate }}</th>
                <th class="px-4 py-3">{{ 'owners.phone' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (o of rows(); track o.id) {
                <tr class="border-t border-slate-100 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5">
                  <td class="px-4 py-3 font-medium"><a [routerLink]="['/pets']" class="hover:text-brand-700">{{ o.firstName }} {{ o.lastName }}</a></td>
                  <td class="px-4 py-3">{{ o.email }}</td>
                  <td class="px-4 py-3">{{ o.phone }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
    @if (open) {
      <div class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" (click)="open=false">
        <form class="card w-full max-w-lg space-y-3" (click)="$event.stopPropagation()" [formGroup]="form" (ngSubmit)="save()">
          <h2 class="font-display text-lg font-semibold">{{ 'owners.new' | translate }}</h2>
          <div class="grid gap-3 sm:grid-cols-2">
            <input class="input" formControlName="firstName" [placeholder]="'owners.firstName' | translate" />
            <input class="input" formControlName="lastName" [placeholder]="'owners.lastName' | translate" />
          </div>
          <input class="input" formControlName="email" placeholder="Email" />
          <input class="input" formControlName="phone" [placeholder]="'owners.phone' | translate" />
          <div class="flex justify-end gap-2">
            <button type="button" class="btn-secondary" (click)="open=false">{{ 'common.cancel' | translate }}</button>
            <button class="btn-primary" [disabled]="form.invalid">{{ 'common.save' | translate }}</button>
          </div>
        </form>
      </div>
    }
  `
})
export class OwnersPage implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  rows = signal<any[]>([]);
  q = signal('');
  open = false;
  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['']
  });

  ngOnInit() { this.load(); }

  load() {
    this.api.get<{ content: any[] }>('/owners', { q: this.q(), page: 0, size: 50 }).subscribe(r => this.rows.set(r.content || []));
  }

  save() {
    this.api.post('/owners', this.form.value).subscribe({
      next: () => { this.toast.show('common.saved'); this.open = false; this.form.reset(); this.load(); },
      error: () => this.toast.show('common.error', true)
    });
  }
}
