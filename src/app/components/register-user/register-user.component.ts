import {Component, ElementRef, ViewChild} from '@angular/core';
import {NgIf, PlatformLocation} from '@angular/common';
import {Router} from '@angular/router';
import {KeystrokeTrackerService} from '../../services/keystroke-tracker.service';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [NgIf],
  templateUrl: './register-user.component.html',
  styleUrl: './register-user.component.css',
})
export class RegisterUserComponent {
  @ViewChild('prolificId') prolificIdInput!: ElementRef<HTMLInputElement>;
  prolificId: string = '';
  frequency: string = '';
  errorMessage: string = '';
  inputMethod: string = '';

  constructor(
    private router: Router,
    private keystrokeTrackerService: KeystrokeTrackerService,
    private platformLocation: PlatformLocation
  ) {
    history.pushState(null, '', location.href);
    this.platformLocation.onPopState(() => {
      history.pushState(null, '', location.href);
    });
  }

  onProlificIdChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.prolificId = input.value;
  }

  onFrequencyChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.frequency = select.value;
  }

  onInputMethodChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.inputMethod = select.value;
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
    if (this.validateProlificId() && this.frequency && this.inputMethod) {
      if (this.inputMethod !== 'physical-keyboard'){
        window.location.href = 'https://app.prolific.com/submissions/complete?cc=C1IY0750';
        return;
      }
      this.keystrokeTrackerService.setId(this.prolificId);
      this.keystrokeTrackerService.setFrequency(this.frequency);
      this.keystrokeTrackerService.setInputMethod(this.inputMethod);
      console.log('Prolific ID:', this.prolificId);
      console.log('Frequency:', this.frequency);
      console.log('InputMethod:', this.inputMethod);
      this.router.navigate(['/explanation']);
    } else {
      this.errorMessage = 'Please fill in all fields.';
    }
  }
}
