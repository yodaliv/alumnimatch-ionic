import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActiveGuard } from '../_guards/active.guard';
import { AuthGuard } from '../_guards/auth.guard';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardPageModule),
        canActivate: [AuthGuard, ActiveGuard]
      },
      { path: 'nearme', 
        loadChildren: () => import('./nearme/nearme.module').then((m) => m.NearmePageModule),
        canActivate: [AuthGuard, ActiveGuard] 
      },
      { path: 'leaderboard',
       loadChildren: () => import('./leaderboard/leaderboard.module').then((m) => m.LeaderboardPageModule),
       canActivate: [AuthGuard, ActiveGuard]
      },
      { path: 'bulletinboard', loadChildren: () => import('./bulletinboard/bulletinboard.module').then((m) => m.BulletinboardPageModule) },
      { path: 'messages',
       loadChildren: () => import('./messages/messages.module').then((m) => m.MessagesPageModule),
        canActivate: [AuthGuard, ActiveGuard]
      },
      { path: 'friends', loadChildren: () => import('./friends/friends.module').then((m) => m.FriendsPageModule),
      canActivate: [AuthGuard, ActiveGuard]
      },
      { path: 'friends/:segment', loadChildren: () => import('./friends/friends.module').then((m) => m.FriendsPageModule),
      canActivate: [AuthGuard, ActiveGuard]
      },
      { path: 'privacy-requests',
        loadChildren: () => import('./privacy-requests/privacy-requests.module').then((m) => m.PrivacyRequestsPageModule),
        canActivate: [AuthGuard, ActiveGuard]
      },
      { path: 'search',
        loadChildren: () => import('./search/search.module').then((m) => m.SearchPageModule),
        canActivate: [AuthGuard, ActiveGuard]
      },
      { path: 'user',
        loadChildren: () => import('./user/user.module').then((m) => m.UserPageModule),
      },
      { path: 'invite-code',
        loadChildren: () => import('./invite-code/invite-code.module').then((m) => m.InviteCodePageModule),
        canActivate: [AuthGuard, ActiveGuard]},
    ],
  },
  { path: 'invite-code', loadChildren: './invite-code/invite-code.module#InviteCodePageModule' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
