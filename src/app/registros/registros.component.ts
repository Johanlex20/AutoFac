import { Component, OnInit } from '@angular/core';
import { Data } from '../interface/data.interfaces';
import { DashBoardService } from '../dash-board/dash-board.service';

@Component({
  selector: 'app-registros',
  templateUrl: './registros.component.html',
  styleUrls: []
})
export class RegistrosComponent implements OnInit {
  
dataObj?:Data[];

  constructor(
    private dataService: DashBoardService,
  ){}

  ngOnInit():void {
    this.loadData();
  }

  loadData(){
    this.dataService.list()
    .subscribe(data =>{
      this.dataObj = data;
    });
  }
}
