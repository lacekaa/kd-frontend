import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {KeystrokeTrackerService} from './keystroke-tracker.service';

@Injectable({
  providedIn: 'root'
})
export class ExperimentManagerService {

  private conditions = [
    'typing-areaA', 'typing-areaB',
    'free-to-textC', 'free-to-textD',
    'image-to-promptE', 'image-to-promptF',
    'text-to-promptG', 'text-to-promptH'
  ];

  private latinSquareOrders: string[][] = [
    ['typing-area', 'typing-area', 'text-to-prompt', 'free-to-text', 'text-to-prompt', 'free-to-text', 'image-to-prompt', 'image-to-prompt'],
    ['typing-area', 'free-to-text', 'typing-area', 'free-to-text', 'text-to-prompt', 'image-to-prompt', 'text-to-prompt', 'image-to-prompt'],
    ['free-to-text', 'free-to-text', 'typing-area', 'image-to-prompt', 'typing-area', 'image-to-prompt', 'text-to-prompt', 'text-to-prompt'],
    ['free-to-text', 'image-to-prompt', 'free-to-text', 'image-to-prompt', 'typing-area', 'text-to-prompt', 'typing-area', 'text-to-prompt'],
    ['image-to-prompt', 'image-to-prompt', 'free-to-text', 'text-to-prompt', 'free-to-text', 'text-to-prompt', 'typing-area', 'typing-area'],
    ['image-to-prompt', 'text-to-prompt', 'image-to-prompt', 'text-to-prompt', 'free-to-text', 'typing-area', 'free-to-text', 'typing-area'],
    ['text-to-prompt', 'text-to-prompt', 'image-to-prompt', 'typing-area', 'image-to-prompt', 'typing-area', 'free-to-text', 'free-to-text'],
    ['text-to-prompt', 'typing-area', 'text-to-prompt', 'typing-area', 'image-to-prompt', 'free-to-text', 'image-to-prompt', 'free-to-text']
  ];

  private randomOrder: string[] = [];
  private currentIndex = 0;
  private hasStarted = false;
  private submissionCounts: Map<string, number> = new Map();

  constructor(private router: Router, private keystrokeTrackerService: KeystrokeTrackerService) {}

  private generateRandomOrder(): void {
    const randomIndex = Math.floor(Math.random() * this.latinSquareOrders.length);
    console.log(randomIndex);
    this.passLatinSquareType(randomIndex);
    this.randomOrder = this.latinSquareOrders[randomIndex];
  }

  startExperiment(): void {
    if (!this.hasStarted) {
      this.hasStarted = true;
      this.generateRandomOrder();
      this.router.navigate([`/${this.randomOrder[this.currentIndex]}`]);
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
      }
    }
  }

  incrementSubmissionCount(component: string): void {
    const currentCount = this.submissionCounts.get(component) || 0;
    this.submissionCounts.set(component, currentCount + 1);
    console.log(`Submission count for ${component} incremented.`);
  }

  getSubmissionCount(component: string): number {
    return this.submissionCounts.get(component) || 0;
  }

  isFirstAttempt(component: string): boolean {
    return (this.getSubmissionCount(component) === 0);
  }

  passLatinSquareType(index : number): void {
    this.keystrokeTrackerService.setLatinSquareType(index);
  }
}
