import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <h1 class="font-display text-2xl font-semibold">{{ 'messages.title' | translate }}</h1>
    <p class="mt-1 text-sm text-slate-500">{{ 'messages.disclaimer' | translate }}</p>
    <div class="mt-6 grid gap-4 lg:grid-cols-3">
      <div class="card space-y-2 p-2">
        @for (c of convos(); track c.id) {
          <button type="button" class="w-full rounded-xl px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-white/5" (click)="select(c)">
            <p class="font-medium">{{ c.ownerName || c.subject || ('common.conversation' | translate) }}</p>
            <p class="truncate text-xs text-slate-500">{{ c.lastMessage }}</p>
          </button>
        }
      </div>
      <div class="card flex min-h-96 flex-col lg:col-span-2">
        <div class="flex-1 space-y-2 overflow-y-auto">
          @for (m of messages(); track m.id) {
            <div class="rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-white/5">
              <p class="text-xs text-slate-400">{{ m.senderName }} · {{ m.createdAt | date:'short' }}</p>
              {{ m.body }}
            </div>
          }
        </div>
        <form class="mt-3 flex gap-2" (ngSubmit)="send()">
          <input class="input" [(ngModel)]="draft" name="draft" />
          <button class="btn-primary">{{ 'messages.send' | translate }}</button>
        </form>
      </div>
    </div>
  `
})
export class MessagesPage implements OnInit {
  private api = inject(ApiService);
  convos = signal<any[]>([]);
  messages = signal<any[]>([]);
  current?: any;
  draft = '';

  ngOnInit() {
    this.api.get<any[]>('/messages').subscribe(c => this.convos.set(c));
  }

  select(c: any) {
    this.current = c;
    this.api.get<any[]>(`/messages/${c.id}`).subscribe(m => this.messages.set(m));
  }

  send() {
    if (!this.current || !this.draft) return;
    this.api.post(`/messages/${this.current.id}`, { body: this.draft }).subscribe(() => {
      this.draft = '';
      this.select(this.current);
    });
  }
}
