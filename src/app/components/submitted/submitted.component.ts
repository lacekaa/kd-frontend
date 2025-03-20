// thank-you.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-submitted',
  standalone: true,
  template: `<h1>Thank you for submitting!</h1>`,
  styles: [`
       h1 {
         text-align: center;
         margin-top: 50px;
       }
     `]
})
export class SubmittedComponent {}
