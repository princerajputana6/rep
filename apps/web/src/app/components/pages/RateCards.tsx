import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Search, Plus, Edit, TrendingUp } from 'lucide-react';

interface RateCard {
  id: string;
  name: string;
  costRate: number;
  billRate: number;
  currency: string;
  location: string;
  validFrom: string;
  validTo: string;
  margin: number;
  status: 'active' | 'inactive' | 'expired';
  attachments: number;
}

export function RateCards() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const rateCards: RateCard[] = [
    {
      id: 'RC-001',
      name: 'Senior Developer - US',
      costRate: 100,
      billRate: 150,
      currency: 'USD',
      location: 'United States',
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      margin: 50,
      status: 'active',
      attachments: 12
    },
    {
      id: 'RC-002',
      name: 'UX Designer - EU',
      costRate: 70,
      billRate: 100,
      currency: 'EUR',
      location: 'Europe',
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      margin: 42.9,
      status: 'active',
      attachments: 8
    },
    {
      id: 'RC-003',
      name: 'Product Manager - UK',
      costRate: 90,
      billRate: 140,
      currency: 'GBP',
      location: 'United Kingdom',
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      margin: 55.6,
      status: 'active',
      attachments: 5
    },
    {
      id: 'RC-004',
      name: 'Data Analyst - APAC',
      costRate: 60,
      billRate: 85,
      currency: 'USD',
      location: 'Asia Pacific',
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      margin: 41.7,
      status: 'active',
      attachments: 15
    },
    {
      id: 'RC-005',
      name: 'QA Engineer - US (Legacy)',
      costRate: 55,
      billRate: 80,
      currency: 'USD',
      location: 'United States',
      validFrom: '2023-01-01',
      validTo: '2023-12-31',
      margin: 45.5,
      status: 'expired',
      attachments: 3
    },
  ];

  const filteredCards = rateCards.filter((card) =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Rate Cards</h1>
          <p className="text-gray-600 mt-1">Manage cost and bill rates with margin visibility</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Rate Card
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Rate Cards</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">34</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Active Cards</div>
            <div className="text-2xl font-semibold text-green-600 mt-1">28</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Avg Margin</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">47.2%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Currencies</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">5</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search rate cards by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Rate Cards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Cards ({filteredCards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Cost Rate</TableHead>
                <TableHead>Bill Rate</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Attachments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-mono text-sm">{card.id}</TableCell>
                  <TableCell className="font-medium text-gray-900">{card.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">{card.currency}</span>
                      <span className="font-medium">${card.costRate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">{card.currency}</span>
                      <span className="font-medium">${card.billRate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`w-4 h-4 ${card.margin > 50 ? 'text-green-600' : 'text-amber-600'}`} />
                      <span className={`font-medium ${card.margin > 50 ? 'text-green-600' : 'text-amber-600'}`}>
                        {card.margin.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{card.currency}</Badge>
                  </TableCell>
                  <TableCell>{card.location}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{card.validFrom}</div>
                      <div className="text-gray-500">to {card.validTo}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{card.attachments} roles/tie-ups</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      card.status === 'active' ? 'default' :
                      card.status === 'expired' ? 'destructive' :
                      'secondary'
                    }>
                      {card.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Rate Card</DialogTitle>
            <DialogDescription>
              Define cost and bill rates with automatic margin calculation
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Rate Card Name</Label>
              <Input id="cardName" placeholder="e.g., Senior Developer - US" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costRate">Cost Rate (per hour)</Label>
                <Input id="costRate" type="number" placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billRate">Bill Rate (per hour)</Label>
                <Input id="billRate" type="number" placeholder="150" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="margin">Margin (auto-calc)</Label>
                <Input id="margin" value="50%" disabled className="bg-gray-50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="eur">EUR</SelectItem>
                    <SelectItem value="gbp">GBP</SelectItem>
                    <SelectItem value="aud">AUD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="eu">Europe</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="apac">Asia Pacific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input id="validFrom" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validTo">Valid To</Label>
                <Input id="validTo" type="date" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateDialog(false)}>Create Rate Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
