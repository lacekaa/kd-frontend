import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageToPromptComponent } from './image-to-prompt.component';

describe('ImageToPromptComponent', () => {
  let component: ImageToPromptComponent;
  let fixture: ComponentFixture<ImageToPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageToPromptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageToPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
