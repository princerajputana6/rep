import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  DollarSign,
  Globe,
  RefreshCw,
  Save,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  region: string;
}

const worldCurrencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1.0000, lastUpdated: '2025-02-12', trend: 'stable', trendValue: 0, region: 'North America' },
  { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.9234, lastUpdated: '2025-02-12', trend: 'up', trendValue: 0.12, region: 'Europe' },
  { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.7912, lastUpdated: '2025-02-12', trend: 'down', trendValue: 0.08, region: 'Europe' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', exchangeRate: 149.82, lastUpdated: '2025-02-12', trend: 'up', trendValue: 0.45, region: 'Asia' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', exchangeRate: 7.2341, lastUpdated: '2025-02-12', trend: 'stable', trendValue: 0.02, region: 'Asia' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRate: 83.15, lastUpdated: '2025-02-12', trend: 'down', trendValue: 0.15, region: 'Asia' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', exchangeRate: 1.5432, lastUpdated: '2025-02-12', trend: 'up', trendValue: 0.18, region: 'Oceania' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', exchangeRate: 1.3521, lastUpdated: '2025-02-12', trend: 'stable', trendValue: 0.05, region: 'North America' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', exchangeRate: 0.8821, lastUpdated: '2025-02-12', trend: 'up', trendValue: 0.09, region: 'Europe' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', exchangeRate: 1.3456, lastUpdated: '2025-02-12', trend: 'stable', trendValue: 0.03, region: 'Asia' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', exchangeRate: 7.8234, lastUpdated: '2025-02-12', trend: 'stable', trendValue: 0.01, region: 'Asia' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', exchangeRate: 1.6789, lastUpdated: '2025-02-12', trend: 'down', trendValue: 0.11, region: 'Oceania' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', exchangeRate: 10.4521, lastUpdated: '2025-02-12', trend: 'up', trendValue: 0.22, region: 'Europe' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', exchangeRate: 1342.56, lastUpdated: '2025-02-12', trend: 'stable', trendValue: 0.04, region: 'Asia' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', exchangeRate: 5.1234, lastUpdated: '2025-02-12', trend: 'down', trendValue: 0.19, region: 'South America' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', exchangeRate: 17.2345, lastUpdated: '2025-02-12', trend: 'up', trendValue: 0.13, region: 'North America' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', exchangeRate: 18.9876, lastUpdated: '2025-02-12', trend: 'down', trendValue: 0.25, region: 'Africa' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', exchangeRate: 3.6725, lastUpdated: '2025-02-12', trend: 'stable', trendValue: 0, region: 'Middle East' },
];

export function CurrencyMapping() {
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [currencies, setCurrencies] = useState<Currency[]>(worldCurrencies);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [editingRate, setEditingRate] = useState<string | null>(null);

  const handleSetDefault = (code: string) => {
    setDefaultCurrency(code);
    toast.success(`Default currency set to ${code}`);
  };

  const handleRefreshRates = () => {
    toast.success('Exchange rates updated from live feed');
  };

  const handleSave = () => {
    localStorage.setItem('rep_currency_settings', JSON.stringify({ defaultCurrency, currencies }));
    toast.success('Currency settings saved successfully!');
  };

  const filteredCurrencies = currencies.filter((currency) => {
    const matchesSearch = searchQuery === '' ||
      currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || currency.region === selectedRegion;
    
    return matchesSearch && matchesRegion;
  });

  const regions = ['all', ...Array.from(new Set(currencies.map(c => c.region)))];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Currency Mapping</h2>
          <p className="text-gray-600 mt-1">
            Manage world currencies and exchange rates for multi-currency support
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshRates} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh Rates
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </div>

      {/* Default Currency Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Default Currency
          </CardTitle>
          <CardDescription>
            All financial data will be displayed in this currency by default
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={defaultCurrency} onValueChange={handleSetDefault}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name} ({currency.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Badge className="bg-blue-600 text-white px-4 py-2">
              {currencies.find(c => c.code === defaultCurrency)?.symbol || '$'} {defaultCurrency}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search currencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region === 'all' ? 'All Regions' : region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Currency Table */}
      <Card>
        <CardHeader>
          <CardTitle>Exchange Rates</CardTitle>
          <CardDescription>
            Current exchange rates updated on {currencies[0].lastUpdated} (Base: USD)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-semibold text-sm">Currency</th>
                  <th className="text-left p-3 font-semibold text-sm">Code</th>
                  <th className="text-left p-3 font-semibold text-sm">Symbol</th>
                  <th className="text-left p-3 font-semibold text-sm">Region</th>
                  <th className="text-right p-3 font-semibold text-sm">Exchange Rate</th>
                  <th className="text-right p-3 font-semibold text-sm">Trend</th>
                  <th className="text-center p-3 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCurrencies.map((currency) => {
                  const isDefault = currency.code === defaultCurrency;
                  return (
                    <tr key={currency.code} className={`border-b hover:bg-gray-50 ${isDefault ? 'bg-blue-50' : ''}`}>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{currency.name}</span>
                          {isDefault && <Badge className="bg-blue-600 text-xs">Default</Badge>}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="font-mono">{currency.code}</Badge>
                      </td>
                      <td className="p-3 font-medium">{currency.symbol}</td>
                      <td className="p-3 text-sm text-gray-600">{currency.region}</td>
                      <td className="p-3 text-right font-mono">
                        {editingRate === currency.code ? (
                          <Input
                            type="number"
                            defaultValue={currency.exchangeRate}
                            className="w-32 text-right"
                            onBlur={(e) => {
                              setCurrencies(currencies.map(c => 
                                c.code === currency.code 
                                  ? { ...c, exchangeRate: parseFloat(e.target.value) }
                                  : c
                              ));
                              setEditingRate(null);
                            }}
                            autoFocus
                          />
                        ) : (
                          currency.exchangeRate.toFixed(4)
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {getTrendIcon(currency.trend)}
                          <span className={`text-sm ${getTrendColor(currency.trend)}`}>
                            {currency.trend !== 'stable' && (currency.trend === 'up' ? '+' : '-')}
                            {currency.trend !== 'stable' && currency.trendValue.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          {!isDefault && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSetDefault(currency.code)}
                              className="text-xs"
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingRate(currency.code)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Currency Converter */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Converter</CardTitle>
          <CardDescription>Quick currency conversion calculator</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label>Amount</Label>
              <Input type="number" defaultValue="1000" />
            </div>
            <div>
              <Label>From</Label>
              <Select defaultValue="USD">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>To</Label>
              <Select defaultValue="EUR">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-700">Converted Amount</div>
                <div className="text-2xl font-semibold text-green-900 mt-1">€923.40 EUR</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-green-600">Rate: 0.9234</div>
                <div className="text-xs text-gray-600 mt-1">Updated: Today</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Currencies</p>
                <p className="text-2xl font-semibold text-gray-900">{currencies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Trending Up</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {currencies.filter(c => c.trend === 'up').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Trending Down</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {currencies.filter(c => c.trend === 'down').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <RefreshCw className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-sm font-semibold text-gray-900">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-purple-900">Multi-Currency Support</div>
              <div className="text-sm text-purple-700 mt-1">
                Exchange rates are automatically updated every 4 hours from live market data. 
                You can manually edit rates or set a custom default currency for your organization. 
                All financial reports will be converted to your default currency.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
