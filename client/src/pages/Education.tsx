import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calculator, TrendingUp, PieChart, Target, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Article {
  id: number;
  title: string;
  description: string;
  category: string;
  readTime: number;
  level: "iniciante" | "intermediário" | "avançado";
  icon: React.ReactNode;
}

interface Calculator {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const articles: Article[] = [
  {
    id: 1,
    title: "Guia Completo de Orçamento Pessoal",
    description: "Aprenda como criar um orçamento eficaz e acompanhar seus gastos mensais",
    category: "Orçamento",
    readTime: 8,
    level: "iniciante",
    icon: <PieChart className="w-6 h-6" />,
  },
  {
    id: 2,
    title: "Investimentos para Iniciantes",
    description: "Conheça os principais tipos de investimentos e como começar",
    category: "Investimentos",
    readTime: 12,
    level: "iniciante",
    icon: <TrendingUp className="w-6 h-6" />,
  },
  {
    id: 3,
    title: "Como Eliminar Dívidas Rapidamente",
    description: "Estratégias eficazes para se livrar de dívidas e recuperar a saúde financeira",
    category: "Dívidas",
    readTime: 10,
    level: "intermediário",
    icon: <AlertCircle className="w-6 h-6" />,
  },
  {
    id: 4,
    title: "Planejamento de Aposentadoria",
    description: "Entenda como planejar sua aposentadoria desde cedo",
    category: "Aposentadoria",
    readTime: 15,
    level: "intermediário",
    icon: <Target className="w-6 h-6" />,
  },
  {
    id: 5,
    title: "Diversificação de Investimentos",
    description: "Aprenda a distribuir seus investimentos para minimizar riscos",
    category: "Investimentos",
    readTime: 14,
    level: "avançado",
    icon: <TrendingUp className="w-6 h-6" />,
  },
  {
    id: 6,
    title: "Análise Técnica e Fundamental",
    description: "Técnicas avançadas para análise de ações e tomada de decisão",
    category: "Investimentos",
    readTime: 20,
    level: "avançado",
    icon: <Calculator className="w-6 h-6" />,
  },
];

const calculators: Calculator[] = [
  {
    id: 1,
    name: "Calculadora de Juros Compostos",
    description: "Calcule o crescimento do seu dinheiro com juros compostos",
    icon: <Calculator className="w-6 h-6" />,
  },
  {
    id: 2,
    name: "Calculadora de Aposentadoria",
    description: "Simule quanto você precisa poupar para se aposentar confortavelmente",
    icon: <Target className="w-6 h-6" />,
  },
  {
    id: 3,
    name: "Calculadora de Financiamento",
    description: "Calcule prestações e juros de financiamentos",
    icon: <DollarSign className="w-6 h-6" />,
  },
  {
    id: 4,
    name: "Calculadora de Inflação",
    description: "Veja como a inflação afeta seu poder de compra",
    icon: <TrendingUp className="w-6 h-6" />,
  },
];

export default function Education() {
  const [selectedLevel, setSelectedLevel] = useState<"todos" | "iniciante" | "intermediário" | "avançado">("todos");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [showCalculator, setShowCalculator] = useState<number | null>(null);

  const filteredArticles = articles.filter((article) => {
    const levelMatch = selectedLevel === "todos" || article.level === selectedLevel;
    const categoryMatch = selectedCategory === "todos" || article.category === selectedCategory;
    return levelMatch && categoryMatch;
  });

  const categories = ["todos", ...Array.from(new Set(articles.map((a) => a.category)))];

  const getLevelColor = (level: string | undefined) => {
    switch (level) {
      case "iniciante":
        return "bg-green-100 text-green-800";
      case "intermediário":
        return "bg-yellow-100 text-yellow-800";
      case "avançado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Educação Financeira</h1>
          <p className="text-muted-foreground">
            Aprenda sobre finanças pessoais, investimentos e planejamento financeiro
          </p>
        </div>

        {/* Calculadoras */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Calculadoras Financeiras</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calculators.map((calc) => (
              <Card key={calc.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="text-primary">{calc.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{calc.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{calc.description}</p>
                      <Button size="sm" onClick={() => setShowCalculator(calc.id)}>
                        Usar Calculadora
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Artigos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Artigos e Tutoriais</h2>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Nível:</Label>
              <div className="flex gap-2">
                {["todos", "iniciante", "intermediário", "avançado"].map((level) => (
                  <Button
                    key={level}
                    variant={selectedLevel === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLevel(level as any)}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <div className="w-full">
              <Label className="text-xs text-muted-foreground mb-2 block">Categoria:</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-primary">{article.icon}</div>
                    <Badge className={getLevelColor(article.level)}>
                      {article.level.charAt(0).toUpperCase() + article.level.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{article.title}</CardTitle>
                  <CardDescription>{article.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      ⏱️ {article.readTime} min de leitura
                    </span>
                    <Button variant="outline" size="sm">
                      Ler Artigo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  Nenhum artigo encontrado
                </p>
                <p className="text-sm text-muted-foreground">
                  Tente ajustar os filtros
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Dicas Rápidas de Educação Financeira
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-900">
            <div>
              <p className="font-medium mb-1">💡 Regra 50/30/20</p>
              <p>Gaste 50% com necessidades, 30% com desejos e 20% com poupança</p>
            </div>
            <div>
              <p className="font-medium mb-1">📈 Começar Cedo</p>
              <p>Quanto mais cedo você começar a investir, mais tempo seu dinheiro terá para crescer</p>
            </div>
            <div>
              <p className="font-medium mb-1">🎯 Diversificar</p>
              <p>Não coloque todos os seus ovos em uma cesta. Diversifique seus investimentos</p>
            </div>
            <div>
              <p className="font-medium mb-1">🛡️ Fundo de Emergência</p>
              <p>Mantenha 3-6 meses de despesas em uma conta de fácil acesso</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
