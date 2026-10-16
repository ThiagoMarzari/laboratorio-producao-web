import { api } from '@/lib/api'

// Espelha SalesReport de backend/src/reports/reports.service.ts. Valores em centavos.
export interface RelatorioVendas {
  months: number
  totals: { orders: number; customers: number; revenueCents: number; avgTicketCents: number }
  byMonth: { month: string; orders: number; revenueCents: number }[]
  byCategory: { category: string; orders: number; revenueCents: number }[]
  topProducts: { name: string; category: string; units: number; revenueCents: number }[]
  topCustomers: { name: string; orders: number; revenueCents: number }[]
  generatedAt: string
}

// Uma função por rota do ReportsController
export const reportsApi = {
  vendas: (meses: number) => api<RelatorioVendas>('GET', `/reports/sales?months=${meses}`),
}
