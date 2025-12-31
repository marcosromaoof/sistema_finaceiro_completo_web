import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PatrimonyChartProps {
  data?: Array<{ date: string; value: number }>;
}

export function PatrimonyChart({ data }: PatrimonyChartProps) {
  const [period, setPeriod] = useState<'7D' | '30D' | '90D' | '1A'>('30D');
  // Mock data baseado no período selecionado
  const getMockData = () => {
    switch (period) {
      case '7D':
        return [
          { date: '24 Dez', value: 124000 },
          { date: '25 Dez', value: 124300 },
          { date: '26 Dez', value: 124600 },
          { date: '27 Dez', value: 124900 },
          { date: '28 Dez', value: 125100 },
          { date: '29 Dez', value: 125300 },
          { date: '30 Dez', value: 125430 },
        ];
      case '30D':
        return [
          { date: '01 Dez', value: 115000 },
          { date: '05 Dez', value: 117500 },
          { date: '10 Dez', value: 119000 },
          { date: '15 Dez', value: 121000 },
          { date: '20 Dez', value: 123500 },
          { date: '25 Dez', value: 125000 },
          { date: '30 Dez', value: 125430 },
        ];
      case '90D':
        return [
          { date: 'Out', value: 105000 },
          { date: 'Nov', value: 110000 },
          { date: 'Dez', value: 125430 },
        ];
      case '1A':
        return [
          { date: 'Jan', value: 90000 },
          { date: 'Mar', value: 95000 },
          { date: 'Mai', value: 100000 },
          { date: 'Jul', value: 105000 },
          { date: 'Set', value: 110000 },
          { date: 'Nov', value: 120000 },
          { date: 'Dez', value: 125430 },
        ];
    }
  };

  const mockData = getMockData();

  const chartData = data || mockData;

  const chartConfig = {
    labels: chartData.map((d) => d.date),
    datasets: [
      {
        label: 'Patrimônio Líquido',
        data: chartData.map((d) => d.value),
        borderColor: 'hsl(142 76% 36%)', // prosperity color
        backgroundColor: 'hsla(142, 76%, 36%, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'hsl(142 76% 36%)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: 'hsl(142 76% 36%)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'hsl(var(--card))',
        titleColor: 'hsl(var(--card-foreground))',
        bodyColor: 'hsl(var(--card-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function (context) {
            const value = context.parsed.y;
            if (typeof value === 'number') {
              return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(value);
            }
            return '';
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'hsl(var(--border))',
          drawTicks: false,
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 11,
          },
          padding: 8,
          callback: function (value) {
            if (typeof value === 'number') {
              return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                notation: 'compact',
              }).format(value);
            }
            return '';
          },
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Evolução do Patrimônio</h2>
            <p className="text-sm text-muted-foreground">
              {period === '7D' && 'Últimos 7 dias'}
              {period === '30D' && 'Últimos 30 dias'}
              {period === '90D' && 'Últimos 90 dias'}
              {period === '1A' && 'Último ano'}
            </p>
          </div>
          
          {/* Period Filters */}
          <div className="flex items-center gap-2">
            {(['7D', '30D', '90D', '1A'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  period === p
                    ? 'bg-prosperity text-white shadow-md'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="h-[300px]">
          <Line data={chartConfig} options={options} />
        </div>
      </div>
    </div>
  );
}
