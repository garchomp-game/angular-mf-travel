import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-template-name-modal',
  imports: [FormsModule],
  template: `
    <dialog #dialog class="modal" (close)="onDialogClose()">
      <div class="modal-box">
        <h3 class="font-bold text-lg">テンプレート名を入力</h3>
        <div class="form-control mt-4">
          <input
            #nameInput
            type="text"
            [(ngModel)]="templateName"
            (keydown.enter)="confirm()"
            placeholder="テンプレート名"
            class="input input-bordered w-full"
            id="template-name-input"
          />
        </div>
        <div class="modal-action">
          <button type="button" class="btn" (click)="cancel()" id="template-modal-cancel">
            キャンセル
          </button>
          <button
            type="button"
            class="btn btn-primary"
            [disabled]="!templateName.trim()"
            (click)="confirm()"
            id="template-modal-confirm"
          >
            保存
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  `,
})
export class TemplateNameModalComponent {
  @ViewChild('dialog') private readonly dialogRef!: ElementRef<HTMLDialogElement>;
  @ViewChild('nameInput') private readonly nameInputRef!: ElementRef<HTMLInputElement>;

  templateName = '';

  private resolve: ((value: string | null) => void) | null = null;

  /**
   * モーダルを開き、ユーザーの入力を待つ。
   * @param defaultName デフォルトのテンプレート名
   * @returns 確定時: テンプレート名、キャンセル時: null
   */
  open(defaultName: string): Promise<string | null> {
    this.templateName = defaultName;
    this.dialogRef.nativeElement.showModal();

    // フォーカスを少し遅延させて確実にモーダルが開いてから設定
    setTimeout(() => {
      this.nameInputRef?.nativeElement?.select();
    }, 50);

    return new Promise<string | null>((resolve) => {
      this.resolve = resolve;
    });
  }

  confirm(): void {
    const name = this.templateName.trim();
    if (!name) return;

    this.resolve?.(name);
    this.resolve = null;
    this.dialogRef.nativeElement.close();
  }

  cancel(): void {
    this.resolve?.(null);
    this.resolve = null;
    this.dialogRef.nativeElement.close();
  }

  /** backdrop クリックや ESC でダイアログが閉じた場合 */
  onDialogClose(): void {
    if (this.resolve) {
      this.resolve(null);
      this.resolve = null;
    }
  }
}
