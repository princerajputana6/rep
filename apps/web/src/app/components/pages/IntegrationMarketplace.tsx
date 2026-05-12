import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  Plug,
  Search,
  Star,
  Download,
  CheckCircle2,
  Settings,
  Code,
  Zap,
  Cloud,
  Database,
  MessageSquare,
  Calendar,
  FileText,
  DollarSign,
  BarChart3,
  Users,
  Mail,
  Video,
  Lock,
  ExternalLink,
  Play,
  BookOpen,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'project-management' | 'communication' | 'productivity' | 'analytics' | 'finance' | 'hr' | 'development';
  icon: any;
  color: string;
  rating: number;
  installs: string;
  status: 'available' | 'installed' | 'coming-soon';
  features: string[];
  price: 'free' | 'paid' | 'freemium';
  developer: string;
  website?: string;
}

interface CustomIntegration {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  status: 'active' | 'inactive';
  lastUsed?: string;
}

const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Workfront',
    description: 'Sync projects, tasks, and resources from Adobe Workfront',
    category: 'project-management',
    icon: FileText,
    color: 'blue',
    rating: 4.8,
    installs: '10K+',
    status: 'installed',
    features: ['Project sync', 'Task management', 'Resource tracking', 'Time logs'],
    price: 'free',
    developer: 'REP Team',
  },
  {
    id: '2',
    name: 'Jira',
    description: 'Connect with Atlassian Jira for issue tracking and project management',
    category: 'project-management',
    icon: BarChart3,
    color: 'indigo',
    rating: 4.7,
    installs: '25K+',
    status: 'available',
    features: ['Issue sync', 'Sprint planning', 'Agile boards', 'Custom workflows'],
    price: 'free',
    developer: 'Atlassian',
    website: 'https://jira.atlassian.com',
  },
  {
    id: '3',
    name: 'Slack',
    description: 'Real-time notifications and team collaboration via Slack',
    category: 'communication',
    icon: MessageSquare,
    color: 'purple',
    rating: 4.9,
    installs: '50K+',
    status: 'installed',
    features: ['Instant alerts', 'Channel notifications', 'Bot commands', 'File sharing'],
    price: 'free',
    developer: 'Slack Technologies',
  },
  {
    id: '4',
    name: 'Microsoft Teams',
    description: 'Collaborate with your team through Microsoft Teams integration',
    category: 'communication',
    icon: Video,
    color: 'blue',
    rating: 4.6,
    installs: '30K+',
    status: 'available',
    features: ['Teams notifications', 'Meeting schedules', 'Chat integration', 'File sync'],
    price: 'free',
    developer: 'Microsoft',
  },
  {
    id: '5',
    name: 'Google Calendar',
    description: 'Sync resource schedules and availability with Google Calendar',
    category: 'productivity',
    icon: Calendar,
    color: 'green',
    rating: 4.7,
    installs: '40K+',
    status: 'installed',
    features: ['Calendar sync', 'Availability tracking', 'Meeting scheduling', 'Reminders'],
    price: 'free',
    developer: 'Google',
  },
  {
    id: '6',
    name: 'Tableau',
    description: 'Advanced analytics and visualization with Tableau integration',
    category: 'analytics',
    icon: BarChart3,
    color: 'orange',
    rating: 4.8,
    installs: '15K+',
    status: 'available',
    features: ['Data export', 'Custom dashboards', 'Real-time analytics', 'Report generation'],
    price: 'paid',
    developer: 'Tableau Software',
  },
  {
    id: '7',
    name: 'QuickBooks',
    description: 'Financial data integration with QuickBooks',
    category: 'finance',
    icon: DollarSign,
    color: 'emerald',
    rating: 4.5,
    installs: '20K+',
    status: 'available',
    features: ['Invoice sync', 'Expense tracking', 'Financial reports', 'Budget management'],
    price: 'freemium',
    developer: 'Intuit',
  },
  {
    id: '8',
    name: 'GitHub',
    description: 'Connect with GitHub for developer resource tracking',
    category: 'development',
    icon: Code,
    color: 'gray',
    rating: 4.9,
    installs: '35K+',
    status: 'available',
    features: ['Commit tracking', 'PR analytics', 'Code contribution metrics', 'Team insights'],
    price: 'free',
    developer: 'GitHub',
  },
  {
    id: '9',
    name: 'BambooHR',
    description: 'HR management and employee data synchronization',
    category: 'hr',
    icon: Users,
    color: 'teal',
    rating: 4.6,
    installs: '12K+',
    status: 'available',
    features: ['Employee sync', 'Time-off tracking', 'Skills management', 'Performance data'],
    price: 'paid',
    developer: 'BambooHR',
  },
  {
    id: '10',
    name: 'Zapier',
    description: 'Connect REP with 5000+ apps through Zapier automation',
    category: 'productivity',
    icon: Zap,
    color: 'amber',
    rating: 4.8,
    installs: '60K+',
    status: 'coming-soon',
    features: ['Multi-app workflows', 'Custom triggers', 'Data transformation', 'Scheduling'],
    price: 'freemium',
    developer: 'Zapier',
  },
];

const apiExamples = {
  getResources: `// Get all available resources
fetch('https://api.rep-platform.com/v1/resources', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));`,
  
  createPool: `// Create a new resource pool
fetch('https://api.rep-platform.com/v1/pools', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Frontend Team",
    manager: "john@example.com",
    resources: ["res_123", "res_456"]
  })
})
.then(response => response.json())
.then(data => console.log(data));`,
  
  updateUtilization: `// Update resource utilization
fetch('https://api.rep-platform.com/v1/resources/{id}/utilization', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    utilization: 85,
    project: "proj_789"
  })
})
.then(response => response.json())
.then(data => console.log(data));`,
};

export function IntegrationMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [customIntegrations, setCustomIntegrations] = useState<CustomIntegration[]>([]);
  const [showApiPlayground, setShowApiPlayground] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All', icon: Plug },
    { id: 'project-management', label: 'Project Management', icon: FileText },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'productivity', label: 'Productivity', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'hr', label: 'HR', icon: Users },
    { id: 'development', label: 'Development', icon: Code },
  ];

  const filteredIntegrations = mockIntegrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstall = (integration: Integration) => {
    toast.success(`${integration.name} installed successfully!`);
    setSelectedIntegration(null);
  };

  const handleUninstall = (integration: Integration) => {
    toast.success(`${integration.name} uninstalled`);
    setSelectedIntegration(null);
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    emerald: 'bg-emerald-500',
    gray: 'bg-gray-700',
    teal: 'bg-teal-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
            <Plug className="w-8 h-8 text-blue-600" />
            Integration Marketplace
          </h1>
          <p className="text-gray-600 mt-1">
            Connect REP with your favorite tools and services
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowApiPlayground(true)} className="gap-2">
            <Code className="w-4 h-4" />
            API Playground
          </Button>
          <Button className="gap-2">
            <BookOpen className="w-4 h-4" />
            Documentation
          </Button>
        </div>
      </div>

      <Tabs defaultValue="marketplace" className="w-full">
        <TabsList>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="installed">Installed ({mockIntegrations.filter(i => i.status === 'installed').length})</TabsTrigger>
          <TabsTrigger value="custom">Custom Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <Button
                  key={category.id}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>

          {/* Integration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => {
              const Icon = integration.icon;
              const colorClass = colorClasses[integration.color] || colorClasses.blue;
              
              return (
                <Card
                  key={integration.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedIntegration(integration)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${colorClass} text-white`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs text-gray-600">{integration.rating}</span>
                            </div>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-600">{integration.installs} installs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {integration.description}
                    </CardDescription>
                    
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {integration.features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {integration.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{integration.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              integration.price === 'free' ? 'default' :
                              integration.price === 'paid' ? 'destructive' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {integration.price === 'free' ? '✨ Free' :
                             integration.price === 'paid' ? '💰 Paid' : '🎁 Freemium'}
                          </Badge>
                          {integration.status === 'installed' && (
                            <Badge className="bg-green-500 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Installed
                            </Badge>
                          )}
                          {integration.status === 'coming-soon' && (
                            <Badge variant="secondary" className="text-xs">
                              Coming Soon
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="installed" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockIntegrations.filter(i => i.status === 'installed').map((integration) => {
              const Icon = integration.icon;
              const colorClass = colorClasses[integration.color] || colorClasses.blue;
              
              return (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${colorClass} text-white`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <Badge className="bg-green-500 mt-1">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {integration.description}
                    </CardDescription>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Configure
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-600 hover:bg-red-50"
                        onClick={() => handleUninstall(integration)}
                      >
                        Uninstall
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custom API Integrations</CardTitle>
                  <CardDescription>Create custom webhooks and API connections</CardDescription>
                </div>
                <Button className="gap-2">
                  <Plug className="w-4 h-4" />
                  New Integration
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {customIntegrations.length === 0 ? (
                <div className="text-center py-12">
                  <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Custom Integrations</h3>
                  <p className="text-gray-600 mb-4">
                    Create custom API integrations to connect with any service
                  </p>
                  <Button>Create Your First Integration</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Custom integrations would be listed here */}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Detail Modal */}
      {selectedIntegration && (
        <Dialog open={!!selectedIntegration} onOpenChange={() => setSelectedIntegration(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = selectedIntegration.icon;
                  const colorClass = colorClasses[selectedIntegration.color] || colorClasses.blue;
                  return (
                    <div className={`p-3 rounded-lg ${colorClass} text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  );
                })()}
                <div>
                  <DialogTitle>{selectedIntegration.name}</DialogTitle>
                  <DialogDescription>by {selectedIntegration.developer}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Rating and Stats */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{selectedIntegration.rating}</span>
                  <span className="text-gray-600">rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold">{selectedIntegration.installs}</span>
                  <span className="text-gray-600">installs</span>
                </div>
                <Badge
                  variant={
                    selectedIntegration.price === 'free' ? 'default' :
                    selectedIntegration.price === 'paid' ? 'destructive' : 'secondary'
                  }
                >
                  {selectedIntegration.price === 'free' ? 'Free' :
                   selectedIntegration.price === 'paid' ? 'Paid' : 'Freemium'}
                </Badge>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-gray-600">{selectedIntegration.description}</p>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                <ul className="space-y-2">
                  {selectedIntegration.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selectedIntegration.status === 'installed' ? (
                  <>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Settings className="w-4 h-4" />
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 text-red-600 hover:bg-red-50"
                      onClick={() => handleUninstall(selectedIntegration)}
                    >
                      Uninstall
                    </Button>
                  </>
                ) : selectedIntegration.status === 'available' ? (
                  <>
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => handleInstall(selectedIntegration)}
                    >
                      <Download className="w-4 h-4" />
                      Install
                    </Button>
                    {selectedIntegration.website && (
                      <Button variant="outline" className="gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Visit Website
                      </Button>
                    )}
                  </>
                ) : (
                  <Button disabled className="flex-1">
                    Coming Soon
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* API Playground */}
      <Dialog open={showApiPlayground} onOpenChange={setShowApiPlayground}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              API Playground
            </DialogTitle>
            <DialogDescription>
              Test and explore REP Platform API endpoints
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">API Authentication</CardTitle>
                <CardDescription>Your API key is used to authenticate requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value="rep_sk_live_1234567890abcdef"
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Code Examples */}
            {Object.entries(apiExamples).map(([key, code]) => (
              <Card key={key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyCode(code, key)}
                      className="gap-2"
                    >
                      {copiedCode === key ? (
                        <><Check className="w-4 h-4" /> Copied</>
                      ) : (
                        <><Copy className="w-4 h-4" /> Copy</>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{code}</code>
                  </pre>
                </CardContent>
              </Card>
            ))}

            <div className="flex gap-2">
              <Button className="flex-1 gap-2">
                <BookOpen className="w-4 h-4" />
                View Full Documentation
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Play className="w-4 h-4" />
                Try in Postman
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Plug className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900">Integration Marketplace</div>
              <div className="text-sm text-blue-700 mt-1">
                Connect REP with your existing tools and workflows. All integrations are secure,
                reviewed, and maintained. Enterprise customers can request custom integrations
                through our API or contact support for white-glove integration services.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}