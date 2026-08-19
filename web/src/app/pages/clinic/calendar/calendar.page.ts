import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Appointment, PageResponse, Pet } from '../../../core/models';
import { StatusBadgePipe } from '../../../shared/ui/status-badge.pipe';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, StatusBadgePipe, EmptyStateComponent],
  template: `
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl font-semibold">{{ 'calendar.title' | translate }}</h1>
        <p class="mt-1 text-sm text-slate-500">{{ 'calendar.subtitle' | translate }}</p>
      </div>
      <button class="btn-primary" (click)="open=true">{{ 'calendar.new' | translate }}</button>
    </div>
    <div class="mt-6 space-y-2">
      @if (items().length === 0) { <empty-state [title]="'calendar.empty' | translate" /> }
      @for (a of items(); track a.id) {
        <div class="card flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="font-semibold">{{ a.petName }} · {{ a.ownerName }}</p>
            <p class="text-sm text-slate-500">{{ a.startAt | date:'short' }} · {{ a.serviceName }} · {{ a.veterinarianName }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span [class]="a.status | statusBadge">{{ a.status }}</span>
            @if (a.status === 'PENDING' || a.status === 'REQUESTED') {
              <button class="btn-secondary text-xs" (click)="status(a.id,'CONFIRMED')">{{ 'calendar.confirm' | translate }}</button>
            }
            @if (a.status === 'CONFIRMED') {
              <button class="btn-secondary text-xs" (click)="status(a.id,'ARRIVED')">{{ 'calendar.arrived' | translate }}</button>
            }
            @if (a.status === 'ARRIVED' || a.status === 'WAITING') {
              <button class="btn-primary text-xs" (click)="status(a.id,'IN_PROGRESS')">{{ 'calendar.start' | translate }}</button>
            }
            @if (a.status === 'IN_PROGRESS') {
              <button class="btn-primary text-xs" (click)="status(a.id,'COMPLETED')">{{ 'calendar.complete' | translate }}</button>
            }
          </div>
        </div>
      }
    </div>
    @if (open) {
      <div class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" (click)="open=false">
        <form class="card w-full max-w-lg space-y-3" (click)="$event.stopPropagation()" [formGroup]="form" (ngSubmit)="save()">
          <h2 class="font-display text-lg">{{ 'calendar.new' | translate }}</h2>
          <select class="input" formControlName="petId">
            @for (p of pets(); track p.id) { <option [value]="p.id">{{ p.name }}</option> }
          </select>
          <select class="input" formControlName="veterinarianId">
            @for (v of vets(); track v.id) { <option [value]="v.id">{{ v.fullName }}</option> }
          </select>
          <select class="input" formControlName="serviceId">
            @for (s of services(); track s.id) { <option [value]="s.id">{{ s.nameEs }}</option> }
          </select>
          <input class="input" type="datetime-local" formControlName="startAt" />
          <input class="input" formControlName="reason" [placeholder]="'calendar.reason' | translate" />
          <div class="flex justify-end gap-2">
            <button type="button" class="btn-secondary" (click)="open=false">{{ 'common.cancel' | translate }}</button>
            <button class="btn-primary">{{ 'common.save' | translate }}</button>
          </div>
        </form>
      </div>
    }
  `
})
export class CalendarPage implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  items = signal<Appointment[]>([]);
  pets = signal<Pet[]>([]);
  vets = signal<any[]>([]);
  services = signal<any[]>([]);
  open = false;
  form = this.fb.group({
    petId: ['', Validators.required],
    veterinarianId: ['', Validators.required],
    serviceId: ['', Validators.required],
    startAt: ['', Validators.required],
    reason: ['']
  });

  ngOnInit() {
    const from = new Date(); from.setDate(from.getDate() - 1);
    const to = new Date(); to.setDate(to.getDate() + 14);
    this.api.get<Appointment[]>('/appointments', { from: from.toISOString(), to: to.toISOString() }).subscribe(r => this.items.set(r));
    this.api.get<PageResponse<Pet>>('/pets', { size: 100 }).subscribe(r => this.pets.set(r.content || []));
    this.api.get<any[]>('/veterinarians').subscribe(r => this.vets.set(r));
    this.api.get<any[]>('/services').subscribe(r => this.services.set(r));
  }

  status(id: number, status: string) {
    this.api.post(`/appointments/${id}/status`, { status }).subscribe(() => this.ngOnInit());
  }

  save() {
    const v = this.form.getRawValue();
    this.api.post('/appointments', {
      petId: Number(v.petId),
      veterinarianId: Number(v.veterinarianId),
      serviceId: Number(v.serviceId),
      startAt: new Date(v.startAt!).toISOString(),
      reason: v.reason
    }).subscribe({
      next: () => { this.toast.show('common.saved'); this.open = false; this.ngOnInit(); },
      error: (e) => this.toast.show(e.error?.message || 'common.error', true)
    });
  }
}
