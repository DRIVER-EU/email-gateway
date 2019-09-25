import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendSimulationEntityPostComponent } from './send-simulation-entity-post.component';

describe('SendSimulationEntityPostComponent', () => {
  let component: SendSimulationEntityPostComponent;
  let fixture: ComponentFixture<SendSimulationEntityPostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendSimulationEntityPostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendSimulationEntityPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
