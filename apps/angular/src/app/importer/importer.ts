import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import '@updog/data-editor-wc';
import type { DataEditorColumn, DataEditorResult, UpdogEditorElement } from '@updog/data-editor-wc';

@Component({
  selector: 'app-importer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './importer.html',
  styleUrl: './importer.css',
})
export class ImporterComponent {
  readonly apiKey = input.required<string>();
  readonly columns = input.required<DataEditorColumn[]>();
  readonly primaryKey = input.required<string>();
  readonly complete = output<DataEditorResult>();

  private readonly editorRef = viewChild.required<ElementRef<UpdogEditorElement>>('editor');

  constructor() {
    effect((onCleanup) => {
      const el = this.editorRef().nativeElement;
      el.configure({
        apiKey: this.apiKey(),
        columns: this.columns(),
        primaryKey: this.primaryKey(),
        onComplete: (result) => {
          this.complete.emit(result);
          el.hide();
        },
      });
      const onClose = () => el.hide();
      el.addEventListener('close', onClose);
      onCleanup(() => el.removeEventListener('close', onClose));
    });
  }

  open(): void {
    this.editorRef().nativeElement.show();
  }
}
