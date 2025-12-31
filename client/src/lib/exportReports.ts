import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface Transaction {
  id: number;
  date: Date | string;
  description: string | null;
  amount: string;
  type: "income" | "expense" | "transfer";
  category?: { name: string } | null;
  account?: { name: string } | null;
  isPending: boolean;
}

interface ExportOptions {
  title?: string;
  startDate?: Date;
  endDate?: Date;
  summary?: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
  };
}

export function exportTransactionsToPDF(
  transactions: Transaction[],
  options: ExportOptions = {}
) {
  const doc = new jsPDF();
  const { title = "Relatório de Transações", startDate, endDate, summary } = options;

  // Header
  doc.setFontSize(20);
  doc.text(title, 14, 22);

  // Period
  if (startDate && endDate) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Período: ${formatDate(startDate)} a ${formatDate(endDate)}`,
      14,
      30
    );
  }

  // Summary section
  if (summary) {
    const summaryY = startDate && endDate ? 38 : 30;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Resumo Financeiro", 14, summaryY);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Receitas: ${formatCurrency(summary.totalIncome)}`, 14, summaryY + 7);
    doc.text(`Despesas: ${formatCurrency(summary.totalExpenses)}`, 14, summaryY + 14);
    if (summary.balance >= 0) {
      doc.setTextColor(0, 128, 0);
    } else {
      doc.setTextColor(255, 0, 0);
    }
    doc.text(`Saldo: ${formatCurrency(summary.balance)}`, 14, summaryY + 21);
  }

  // Transactions table
  const tableData = transactions.map((t) => [
    formatDate(t.date),
    t.description || "Sem descrição",
    t.category?.name || "-",
    t.account?.name || "-",
    t.type === "income" ? "Receita" : t.type === "expense" ? "Despesa" : "Transferência",
    formatCurrency(parseFloat(t.amount)),
    t.isPending ? "Pendente" : "Pago",
  ]);

  autoTable(doc, {
    startY: summary ? 68 : startDate && endDate ? 38 : 30,
    head: [["Data", "Descrição", "Categoria", "Conta", "Tipo", "Valor", "Status"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8 },
    columnStyles: {
      5: { halign: "right" },
    },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Download
  doc.save(`relatorio-transacoes-${Date.now()}.pdf`);
}

export function exportTransactionsToExcel(
  transactions: Transaction[],
  options: ExportOptions = {}
) {
  const { title = "Relatório de Transações", summary } = options;

  // Prepare data
  const data = transactions.map((t) => ({
    Data: formatDate(t.date),
    Descrição: t.description || "Sem descrição",
    Categoria: t.category?.name || "-",
    Conta: t.account?.name || "-",
    Tipo: t.type === "income" ? "Receita" : t.type === "expense" ? "Despesa" : "Transferência",
    Valor: parseFloat(t.amount),
    Status: t.isPending ? "Pendente" : "Pago",
  }));

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Transactions sheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws["!cols"] = [
    { wch: 12 }, // Data
    { wch: 30 }, // Descrição
    { wch: 20 }, // Categoria
    { wch: 20 }, // Conta
    { wch: 15 }, // Tipo
    { wch: 15 }, // Valor
    { wch: 10 }, // Status
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Transações");

  // Summary sheet
  if (summary) {
    const summaryData = [
      { Métrica: "Total de Receitas", Valor: summary.totalIncome },
      { Métrica: "Total de Despesas", Valor: summary.totalExpenses },
      { Métrica: "Saldo", Valor: summary.balance },
      { Métrica: "Quantidade de Transações", Valor: transactions.length },
    ];

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary["!cols"] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumo");
  }

  // Download
  XLSX.writeFile(wb, `relatorio-transacoes-${Date.now()}.xlsx`);
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR");
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
