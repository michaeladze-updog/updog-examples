import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { DataEditorColumn, DataEditorResult } from '@updog/data-editor-wc';
import { ImporterComponent } from './importer/importer';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ImporterComponent],
  template: `
    <app-importer
      apiKey="YOUR_API_KEY"
      [columns]="columns"
      primaryKey="email"
      (complete)="onComplete($event)"
    />
  `,
})
export class App {
  protected readonly columns: DataEditorColumn[] = [
    { id: 'firstName', title: 'First Name' },
    { id: 'lastName', title: 'Last Name' },
    { id: 'email', title: 'Email' },
  ];

  protected onComplete(result: DataEditorResult): void {
    console.log(result);
  }
}
