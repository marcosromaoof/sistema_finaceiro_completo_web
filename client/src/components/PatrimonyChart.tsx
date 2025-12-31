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
  // Mock data se não houver dados reais
  const mockData = [
    { date: '01 Dez', value: 115000 },
    { date: '05 Dez', value: 117500 },
    { date: '10 Dez', value: 119000 },
    { date: '15 Dez', value: 121000 },
    { date: '20 Dez', value: 123500 },
    { date: '25 Dez', value: 125000 },
    { date: '30 Dez', value: 125430 },
  ];

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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Evolução do Patrimônio</h2>
            <p className="text-sm text-muted-foreground">
              Últimos 30 dias
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-prosperity"></div>
            <span className="text-muted-foreground">Patrimônio Líquido</span>
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
