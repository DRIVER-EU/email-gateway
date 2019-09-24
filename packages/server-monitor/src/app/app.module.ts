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
import { MatButtonModule} from '@angular/material/button';
import { MatCheckboxModule} from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { LogViewerComponent } from './log-viewer/log-viewer.component';
import { UserManagementComponent } from './user-management/user-management.component';


const config: SocketIoConfig = { url: 'http://localhost:9996', options: {}};

@NgModule({
  declarations: [
    AppComponent,
    NavigationbarComponent,
    SendTestMailComponent,
    LogViewerComponent,
    UserManagementComponent
  ],
  imports: [
    BrowserAnimationsModule, MatButtonModule, MatCheckboxModule, MatListModule,
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
