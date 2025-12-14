'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/hooks/useTranslations';
import { reportsService } from '@/lib/api/reports.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, BarChart3, PieChart, Calendar } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ReportsPage() {
  const { t } = useTranslations();
  const [reportType, setReportType] = useState('financial');
  const [period, setPeriod] = useState('current_month');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const generateReport = async () => {
    try {
      setLoading(true);
      // Simular generación de reporte
      setTimeout(() => {
        // Datos de ejemplo para gráficos
        setReportData({
          financialSummary: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            income: [65000, 72000, 68000, 81000, 75000, 78000],
            expenses: [42000, 45000, 43000, 48000, 46000, 47000],
          },
          paymentMethods: [
            { name: 'Efectivo', value: 35 },
            { name: 'Transferencia', value: 40 },
            { name: 'Tarjeta', value: 15 },
            { name: 'Depósito', value: 10 },
          ],
          unitStatus: [
            { name: 'Al día', value: 75 },
            { name: 'Morosos', value: 15 },
            { name: 'Pendiente', value: 10 },
          ],
          topUnits: [
            { unit: 'A-101', amount: 12000, status: 'Al día' },
            { unit: 'B-205', amount: 11500, status: 'Al día' },
            { unit: 'C-302', amount: 10500, status: 'Moroso' },
            { unit: 'A-102', amount: 9800, status: 'Al día' },
            { unit: 'B-201', amount: 9200, status: 'Pendiente' },
          ],
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error generating report:', error);
      setLoading(false);
    }
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    alert(`Exportando reporte en formato ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('reports.title')}</h1>
          <p className="text-muted-foreground">{t('reports.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button onClick={generateReport} disabled={loading}>
            {loading ? t('common.generating') : t('reports.generate')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('reports.configuration')}</CardTitle>
          <CardDescription>{t('reports.configDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('reports.reportType')}</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">
                    <div className="flex items-center">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      {t('reports.types.financial')}
                    </div>
                  </SelectItem>
                  <SelectItem value="payments">
                    <div className="flex items-center">
                      <PieChart className="mr-2 h-4 w-4" />
                      {t('reports.types.payments')}
                    </div>
                  </SelectItem>
                  <SelectItem value="units">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      {t('reports.types.units')}
                    </div>
                  </SelectItem>
                  <SelectItem value="owners">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      {t('reports.types.owners')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('reports.period')}</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_month">{t('reports.periods.currentMonth')}</SelectItem>
                  <SelectItem value="last_month">{t('reports.periods.lastMonth')}</SelectItem>
                  <SelectItem value="current_quarter">{t('reports.periods.currentQuarter')}</SelectItem>
                  <SelectItem value="last_quarter">{t('reports.periods.lastQuarter')}</SelectItem>
                  <SelectItem value="current_year">{t('reports.periods.currentYear')}</SelectItem>
                  <SelectItem value="custom">{t('reports.periods.custom')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <Tabs defaultValue="financial" className="space-y-4">
          <TabsList>
            <TabsTrigger value="financial">{t('reports.tabs.financial')}</TabsTrigger>
            <TabsTrigger value="payments">{t('reports.tabs.payments')}</TabsTrigger>
            <TabsTrigger value="units">{t('reports.tabs.units')}</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.financialOverview')}</CardTitle>
                <CardDescription>{t('reports.financialDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height={300} minWidth={0}>
                    <LineChart data={reportData.financialSummary.labels.map((label: string, index: number) => ({
                      month: label,
                      Ingresos: reportData.financialSummary.income[index],
                      Gastos: reportData.financialSummary.expenses[index],
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Ingresos" stroke="#0088FE" strokeWidth={2} />
                      <Line type="monotone" dataKey="Gastos" stroke="#FF8042" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('reports.paymentMethods')}</CardTitle>
                  <CardDescription>{t('reports.methodsDistribution')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height={300} minWidth={0}>
                      <RechartsPieChart>
                        <Pie
                          data={reportData.paymentMethods}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {reportData.paymentMethods.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('reports.unitStatus')}</CardTitle>
                  <CardDescription>{t('reports.statusDistribution')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                    <ResponsiveContainer width="100%" height={300} minWidth={0}>
                      <BarChart data={reportData.unitStatus}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="units" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.topUnits')}</CardTitle>
                <CardDescription>{t('reports.topUnitsDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.topUnits.map((unit: any, index: number) => (
                    <div key={unit.unit} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full mr-3">
                          <span className="font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{unit.unit}</p>
                          <p className="text-sm text-muted-foreground">
                            {unit.status === 'Al día' ? '✅ ' : unit.status === 'Moroso' ? '❌ ' : '⚠️ '}
                            {unit.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${unit.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{t('reports.totalAmount')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!reportData && !loading && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>{t('reports.noDataTitle')}</CardTitle>
            <CardDescription>{t('reports.noDataDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={generateReport} size="lg">
              <BarChart3 className="mr-2 h-5 w-5" />
              {t('reports.generateFirst')}
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">{t('reports.generatingReport')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}