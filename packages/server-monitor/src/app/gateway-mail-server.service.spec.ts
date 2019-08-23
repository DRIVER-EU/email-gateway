import { TestBed } from '@angular/core/testing';

import { GatewayMailServerService } from './gateway-mail-server.service';

describe('GatewayMailServerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GatewayMailServerService = TestBed.get(GatewayMailServerService);
    expect(service).toBeTruthy();
  });
});
