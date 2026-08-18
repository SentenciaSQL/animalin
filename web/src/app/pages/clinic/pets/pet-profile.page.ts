import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from '../../../core/services/api.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { StatusBadgePipe } from '../../../shared/ui/status-badge.pipe';
import { Pet, TimelineEvent } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, EmptyStateComponent, StatusBadgePipe],
  template: `
    @if (pet(); as p) {
      <div class="mb-4 text-sm text-slate-500"><a routerLink="/pets" class="hover:text-brand-700">{{ 'nav.pets' | translate }}</a> / {{ p.name }}</div>
      <div class="card">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div class="grid h-20 w-20 place-items-center overflow-hidden rounded-3xl bg-brand-50 text-2xl font-bold text-brand-800">
            @if (p.photoUrl) { <img [src]="p.photoUrl" [alt]="p.name" class="h-full w-full object-cover" /> }
            @else { {{ p.name[0] }} }
          </div>
          <div class="flex-1">
            <h1 class="font-display text-2xl font-semibold">{{ p.name }}</h1>
            <p class="text-slate-500">{{ p.breed }} · {{ p.age || p.species }}</p>
            <p class="text-sm text-slate-500">
              {{ 'pets.owner' | translate }}: {{ p.ownerName }}
              · {{ p.weightKg }} kg
              · {{ 'pets.vet' | translate }}: {{ p.veterinarianName }}
            </p>
          </div>
          @if (auth.hasPermission('MEDICAL_RECORD_WRITE')) {
            <a class="btn-primary" [routerLink]="['/consultations/new']" [queryParams]="{ petId: p.id }">{{ 'consultations.new' | translate }}</a>
          }
        </div>
        @if (p.allergies) {
          <div class="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-200">⚠ {{ 'pets.allergies' | translate }}: {{ p.allergies }}</div>
        }
        @if (p.medicalConditions) {
          <div class="mt-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-500/10">⚠ {{ 'pets.conditions' | translate }}: {{ p.medicalConditions }}</div>
        }
      </div>
      <div class="mt-6 flex flex-wrap gap-2">
        @for (t of tabs; track t.id) {
          <button type="button" class="rounded-full px-4 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-brand-500"
                  [class.bg-brand-700]="tab===t.id" [class.text-white]="tab===t.id"
                  [class.bg-slate-100]="tab!==t.id" (click)="select(t.id)">{{ t.label | translate }}</button>
        }
      </div>
      @if (tab === 'timeline') {
        <div class="mt-4 space-y-3">
          @if (timeline().length === 0) { <empty-state [title]="'pets.empty' | translate" /> }
          @for (e of timeline(); track e.entityId + e.type) {
            <div class="card flex items-start gap-3">
              <div class="mt-1 h-2.5 w-2.5 rounded-full bg-brand-600"></div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-400">{{ e.type }} · {{ e.at | date:'medium' }} · {{ e.veterinarianName }}</p>
                <p class="font-medium">{{ e.title }}</p>
                <p class="text-sm text-slate-500">{{ e.summary }}</p>
              </div>
            </div>
          }
        </div>
      }
      @if (tab === 'vaccines') {
        <div class="mt-4 space-y-2">
          @for (v of vaccines(); track v.id) {
            <div class="card flex items-center justify-between">
              <div>
                <p class="font-medium">{{ v.vaccineName }}</p>
                <p class="text-sm text-slate-500">{{ v.appliedAt | date }}</p>
              </div>
              <span [class]="v.status | statusBadge">{{ v.status }}</span>
            </div>
          }
        </div>
      }
      @if (tab === 'treatments') {
        <div class="mt-4 space-y-2">
          @for (t of treatments(); track t.id) {
            <div class="card"><p class="font-medium">{{ t.name }}</p><p class="text-sm text-slate-500">{{ t.status }} · {{ t.startDate }}</p></div>
          }
        </div>
      }
      @if (tab === 'prescriptions') {
        <div class="mt-4 space-y-2">
          @for (rx of prescriptions(); track rx.id) {
            <div class="card flex items-center justify-between">
              <p>{{ rx.issuedAt | date }} · {{ rx.notes }}</p>
              <a class="btn-secondary text-xs" [href]="pdf(rx.id)" target="_blank">PDF</a>
            </div>
          }
        </div>
      }
    }
  `
})
export class PetProfilePage implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);
  pet = signal<Pet | null>(null);
  timeline = signal<TimelineEvent[]>([]);
  vaccines = signal<any[]>([]);
  treatments = signal<any[]>([]);
  prescriptions = signal<any[]>([]);
  tab = 'timeline';
  tabs = [
    { id: 'timeline', label: 'pets.tabs.timeline' },
    { id: 'vaccines', label: 'pets.tabs.vaccines' },
    { id: 'treatments', label: 'pets.tabs.treatments' },
    { id: 'prescriptions', label: 'pets.tabs.prescriptions' }
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.api.get<Pet>(`/pets/${id}`).subscribe(p => this.pet.set(p));
    this.select('timeline');
  }

  select(tab: string) {
    this.tab = tab;
    const id = this.route.snapshot.paramMap.get('id');
    if (tab === 'timeline') this.api.get<TimelineEvent[]>(`/pets/${id}/timeline`).subscribe(t => this.timeline.set(t));
    if (tab === 'vaccines') this.api.get<any[]>(`/pets/${id}/vaccinations`).subscribe(v => this.vaccines.set(v));
    if (tab === 'treatments') this.api.get<any[]>(`/pets/${id}/treatments`).subscribe(v => this.treatments.set(v));
    if (tab === 'prescriptions') this.api.get<any[]>(`/pets/${id}/prescriptions`).subscribe(v => this.prescriptions.set(v));
  }

  pdf(id: number) {
    return `/api/v1/prescriptions/${id}/pdf`;
  }
}
