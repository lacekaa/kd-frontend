import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-explanation',
  templateUrl: './explanation.component.html',
  styleUrls: ['./explanation.component.css']
})
export class ExplanationComponent {
  constructor(private router: Router) {}

  navigateToTyping(): void {
    this.router.navigate(['/typing-area']);
  }
}

