import { SendTestMailComponent } from './send-test-mail/send-test-mail.component';
import { LogViewerComponent } from './log-viewer/log-viewer.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: 'sendMail', component: SendTestMailComponent },
  { path: 'notifications', component: LogViewerComponent },
  { path: 'usermanagement', component: UserManagementComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
