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

  constructor(private router: Router) {
    this.generateRandomOrder();
  }

  private generateRandomOrder(): void {
    const allComponents = [...this.components, ...this.components]; // Each component twice
    this.randomOrder = allComponents.sort(() => Math.random() - 0.5); // Shuffle the array
  }

  getCurrentComponent(): string {
    return this.randomOrder[this.currentIndex];
  }

  moveToNextComponent(): void {
    this.currentIndex++;
    if (this.currentIndex < this.randomOrder.length) {
      this.router.navigate([`/${this.randomOrder[this.currentIndex]}`]);
    } else {
      console.log('Experiment completed!');
      // Handle end of experiment logic here
    }
  }

  incrementSubmissionCount(component: string): void {
    if (this.submissionCounts[component] !== undefined) {
      this.submissionCounts[component]++;
    }
  }

  getSubmissionCount(component: string): number {
    return this.submissionCounts[component] || 0;
  }

  isFirstAttempt(component: string): boolean {
    return this.getSubmissionCount(component) === 0;
  }
}
