import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  protected readonly columns = [
    { id: 'firstName', title: 'First Name' },
    { id: 'lastName', title: 'Last Name' },
    { id: 'email', title: 'Email' },
  ];

  protected onComplete(result: unknown): void {
    console.log(result);
  }
}
