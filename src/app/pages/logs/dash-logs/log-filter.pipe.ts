import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'logFilter',
  standalone: true
})
export class LogFilterPipe implements PipeTransform {
  transform(logs: any[], user: string = '', status: string = '', time?: number, date?: string): any[] {
    if (!logs) return [];
    return logs.filter(log => {
      const userMatch = user ? (log.user || '').toLowerCase().includes(user.toLowerCase()) : true;
      const statusMatch = status ? (log.status || '').toString().toLowerCase().includes(status.toLowerCase()) : true;
  const timeMatch = (typeof time === 'number' && !isNaN(time)) ? (Number(log.response_time) === Number(time)) : true;
      let dateMatch = true;
      if (date) {
        // Asume que log.timestamp es string tipo 'YYYY-MM-DD ...'
        const logDate = (log.timestamp || '').substring(0, 10);
        dateMatch = logDate === date;
      }
      return userMatch && statusMatch && timeMatch && dateMatch;
    });
  }
}
