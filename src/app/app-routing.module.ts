import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { ResourceComponent } from "./resource/resource.component";
import { LabComponent } from "./lab/lab.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "home/res/m",
    pathMatch: "full"
  },
  {
    path: "home",
    component: HomeComponent,
    children: [
      { path: "res", component: ResourceComponent },
      { path: "res/:id", component: ResourceComponent }
      // { path: "group/:id", component: GroupTabsComponent }
    ]
  },
  {
    path: "lab",
    component: LabComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
