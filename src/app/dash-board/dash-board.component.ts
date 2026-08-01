import { Component, OnInit } from '@angular/core';
import { DashBoardService } from './dash-board.service';
import { Data } from '../interface/data.interfaces';


@Component({
  selector: 'app-dash-board',
  templateUrl: './dash-board.component.html',
  styleUrls: []
})
export class DashBoardComponent implements OnInit {
  isSidebarActive = false;
  selectedIndex = 0;



  constructor(
    private dataService: DashBoardService,
  ){}

  ngOnInit():void {
    this.isSidebarActive = localStorage.getItem('sidebar') === 'true';
  
  }

 

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
      localStorage.setItem('sidebar', this.isSidebarActive.toString());

  }

  selectItem(index: number) {
    this.selectedIndex = index;
  }
}
