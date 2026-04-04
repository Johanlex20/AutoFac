import { Component } from '@angular/core';

@Component({
  selector: 'app-dash-board',
  templateUrl: './dash-board.component.html',
  styleUrls: []
})
export class DashBoardComponent {
  isSidebarActive = false;
  selectedIndex = 0;

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }

  selectItem(index: number) {
    this.selectedIndex = index;
  }
}
