import {Component, ElementRef, ViewChild} from '@angular/core';
import {NgIf} from '@angular/common';
import {Router} from '@angular/router';
import {KeystrokeTrackerService} from '../../services/keystroke-tracker.service';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './register-user.component.html',
  styleUrl: './register-user.component.css'
})
export class RegisterUserComponent {
  @ViewChild('prolificId') prolificIdInput!: ElementRef<HTMLInputElement>;
  prolificId: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private keystrokeTrackerService: KeystrokeTrackerService) {
  }

  onProlificIdChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.prolificId = input.value;
  }

  validateProlificId(): boolean {
    const regex = /^[A-Za-z0-9]+$/;
    if (!regex.test(this.prolificId)) {
      this.errorMessage = 'wrong id';
      return false;
    } else {
      this.errorMessage = 'correct id';
      return true;
    }
  }

  submitProlificId() {
    if (this.validateProlificId()) {
      this.keystrokeTrackerService.setId(this.prolificId);
      // sessionStorage.setItem('submitted', 'true');
      this.router.navigate(['/typing-area']);
      console.log('Prolific ID:', this.prolificId);
    }
  }
}
