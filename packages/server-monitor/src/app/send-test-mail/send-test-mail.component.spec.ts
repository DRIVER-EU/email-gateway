import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendTestMailComponent } from './send-test-mail.component';

describe('SendTestMailComponent', () => {
  let component: SendTestMailComponent;
  let fixture: ComponentFixture<SendTestMailComponent>;

  beforeEach(async(() => {
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
