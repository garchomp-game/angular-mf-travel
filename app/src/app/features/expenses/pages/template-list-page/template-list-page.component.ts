import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ExpenseTemplate, ExpenseTemplateService } from '../../data/expense-template.service';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { SectionCardComponent } from '../../components/section-card/section-card.component';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { AuthService } from '../../../../core/auth.service';

@Component({
  selector: 'app-template-list-page',
  imports: [CommonModule, BottomNavComponent, SectionCardComponent, ThemeToggleComponent],
  template: `
    <main class="max-w-[720px] mx-auto p-4 grid gap-4">
      <div class="navbar bg-base-200 rounded-box shadow-sm border border-base-300">
        <div class="navbar-start">
          <h1 class="text-xl font-bold px-2">テンプレート管理</h1>
        </div>
        <div class="navbar-end gap-2">
          <app-theme-toggle />
          <button type="button" (click)="logout()" class="btn btn-outline btn-sm">
            ログアウト
          </button>
        </div>
      </div>

      <div *ngIf="notice" class="alert alert-info">
        <span>{{ notice }}</span>
      </div>

      @if (loading) {
        <p class="text-center py-8 opacity-60">読み込み中...</p>
      } @else {
        @if (templates.length === 0) {
          <app-section-card>
            <p class="text-center opacity-60 py-4">
              テンプレートはまだありません。<br />
              経費入力画面の「テンプレにも保存」や一覧の📋ボタンで追加できます。
            </p>
          </app-section-card>
        } @else {
          <div class="grid gap-3">
            @for (tpl of templates; track tpl.id) {
              <app-section-card>
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-base m-0 truncate">{{ tpl.name }}</h3>
                    <p class="text-sm opacity-70 m-0">{{ tpl.destination }}</p>
                    <p class="text-sm opacity-60 m-0">{{ tpl.payerDetail }}</p>
                    <div class="flex gap-1 mt-1">
                      <span
                        class="badge badge-sm"
                        [class]="tpl.isRoundTrip ? 'badge-info' : 'badge-success'"
                      >
                        {{ tpl.isRoundTrip ? '往復' : '片道' }}
                      </span>
                      <span *ngIf="tpl.category" class="badge badge-ghost badge-sm">
                        {{ tpl.category }}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    (click)="remove(tpl.id, tpl.name)"
                    class="btn btn-error btn-outline btn-sm"
                  >
                    削除
                  </button>
                </div>
              </app-section-card>
            }
          </div>
        }
      }

      <app-bottom-nav />
    </main>
  `,
})
export class TemplateListPageComponent implements OnInit {
  private readonly templateService = inject(ExpenseTemplateService);
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  templates: ExpenseTemplate[] = [];
  loading = false;
  notice = '';

  async ngOnInit(): Promise<void> {
    await this.loadTemplates();
  }

  async remove(id: string, name: string): Promise<void> {
    const accepted = window.confirm(`テンプレート「${name}」を削除しますか？`);
    if (!accepted) return;

    const success = await this.templateService.remove(id);
    if (success) {
      this.notice = `テンプレート「${name}」を削除しました。`;
      await this.loadTemplates();
    }
    this.cdr.detectChanges();
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
  }

  private async loadTemplates(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();
    this.templates = await this.templateService.list();
    this.loading = false;
    this.cdr.detectChanges();
  }
}
