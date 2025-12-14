'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from '@/lib/hooks/useTranslations';
import { paymentsService, Payment } from '@/lib/api/payments.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Filter, DollarSign, Download } from 'lucide-react';

export default function PaymentsPage() {
  const { t } = useTranslations();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    unitId: '',
    startDate: '',
    endDate: '',
    paymentMethod: '',
  });

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentsService.getPayments(filters);
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    loadPayments();
  };

  const clearFilters = () => {
    setFilters({
      unitId: '',
      startDate: '',
      endDate: '',
      paymentMethod: '',
    });
    loadPayments();
  };

  const formatCurrency = (amount?: number | string) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPaymentMethodBadge = (method: string) => {
    const variants: Record<string, string> = {
      EFECTIVO: 'bg-green-100 text-green-800',
      TRANSFERENCIA: 'bg-blue-100 text-blue-800',
      TARJETA: 'bg-purple-100 text-purple-800',
      DEPOSITO: 'bg-yellow-100 text-yellow-800',
    };
    return variants[method] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('payments.title')}</h1>
          <p className="text-muted-foreground">{t('payments.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t('common.export')}
          </Button>
          <Button>
            <DollarSign className="mr-2 h-4 w-4" />
            {t('payments.registerPayment')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('common.filters')}</CardTitle>
          <CardDescription>{t('payments.filterDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('payments.unitCode')}</label>
              <Input
                placeholder="A-101"
                value={filters.unitId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('unitId', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('payments.startDate')}</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('payments.endDate')}</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('payments.paymentMethod')}</label>
              <Select value={filters.paymentMethod} onValueChange={(value: string) => handleFilterChange('paymentMethod', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('common.all')}</SelectItem>
                  <SelectItem value="EFECTIVO">{t('payments.methods.cash')}</SelectItem>
                  <SelectItem value="TRANSFERENCIA">{t('payments.methods.transfer')}</SelectItem>
                  <SelectItem value="TARJETA">{t('payments.methods.card')}</SelectItem>
                  <SelectItem value="DEPOSITO">{t('payments.methods.deposit')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={clearFilters}>
              {t('common.clear')}
            </Button>
            <Button onClick={applyFilters}>
              <Filter className="mr-2 h-4 w-4" />
              {t('common.apply')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('payments.recentPayments')}</CardTitle>
          <CardDescription>{t('payments.recentDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>{t('common.loading')}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <p>{t('payments.noPayments')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('payments.unit')}</TableHead>
                    <TableHead>{t('payments.period')}</TableHead>
                    <TableHead>{t('payments.amount')}</TableHead>
                    <TableHead>{t('payments.method')}</TableHead>
                    <TableHead>{t('payments.reference')}</TableHead>
                    <TableHead>{t('payments.date')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.slice(0, 10).map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.unit?.code || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {payment.billing_period?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentMethodBadge(payment.payment_method || '')}>
                          {payment.payment_method
                            ? t(`payments.methods.${(payment.payment_method || '').toString().toLowerCase()}`)
                            : '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.reference_number || '-'}
                      </TableCell>
                      <TableCell>
                        {formatDate(payment.payment_date)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          {t('common.view')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('payments.totalCollected')}</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(payments.reduce((sum, p) => sum + Number(p.amount || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('payments.fromLast30Days')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('payments.totalPayments')}</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('payments.registeredPayments')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('payments.avgPayment')}</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.length > 0
                ? formatCurrency(payments.reduce((sum, p) => sum + Number(p.amount || 0), 0) / payments.length)
                : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('payments.perTransaction')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}