import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationbarComponent } from './navigationbar/navigationbar.component';
import { SendTestMailComponent } from './send-test-mail/send-test-mail.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { LogViewerComponent } from './log-viewer/log-viewer.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { ServerStatusComponent } from './server-status/server-status.component';
import { environment } from '../environments/environment';
import { MaterialModule} from './../material/material.module';

import { SendSimulationEntityPostComponent } from './send-simulation-entity-post/send-simulation-entity-post.component';

const config: SocketIoConfig = { url: environment.notificationUrl , options: {}};

@NgModule({
  declarations: [
    AppComponent,
    NavigationbarComponent,
    SendTestMailComponent,
    LogViewerComponent,
    UserManagementComponent,
    ServerStatusComponent,
    SendSimulationEntityPostComponent
  ],
  imports: [
    BrowserAnimationsModule, MaterialModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule ,
    ReactiveFormsModule,
    HttpClientModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
