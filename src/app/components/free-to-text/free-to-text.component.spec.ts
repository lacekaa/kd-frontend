import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeToTextComponent } from './free-to-text.component';

describe('FreeToTextComponent', () => {
  let component: FreeToTextComponent;
  let fixture: ComponentFixture<FreeToTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreeToTextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreeToTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
