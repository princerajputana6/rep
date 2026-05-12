import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
  AlertTriangle,
  TrendingUp,
  Target,
  DollarSign,
  Calendar,
  Users,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Progress } from '@/app/components/ui/progress';

interface Campaign {
  id: string;
  name: string;
  status: string;
  healthScore: number;
  progress: number;
  budget: number;
  spent: number;
  client: string;
  daysRemaining?: number;
  team?: any[];
}

interface CampaignWidgetsProps {
  campaigns: Campaign[];
  onViewCampaign?: (campaignId: string) => void;
  onViewAllCampaigns?: () => void;
}

export function CampaignWidgets({ campaigns, onViewCampaign, onViewAllCampaigns }: CampaignWidgetsProps) {
  // Calculate metrics
  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const atRiskCampaigns = campaigns.filter(c => c.healthScore < 60 && c.status === 'active');
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const budgetUtilization = (totalSpent / totalBudget) * 100;

  // Get campaigns by status
  const campaignsByStatus = {
    active: campaigns.filter(c => c.status === 'active').length,
    planning: campaigns.filter(c => c.status === 'planning').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    onHold: campaigns.filter(c => c.status === 'on-hold').length,
  };

  // Get recent activity (last 5 campaigns)
  const recentCampaigns = [...campaigns]
    .sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Active Campaigns */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeCampaigns.length}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {campaigns.length} total
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* At Risk */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">At Risk</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{atRiskCampaigns.length}</p>
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Needs attention
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Utilization */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Used</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{budgetUtilization.toFixed(0)}%</p>
                <p className="text-xs text-gray-600 mt-1">
                  ${(totalSpent / 1000).toFixed(0)}K / ${(totalBudget / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg Health Score */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Health Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {campaigns.length > 0 
                    ? (campaigns.reduce((sum, c) => sum + c.healthScore, 0) / campaigns.length).toFixed(0)
                    : 0}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.healthScore, 0) / campaigns.length : 0}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* At Risk Campaigns Alert */}
      {atRiskCampaigns.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="w-5 h-5" />
              Campaigns Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {atRiskCampaigns.slice(0, 3).map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{campaign.name}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {campaign.client}
                      </Badge>
                      <span className="text-xs text-amber-700">
                        Health Score: {campaign.healthScore}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewCampaign?.(campaign.id)}
                    className="gap-1"
                  >
                    View
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {atRiskCampaigns.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewAllCampaigns}
                  className="w-full"
                >
                  View all {atRiskCampaigns.length} at-risk campaigns
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign Status Breakdown & Budget Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Active</span>
                  <span className="font-semibold text-green-600">{campaignsByStatus.active}</span>
                </div>
                <Progress 
                  value={(campaignsByStatus.active / campaigns.length) * 100} 
                  className="h-2 bg-gray-200"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Planning</span>
                  <span className="font-semibold text-blue-600">{campaignsByStatus.planning}</span>
                </div>
                <Progress 
                  value={(campaignsByStatus.planning / campaigns.length) * 100} 
                  className="h-2 bg-gray-200"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-purple-600">{campaignsByStatus.completed}</span>
                </div>
                <Progress 
                  value={(campaignsByStatus.completed / campaigns.length) * 100} 
                  className="h-2 bg-gray-200"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">On Hold</span>
                  <span className="font-semibold text-amber-600">{campaignsByStatus.onHold}</span>
                </div>
                <Progress 
                  value={(campaignsByStatus.onHold / campaigns.length) * 100} 
                  className="h-2 bg-gray-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Total Budget */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-green-700">Total Allocated</div>
                <div className="text-2xl font-bold text-green-900 mt-1">
                  ${(totalBudget / 1000).toFixed(0)}K
                </div>
              </div>

              {/* Spent vs Remaining */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-700">Spent</div>
                  <div className="text-xl font-bold text-blue-900 mt-1">
                    ${(totalSpent / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {budgetUtilization.toFixed(0)}%
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-700">Remaining</div>
                  <div className="text-xl font-bold text-gray-900 mt-1">
                    ${((totalBudget - totalSpent) / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {(100 - budgetUtilization).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Budget Health */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Budget Utilization</span>
                  <Badge className={
                    budgetUtilization > 90 ? 'bg-red-500' : 
                    budgetUtilization > 75 ? 'bg-amber-500' : 
                    'bg-green-500'
                  }>
                    {budgetUtilization.toFixed(0)}%
                  </Badge>
                </div>
                <Progress 
                  value={budgetUtilization} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Campaign Activity</CardTitle>
            <Button variant="ghost" size="sm" onClick={onViewAllCampaigns}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{campaign.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {campaign.status}
                      </Badge>
                      <span className="text-xs text-gray-600">{campaign.client}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {campaign.progress}%
                    </div>
                    <div className="text-xs text-gray-600">
                      Health: {campaign.healthScore}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewCampaign?.(campaign.id)}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
