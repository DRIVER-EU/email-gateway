

import { SendTestMailComponent } from './send-test-mail/send-test-mail.component';
import { LogViewerComponent } from './log-viewer/log-viewer.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { ServerStatusComponent } from './server-status/server-status.component';
import { SendSimulationEntityPostComponent } from './send-simulation-entity-post/send-simulation-entity-post.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: 'sendMail', component: SendTestMailComponent },
  { path: 'notifications', component: LogViewerComponent },
  { path: 'usermanagement', component: UserManagementComponent},
  { path: 'serverstatus', component: ServerStatusComponent },
  { path: 'sendsimentitypost', component: SendSimulationEntityPostComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
