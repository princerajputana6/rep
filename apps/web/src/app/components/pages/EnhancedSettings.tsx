import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Switch } from '@/app/components/ui/switch';
import { Separator } from '@/app/components/ui/separator';
import { Badge } from '@/app/components/ui/badge';
import { Slider } from '@/app/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Settings as SettingsIcon,
  Shield,
  Users,
  Bell,
  Database,
  Lock,
  Globe,
  Zap,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Rocket,
  Brain,
  Eye,
  UserCheck,
  Clock,
  BarChart3,
  Mail,
  FileText,
  Target,
  Activity,
  TrendingUp,
  Building2,
  Save,
  RefreshCw,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

export function EnhancedSettings() {
  // System Settings
  const [autoApprovalThreshold, setAutoApprovalThreshold] = useState(5000);
  const [borrowRequestExpiry, setBorrowRequestExpiry] = useState(7);
  const [capacityWarningThreshold, setCapacityWarningThreshold] = useState(85);
  const [lowCapacityAlert, setLowCapacityAlert] = useState(60);
  
  // Campaign Mapper Settings
  const [minMatchScore, setMinMatchScore] = useState(70);
  const [autoAssignThreshold, setAutoAssignThreshold] = useState(90);
  const [budgetWarningLevel, setBudgetWarningLevel] = useState(80);
  const [budgetCriticalLevel, setBudgetCriticalLevel] = useState(95);
  
  // Financial Settings
  const [marginWarningThreshold, setMarginWarningThreshold] = useState(15);
  const [revenueLeakageAlert, setRevenueLeakageAlert] = useState(10000);
  const [clientHealthCheckInterval, setClientHealthCheckInterval] = useState(30);
  
  // AI Settings
  const [enableAIMatching, setEnableAIMatching] = useState(true);
  const [enablePredictivePlanning, setEnablePredictivePlanning] = useState(true);
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState(75);
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [digestFrequency, setDigestFrequency] = useState('daily');
  
  // Security Settings
  const [mfaRequired, setMfaRequired] = useState(false);
  const [passwordExpiry, setPasswordExpiry] = useState(90);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [ipWhitelisting, setIpWhitelisting] = useState(false);
  
  // Audit Settings
  const [auditRetention, setAuditRetention] = useState(365);
  const [detailedLogging, setDetailedLogging] = useState(true);
  const [exportAudits, setExportAudits] = useState(true);
  
  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const handleReset = () => {
    toast.info('Settings reset to defaults');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
            Platform Settings & Controls
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive admin controls for the entire REP Platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Reset
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid grid-cols-8 w-full">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="campaign">Campaigns</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="ai">AI & ML</TabsTrigger>
          <TabsTrigger value="notifications">Alerts</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                System Configuration
              </CardTitle>
              <CardDescription>
                Core platform settings and operational parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto-Approval Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Auto-Approval Threshold</Label>
                    <p className="text-sm text-gray-600">
                      Requests below this amount are auto-approved
                    </p>
                  </div>
                  <Badge variant="outline">${autoApprovalThreshold.toLocaleString()}</Badge>
                </div>
                <Slider
                  value={[autoApprovalThreshold]}
                  onValueChange={([value]) => setAutoApprovalThreshold(value)}
                  min={0}
                  max={10000}
                  step={500}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Borrow Request Expiry */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Borrow Request Expiry</Label>
                    <p className="text-sm text-gray-600">
                      Days before pending requests auto-expire
                    </p>
                  </div>
                  <Badge variant="outline">{borrowRequestExpiry} days</Badge>
                </div>
                <Slider
                  value={[borrowRequestExpiry]}
                  onValueChange={([value]) => setBorrowRequestExpiry(value)}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Capacity Thresholds */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Capacity Warning Threshold</Label>
                    <p className="text-sm text-gray-600">
                      Alert when resource utilization exceeds this level
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700">
                    {capacityWarningThreshold}%
                  </Badge>
                </div>
                <Slider
                  value={[capacityWarningThreshold]}
                  onValueChange={([value]) => setCapacityWarningThreshold(value)}
                  min={50}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Low Capacity Alert</Label>
                    <p className="text-sm text-gray-600">
                      Alert when available capacity drops below this level
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    {lowCapacityAlert}%
                  </Badge>
                </div>
                <Slider
                  value={[lowCapacityAlert]}
                  onValueChange={([value]) => setLowCapacityAlert(value)}
                  min={30}
                  max={80}
                  step={5}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Operational Toggles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Feature Toggles
              </CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Hidden Capacity Radar', desc: 'Show underutilized resources', enabled: true },
                { label: 'Cross-Agency Borrowing', desc: 'Allow resource sharing between agencies', enabled: true },
                { label: 'Automatic Rate Card Updates', desc: 'Auto-update rates based on market data', enabled: false },
                { label: 'Real-Time Notifications', desc: 'WebSocket-based live updates', enabled: true },
                { label: 'Performance Benchmarking', desc: 'Compare metrics against industry standards', enabled: true },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">{feature.label}</Label>
                    <p className="text-xs text-gray-600">{feature.desc}</p>
                  </div>
                  <Switch defaultChecked={feature.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign Mapper Settings */}
        <TabsContent value="campaign" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-purple-600" />
                Campaign Mapper Configuration
              </CardTitle>
              <CardDescription>
                Control AI matching, budget alerts, and campaign workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Match Score Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Minimum Match Score</Label>
                    <p className="text-sm text-gray-600">
                      Only show resources with match score above this threshold
                    </p>
                  </div>
                  <Badge variant="outline">{minMatchScore}</Badge>
                </div>
                <Slider
                  value={[minMatchScore]}
                  onValueChange={([value]) => setMinMatchScore(value)}
                  min={50}
                  max={90}
                  step={5}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <Info className="w-3 h-3" />
                  <span>Scores 70-89: Good Match | 90-100: Excellent Match</span>
                </div>
              </div>

              <Separator />

              {/* Auto-Assignment Threshold */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Auto-Assign Threshold</Label>
                    <p className="text-sm text-gray-600">
                      Automatically assign resources with match scores above this
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {autoAssignThreshold}
                  </Badge>
                </div>
                <Slider
                  value={[autoAssignThreshold]}
                  onValueChange={([value]) => setAutoAssignThreshold(value)}
                  min={80}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Budget Alert Levels */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Budget Warning Level</Label>
                    <p className="text-sm text-gray-600">
                      Send warning when budget utilization exceeds this %
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700">
                    {budgetWarningLevel}%
                  </Badge>
                </div>
                <Slider
                  value={[budgetWarningLevel]}
                  onValueChange={([value]) => setBudgetWarningLevel(value)}
                  min={70}
                  max={95}
                  step={5}
                  className="w-full"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Budget Critical Level</Label>
                    <p className="text-sm text-gray-600">
                      Send critical alert at this budget utilization %
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    {budgetCriticalLevel}%
                  </Badge>
                </div>
                <Slider
                  value={[budgetCriticalLevel]}
                  onValueChange={([value]) => setBudgetCriticalLevel(value)}
                  min={90}
                  max={110}
                  step={5}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Campaign Defaults */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Campaign Defaults
              </CardTitle>
              <CardDescription>Set default values for new campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Campaign Duration</Label>
                  <Select defaultValue="8">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 weeks</SelectItem>
                      <SelectItem value="6">6 weeks</SelectItem>
                      <SelectItem value="8">8 weeks</SelectItem>
                      <SelectItem value="12">12 weeks</SelectItem>
                      <SelectItem value="16">16 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Contingency Buffer</Label>
                  <Select defaultValue="10">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="15">15%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Settings */}
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Financial Intelligence Configuration
              </CardTitle>
              <CardDescription>
                CPRI, CMFME, and financial tracking parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Margin Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Margin Warning Threshold</Label>
                    <p className="text-sm text-gray-600">
                      Alert when client margin drops below this %
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700">
                    {marginWarningThreshold}%
                  </Badge>
                </div>
                <Slider
                  value={[marginWarningThreshold]}
                  onValueChange={([value]) => setMarginWarningThreshold(value)}
                  min={5}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Revenue Leakage */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Revenue Leakage Alert</Label>
                    <p className="text-sm text-gray-600">
                      Alert when potential revenue leak exceeds this amount
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    ${revenueLeakageAlert.toLocaleString()}
                  </Badge>
                </div>
                <Slider
                  value={[revenueLeakageAlert]}
                  onValueChange={([value]) => setRevenueLeakageAlert(value)}
                  min={5000}
                  max={50000}
                  step={5000}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Client Health Check */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Client Health Check Interval</Label>
                    <p className="text-sm text-gray-600">
                      Recalculate client health scores every X days
                    </p>
                  </div>
                  <Badge variant="outline">{clientHealthCheckInterval} days</Badge>
                </div>
                <Slider
                  value={[clientHealthCheckInterval]}
                  onValueChange={([value]) => setClientHealthCheckInterval(value)}
                  min={7}
                  max={90}
                  step={7}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Financial Rules & Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Enforce Rate Card Compliance', desc: 'Require all projects use approved rate cards', enabled: true },
                { label: 'Auto-Calculate Margin Erosion', desc: 'Track margin changes over project lifecycle', enabled: true },
                { label: 'Revenue Recognition Alerts', desc: 'Alert on billing milestone dates', enabled: true },
                { label: 'Budget Overrun Approvals', desc: 'Require approval for budget increases >10%', enabled: true },
              ].map((rule, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">{rule.label}</Label>
                    <p className="text-xs text-gray-600">{rule.desc}</p>
                  </div>
                  <Switch defaultChecked={rule.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI & ML Settings */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI & Machine Learning Configuration
              </CardTitle>
              <CardDescription>
                Configure AI resource matching, predictive planning, and confidence thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Toggle */}
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">Enable AI Resource Matching</Label>
                  <p className="text-sm text-gray-600">
                    Use machine learning to recommend optimal resources
                  </p>
                </div>
                <Switch checked={enableAIMatching} onCheckedChange={setEnableAIMatching} />
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">Enable Predictive Planning</Label>
                  <p className="text-sm text-gray-600">
                    Use historical data to forecast capacity needs
                  </p>
                </div>
                <Switch checked={enablePredictivePlanning} onCheckedChange={setEnablePredictivePlanning} />
              </div>

              <Separator />

              {/* Confidence Threshold */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">AI Confidence Threshold</Label>
                    <p className="text-sm text-gray-600">
                      Only show AI recommendations with confidence above this %
                    </p>
                  </div>
                  <Badge variant="outline">{aiConfidenceThreshold}%</Badge>
                </div>
                <Slider
                  value={[aiConfidenceThreshold]}
                  onValueChange={([value]) => setAiConfidenceThreshold(value)}
                  min={60}
                  max={95}
                  step={5}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Weighting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Match Score Weighting
              </CardTitle>
              <CardDescription>
                Adjust importance of each factor in AI matching algorithm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="text-sm font-mono text-blue-900">
                  Match Score = (Skill × 40%) + (Availability × 25%) + (Performance × 20%) + (Rate × 15%)
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Skill Match Weight', value: 40, desc: 'Overlap between required and resource skills' },
                  { label: 'Availability Weight', value: 25, desc: 'Resource capacity during project timeline' },
                  { label: 'Past Performance Weight', value: 20, desc: 'Historical success on similar projects' },
                  { label: 'Rate Fit Weight', value: 15, desc: 'Hourly rate vs. project budget' },
                ].map((factor, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{factor.label}</Label>
                      <Badge variant="outline">{factor.value}%</Badge>
                    </div>
                    <p className="text-xs text-gray-600">{factor.desc}</p>
                    <Slider value={[factor.value]} min={0} max={50} step={5} disabled />
                  </div>
                ))}
              </div>

              <div className="text-xs text-amber-600 flex items-center gap-2 p-3 bg-amber-50 rounded">
                <AlertCircle className="w-4 h-4" />
                <span>Adjusting weights requires recalibration. Contact support to modify.</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Notification Channels
              </CardTitle>
              <CardDescription>
                Configure how users receive alerts and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-xs text-gray-600">Send alerts via email</p>
                  </div>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Slack Notifications</Label>
                    <p className="text-xs text-gray-600">Send alerts to Slack channels</p>
                  </div>
                </div>
                <Switch checked={slackNotifications} onCheckedChange={setSlackNotifications} />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-amber-600" />
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Push Notifications</Label>
                    <p className="text-xs text-gray-600">In-app browser notifications</p>
                  </div>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Digest Frequency</Label>
                <Select value={digestFrequency} onValueChange={setDigestFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly digest</SelectItem>
                    <SelectItem value="daily">Daily digest</SelectItem>
                    <SelectItem value="weekly">Weekly digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Alert Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Alert Rules
              </CardTitle>
              <CardDescription>Configure when to send notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { event: 'Borrow Request Received', enabled: true },
                { event: 'Resource Approval Needed', enabled: true },
                { event: 'Campaign Budget Warning', enabled: true },
                { event: 'Client Health Score Drop', enabled: true },
                { event: 'Capacity Threshold Reached', enabled: true },
                { event: 'Project Milestone Achieved', enabled: false },
                { event: 'Revenue Leakage Detected', enabled: true },
                { event: 'Rate Card Expiring', enabled: true },
              ].map((rule, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <Label className="text-sm">{rule.event}</Label>
                  <Switch defaultChecked={rule.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" />
                Security & Access Control
              </CardTitle>
              <CardDescription>
                Authentication, authorization, and data protection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* MFA */}
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-2 border-red-200">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">Require Multi-Factor Authentication</Label>
                  <p className="text-sm text-gray-600">
                    Force all users to enable 2FA
                  </p>
                </div>
                <Switch checked={mfaRequired} onCheckedChange={setMfaRequired} />
              </div>

              <Separator />

              {/* Password Expiry */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Password Expiry (Days)</Label>
                    <p className="text-sm text-gray-600">
                      Force password change after this many days
                    </p>
                  </div>
                  <Badge variant="outline">{passwordExpiry} days</Badge>
                </div>
                <Slider
                  value={[passwordExpiry]}
                  onValueChange={([value]) => setPasswordExpiry(value)}
                  min={30}
                  max={180}
                  step={30}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Session Timeout */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Session Timeout (Minutes)</Label>
                    <p className="text-sm text-gray-600">
                      Auto-logout after inactivity
                    </p>
                  </div>
                  <Badge variant="outline">{sessionTimeout} min</Badge>
                </div>
                <Slider
                  value={[sessionTimeout]}
                  onValueChange={([value]) => setSessionTimeout(value)}
                  min={15}
                  max={120}
                  step={15}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* IP Whitelisting */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">IP Whitelisting</Label>
                  <p className="text-xs text-gray-600">
                    Only allow access from approved IP addresses
                  </p>
                </div>
                <Switch checked={ipWhitelisting} onCheckedChange={setIpWhitelisting} />
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Encrypt Data at Rest', enabled: true },
                { label: 'Encrypt Data in Transit (TLS 1.3)', enabled: true },
                { label: 'PII Masking in Logs', enabled: true },
                { label: 'Automatic Backup (Daily)', enabled: true },
                { label: 'GDPR Compliance Mode', enabled: true },
              ].map((setting, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <Label className="text-sm">{setting.label}</Label>
                  <Switch defaultChecked={setting.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Settings */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Audit & Compliance Configuration
              </CardTitle>
              <CardDescription>
                Control audit logging, retention, and export policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Retention Period */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Audit Log Retention (Days)</Label>
                    <p className="text-sm text-gray-600">
                      Keep audit logs for this many days
                    </p>
                  </div>
                  <Badge variant="outline">{auditRetention} days</Badge>
                </div>
                <Slider
                  value={[auditRetention]}
                  onValueChange={([value]) => setAuditRetention(value)}
                  min={90}
                  max={2555}
                  step={90}
                  className="w-full"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Detailed Logging</Label>
                  <p className="text-xs text-gray-600">
                    Log all user actions and system events
                  </p>
                </div>
                <Switch checked={detailedLogging} onCheckedChange={setDetailedLogging} />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Enable Audit Exports</Label>
                  <p className="text-xs text-gray-600">
                    Allow users to export audit logs
                  </p>
                </div>
                <Switch checked={exportAudits} onCheckedChange={setExportAudits} />
              </div>
            </CardContent>
          </Card>

          {/* Logged Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                Logged Events
              </CardTitle>
              <CardDescription>Select which events to track</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                'User Login/Logout',
                'Resource Allocations',
                'Budget Changes',
                'Rate Card Modifications',
                'Campaign Creation/Updates',
                'Client Data Changes',
                'Permission Changes',
                'API Access',
                'Data Exports',
                'Settings Modifications',
              ].map((event, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <Label className="text-sm">{event}</Label>
                  <Switch defaultChecked={true} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Integration Configuration
              </CardTitle>
              <CardDescription>
                Manage external system connections and sync settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Workfront', status: 'Connected', sync: 'Every 15 min', enabled: true },
                { name: 'HubSpot', status: 'Not Connected', sync: 'N/A', enabled: false },
                { name: 'Salesforce', status: 'Not Connected', sync: 'N/A', enabled: false },
                { name: 'Slack', status: 'Connected', sync: 'Real-time', enabled: true },
                { name: 'Google Analytics', status: 'Not Connected', sync: 'N/A', enabled: false },
                { name: 'Stripe', status: 'Connected', sync: 'Daily', enabled: true },
              ].map((integration, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">{integration.name}</Label>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant={integration.status === 'Connected' ? 'default' : 'outline'} className="text-xs">
                          {integration.status}
                        </Badge>
                        <span className="text-gray-600">• Sync: {integration.sync}</span>
                      </div>
                    </div>
                  </div>
                  <Switch defaultChecked={integration.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Sync Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-600" />
                Sync Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Auto-Sync Campaign Data', desc: 'Automatically sync campaign data from marketing tools', enabled: true },
                { label: 'Bi-Directional Sync', desc: 'Sync changes in both directions', enabled: false },
                { label: 'Conflict Resolution: REP Wins', desc: 'Use REP data when conflicts occur', enabled: true },
                { label: 'Sync Historical Data', desc: 'Import data from past 12 months on first sync', enabled: true },
              ].map((setting, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="space-y-1">
                    <Label className="text-sm">{setting.label}</Label>
                    <p className="text-xs text-gray-600">{setting.desc}</p>
                  </div>
                  <Switch defaultChecked={setting.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Bar */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Settings Status</div>
                <div className="text-sm text-blue-700">
                  All changes are saved automatically
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Export Config
              </Button>
              <Button size="sm" className="gap-2">
                <Save className="w-4 h-4" />
                Save All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
