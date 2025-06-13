import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { ExperimentManagerService } from '../../services/experiment-manager.service';

@Component({
  selector: 'app-explanation',
  templateUrl: './explanation.component.html',
  styleUrls: ['./explanation.component.css']
})
export class ExplanationComponent {
  constructor(
    private router: Router,
    private platformLocation: PlatformLocation,
    private experimentManager: ExperimentManagerService
  ) {
    // Prevent navigating back in the browser
    history.pushState(null, '', location.href);
    this.platformLocation.onPopState(() => {
      history.pushState(null, '', location.href);
    });
  }

  navigateToFirstComponent(): void {
    this.experimentManager.startExperiment(); // Start the experiment and navigate to the first component
  }
}
