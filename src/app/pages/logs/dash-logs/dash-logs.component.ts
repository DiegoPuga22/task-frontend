import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { ChartModule } from 'primeng/chart';
import { LogService } from '../../../core/logs/log.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LogFilterPipe } from './log-filter.pipe';

@Component({
  selector: 'app-dash-logs',
  standalone: true,
  imports: [ChartModule, HeaderComponent, DecimalPipe, LogFilterPipe, FormsModule],
  templateUrl: './dash-logs.component.html',
  styleUrl: './dash-logs.component.css'
})
export class DashLogsComponent implements OnInit, AfterViewInit, OnDestroy {
  logData: string[] = [];
  statusCounts: { [key: string]: number } = {};
  totalLogs: number = 0;
  avgResponseTime: number = 0;
  minResponseTime: number = 0;
  maxResponseTime: number = 0;
  apiUsage: { [key: string]: number } = {};
  logsByService: { [key: string]: number } = {};
  logUserFilter: string = '';
  logStatusFilter: string = '';
  logTimeFilter: number | null = null;
  logDateFilter: string = '';

  @ViewChild('statusChart') statusChartRef!: ElementRef;
  @ViewChild('apiChart') apiChartRef!: ElementRef;
  @ViewChild('responseTimeChart') responseTimeChartRef!: ElementRef;
  @ViewChild('totalLogsChart') totalLogsChartRef!: ElementRef;
  private statusChart!: Chart;
  private apiChart!: Chart;
  private responseTimeChart!: Chart;
  private totalLogsChart!: Chart;
  private refreshInterval: any;

  logHistory: { timestamp: string, total: number }[] = [];

  constructor(
    private logService: LogService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchLogs();
    this.refreshInterval = setInterval(() => {
      this.fetchLogs();
    }, 60000);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeCharts();
    }
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private fetchLogs(): void {
    this.logService.getLogs().subscribe({
      next: (data) => {
        console.log('Respuesta de logs:', data);
        // Limitar la cantidad de logs procesados para evitar que el frontend se caiga
        this.logData = Array.isArray(data.logs) ? data.logs.slice(0, 5000000) : [];
        this.processLogs();
      },
      error: (err) => {
        this.logData = [];
        this.processLogs();
      }
    });
  }

  processLogs(): void {
    this.totalLogs = this.logData.length;
    let totalResponseTime = 0;
    let responseTimes: number[] = [];
    this.statusCounts = {};
    this.apiUsage = {};
    this.logsByService = {};
    this.minResponseTime = Infinity;
    this.maxResponseTime = -Infinity;
    this.avgResponseTime = 0;

    this.logData.forEach(logStr => {
      // Parsear el log si es string, o usarlo directamente si ya es objeto
      let log: any;
      if (typeof logStr === 'string') {
        try {
          log = JSON.parse(logStr);
        } catch {
          return; // Saltar logs malformados
        }
      } else {
        log = logStr;
      }
      const status = log.status;
      const time = log.response_time;
      const user = log.user;
      const timestamp = log.timestamp;
      // Si tienes campos como 'route' o 'service', agrégalos aquí
      // const route = log.route;
      // const service = log.service;

      if (status) {
        this.statusCounts[status] = (this.statusCounts[status] || 0) + 1;
      }
      if (typeof time === 'number') {
        totalResponseTime += time;
        responseTimes.push(time);
        this.minResponseTime = Math.min(this.minResponseTime, time);
        this.maxResponseTime = Math.max(this.maxResponseTime, time);
      }
      // Si tienes más campos para estadísticas, agrégalos aquí
    });

    this.avgResponseTime = responseTimes.length ? totalResponseTime / responseTimes.length : 0;
    if (responseTimes.length === 0) {
      this.minResponseTime = 0;
      this.maxResponseTime = 0;
    }

    const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    this.logHistory.push({ timestamp: now, total: this.totalLogs });

    if (this.logHistory.length > 10) {
      this.logHistory.shift();
    }

    if (isPlatformBrowser(this.platformId)) {
      if (this.statusChart) {
        this.statusChart.data.labels = Object.keys(this.statusCounts);
        this.statusChart.data.datasets[0].data = Object.values(this.statusCounts);
        this.statusChart.update();
      }
      if (this.apiChart) {
        this.apiChart.data.labels = Object.keys(this.apiUsage);
        this.apiChart.data.datasets[0].data = Object.values(this.apiUsage);
        this.apiChart.update();
      }
      if (this.responseTimeChart) {
        this.responseTimeChart.data.datasets[0].data = [this.avgResponseTime, this.minResponseTime, this.maxResponseTime];
        this.responseTimeChart.update();
      }
      if (this.totalLogsChart) {
        this.totalLogsChart.data.labels = this.logHistory.map(entry => entry.timestamp);
        this.totalLogsChart.data.datasets[0].data = this.logHistory.map(entry => entry.total);
        this.totalLogsChart.update();
      }
    }
  }

  initializeCharts(): void {
    if (!this.statusChartRef || !this.apiChartRef || !this.responseTimeChartRef || !this.totalLogsChartRef) {
      return;
    }
    const statusCtx = this.statusChartRef.nativeElement.getContext('2d');
    this.statusChart = new Chart(statusCtx, {
      type: 'pie',
      data: {
        labels: Object.keys(this.statusCounts),
        datasets: [{
          data: Object.values(this.statusCounts),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Distribución de Códigos de Estado' }
        }
      }
    });

    const apiCtx = this.apiChartRef.nativeElement.getContext('2d');
    this.apiChart = new Chart(apiCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(this.apiUsage),
        datasets: [{
          label: 'Llamadas a la API',
          data: Object.values(this.apiUsage),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
          borderColor: ['#E5556C', '#1E88E5', '#E6B800', '#3AA8A8', '#7B1FA2'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Uso de la API' }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Número de Llamadas' }
          },
          x: {
            title: { display: true, text: 'Rutas de la API' },
            ticks: {
              autoSkip: true,
              maxRotation: 45,
              minRotation: 45,
              maxTicksLimit: 10
            }
          }
        }
      }
    });

    const responseTimeCtx = this.responseTimeChartRef.nativeElement.getContext('2d');
    this.responseTimeChart = new Chart(responseTimeCtx, {
      type: 'bar',
      data: {
        labels: ['Promedio', 'Mínimo', 'Máximo'],
        datasets: [{
          label: 'Tiempo de Respuesta (segundos)',
          data: [this.avgResponseTime, this.minResponseTime, this.maxResponseTime],
          backgroundColor: ['#4BC0C0', '#FFCE56', '#FF6384'],
          borderColor: ['#3AA8A8', '#E6B800', '#E5556C'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Estadísticas de Tiempo de Respuesta' }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Tiempo (segundos)' },
            suggestedMax: this.maxResponseTime > 0 ? this.maxResponseTime * 1.2 : 1
          },
          x: {
            title: { display: true, text: 'Métricas' }
          }
        }
      }
    });

    const totalLogsCtx = this.totalLogsChartRef.nativeElement.getContext('2d');
    this.totalLogsChart = new Chart(totalLogsCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Total de Logs',
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: '#36A2EB',
          borderWidth: 2,
          fill: true,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Evolución del Total de Logs' }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Número de Logs' },
            suggestedMax: 100
          },
          x: {
            title: { display: true, text: 'Hora' }
          }
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/tasks/task-list']);
  }

  clearLogFilters() {
    this.logUserFilter = '';
    this.logStatusFilter = '';
    this.logTimeFilter = null;
    this.logDateFilter = '';
  }
}
