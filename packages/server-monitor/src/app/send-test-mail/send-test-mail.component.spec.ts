import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SendTestMailComponent } from './send-test-mail.component';

describe('SendTestMailComponent', () => {
  let component: SendTestMailComponent;
  let fixture: ComponentFixture<SendTestMailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SendTestMailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendTestMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
