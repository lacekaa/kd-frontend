import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextToPromptComponent } from './text-to-prompt.component';

describe('TextToPromptComponent', () => {
  let component: TextToPromptComponent;
  let fixture: ComponentFixture<TextToPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextToPromptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextToPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
