import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ExperimentManagerService {

  private components = ['typing-area', 'free-to-text', 'image-to-prompt', 'text-to-prompt'];
  private submissionCounts: { [key: string]: number } = {
    'typing-area': 0,
    'free-to-text': 0,
    'image-to-prompt': 0,
    'text-to-prompt': 0,
  };
  private randomOrder: string[] = [];
  private currentIndex = 0;
  private hasStarted = false; // Track if the experiment has started

  constructor(private router: Router) {
    this.generateRandomOrder();
  }

  private generateRandomOrder(): void {
    const allComponents = [...this.components, ...this.components]; // Duplicate each component
    for (let i = allComponents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Random index
      [allComponents[i], allComponents[j]] = [allComponents[j], allComponents[i]]; // Swap elements
    }
    this.randomOrder = allComponents;
  }

  startExperiment(): void {
    if (!this.hasStarted) {
      this.hasStarted = true;
      this.router.navigate([`/${this.randomOrder[this.currentIndex]}`]); // Navigate to the first component
    }
  }

  getCurrentComponent(): string {
    return this.randomOrder[this.currentIndex];
  }

  moveToNextComponent(): void {
    if (this.hasStarted) {
      this.currentIndex++;
      if (this.currentIndex < this.randomOrder.length) {
        this.router.navigate([`/${this.randomOrder[this.currentIndex]}`]);
      } else {
        this.router.navigate(['/thank-you']);
        console.log('Experiment completed!');
        // Handle end of experiment logic here
      }
    }
  }

  incrementSubmissionCount(component: string): void {
    if (this.submissionCounts[component] !== undefined) {
      this.submissionCounts[component]++;
      console.log(this.submissionCounts);
      console.log(`Submission count for ${component} incremented to ${this.submissionCounts[component]}`);
      console.log('random order is:', this.randomOrder)
    }
  }

  getSubmissionCount(component: string): number {
    return this.submissionCounts[component] || 0;
  }

  isFirstAttempt(component: string): boolean {
    return this.getSubmissionCount(component) === 0;
  }
}
