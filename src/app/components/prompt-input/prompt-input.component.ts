// prompt-input.component.ts
import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-prompt-input',
  template: `
    <form [formGroup]="promptForm">
      <textarea formControlName="prompt" rows="5" cols="50"></textarea>
      <div *ngIf="promptControl.invalid && !promptControl.untouched">
        <small *ngIf="promptControl.errors?.required">Prompt is required.</small>
        <small *ngIf="promptControl.errors?.maxlength">
          Prompt cannot exceed {{ promptControl.errors?.['maxlength']?.requiredLength
          }} characters.
        </small>
        <small *ngIf="promptControl.errors?.pattern">
          Only alphanumeric characters and basic punctuation are allowed.
        </small>
      </div>
      <button [disabled]="promptForm.invalid" (click)="onSubmit()">
        Submit
      </button>
    </form>
  `,
  styles: [],
  imports: [
    ReactiveFormsModule
  ]
})
export class PromptInputComponent implements OnInit {
  public promptForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.promptForm = this.fb.group({
      prompt: new FormControl('', [
        Validators.required,
        Validators.maxLength(500),
        Validators.pattern('^[a-zA-Z0-9 .,!?()-]*$'),
      ]),
    });
  }

  public get promptControl(): FormControl {
    return this.promptForm.get('prompt') as FormControl;
  }

  onSubmit() {
    if (this.promptForm.valid) {
      console.log('Safe submitted value:', this.promptForm.value.prompt);
    }
  }
  public promptControlAccessor!: FormControl;

  ngOnInit(): void {
    this.promptControlAccessor = this.promptForm.get('prompt') as FormControl;

  }
}
