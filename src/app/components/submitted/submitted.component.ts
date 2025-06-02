// thank-you.component.ts
import {Component} from '@angular/core';
import {PlatformLocation} from '@angular/common';

@Component({
  selector: 'app-submitted',
  standalone: true,
  templateUrl: './submitted.component.html',
  styleUrl: './register-user.component.css'
})
export class SubmittedComponent {
  constructor(
    private platformLocation: PlatformLocation
  ) {
    history.pushState(null, '', location.href);
    this.platformLocation.onPopState(() => {
      history.pushState(null, '', location.href);
    });
  }
}
