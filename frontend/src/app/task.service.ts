import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqService: WebRequestService) { }

  /* Send request to create list */
  createList(title: string) {
    return this.webReqService.post('lists', { title });
  }
}
