import { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { X } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryData {
  category: string;
  amount: number;
  color: string;
}

interface CategoryChartProps {
  data?: CategoryData[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Mock data se não houver dados reais
  const mockData: CategoryData[] = [
    { category: 'Alimentação', amount: 1200, color: 'hsl(142 76% 36%)' }, // prosperity
    { category: 'Transporte', amount: 800, color: 'hsl(221 83% 53%)' }, // primary
    { category: 'Lazer', amount: 500, color: 'hsl(43 96% 56%)' }, // secondary
    { category: 'Saúde', amount: 400, color: 'hsl(0 84% 60%)' }, // destructive
    { category: 'Educação', amount: 300, color: 'hsl(262 83% 58%)' }, // purple
  ];

  const chartData = data || mockData;
  const total = chartData.reduce((sum, item) => sum + item.amount, 0);

  const chartConfig = {
    labels: chartData.map((d) => d.category),
    datasets: [
      {
        data: chartData.map((d) => d.amount),
        backgroundColor: chartData.map((d) => d.color),
        borderColor: 'hsl(var(--background))',
        borderWidth: 3,
        hoverOffset: 10,
        hoverBorderWidth: 4,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        setSelectedCategory(chartData[index].category);
      }
    },
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
        displayColors: true,
        callbacks: {
          label: function (context) {
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            const formatted = new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(value);
            return `${formatted} (${percentage}%)`;
          },
        },
      },
    },
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const selectedData = selectedCategory
    ? chartData.find((item) => item.category === selectedCategory)
    : null;

  return (
    <div className="glass rounded-xl overflow-hidden relative">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Despesas por Categoria</h2>
            <p className="text-sm text-muted-foreground">
              Distribuição do mês atual • <span className="text-primary">Clique para detalhes</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="relative">
            <div className="h-[250px] relative">
              <Doughnut data={chartConfig} options={options} />
              
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {chartData.map((item, index) => {
              const percentage = ((item.amount / total) * 100).toFixed(1);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.amount)}</p>
                    <p className="text-sm text-muted-foreground">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Details Modal */}
      {selectedData && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 p-6 flex flex-col animate-in fade-in-0 slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">{selectedData.category}</h3>
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-6">
            {/* Total */}
            <div className="p-6 rounded-xl border-2 border-border/50 bg-muted/20">
              <p className="text-sm text-muted-foreground mb-1">Total Gasto</p>
              <p className="text-4xl font-bold">{formatCurrency(selectedData.amount)}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {((selectedData.amount / total) * 100).toFixed(1)}% do total
              </p>
            </div>

            {/* Mock Transactions */}
            <div>
              <h4 className="font-semibold mb-3">Transações Recentes</h4>
              <div className="space-y-2">
                {[
                  { name: 'Compra 1', date: '28 Dez', value: selectedData.amount * 0.4 },
                  { name: 'Compra 2', date: '25 Dez', value: selectedData.amount * 0.35 },
                  { name: 'Compra 3', date: '20 Dez', value: selectedData.amount * 0.25 },
                ].map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{transaction.name}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <p className="font-semibold">{formatCurrency(transaction.value)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full px-4 py-3 rounded-lg bg-prosperity text-white font-medium hover:bg-prosperity/90 transition-colors">
              Ver Todas as Transações
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
