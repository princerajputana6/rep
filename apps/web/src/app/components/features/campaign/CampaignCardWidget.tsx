/**
 * Campaign Card Widget
 * 
 * A comprehensive, reusable campaign widget that displays all key campaign
 * information in a visually appealing card format. Can be used in dashboards,
 * grids, and overview pages.
 */

import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import {
  MoreVertical,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Link as LinkIcon,
  Target,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import type { Campaign } from '@/types/campaign.types';

interface CampaignCardWidgetProps {
  campaign: Campaign;
  onView?: (campaignId: string) => void;
  onEdit?: (campaignId: string) => void;
  onAnalytics?: (campaignId: string) => void;
  onArchive?: (campaignId: string) => void;
  onDuplicate?: (campaignId: string) => void;
  compact?: boolean;
}

export function CampaignCardWidget({
  campaign,
  onView,
  onEdit,
  onAnalytics,
  onArchive,
  onDuplicate,
  compact = false,
}: CampaignCardWidgetProps) {
  // Calculate derived values
  const budgetUtilization = (campaign.spent / campaign.budget) * 100;
  const daysRemaining = Math.ceil(
    (new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const isOverBudget = campaign.spent > campaign.budget;
  const isAtRisk = campaign.healthScore < 60;
  const isNearDeadline = daysRemaining > 0 && daysRemaining <= 14;

  // Status styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500';
      case 'planning':
        return 'bg-purple-500';
      case 'on-hold':
        return 'bg-amber-500';
      case 'completed':
        return 'bg-green-500';
      case 'archived':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Health score styling
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-amber-100';
    return 'bg-red-100';
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (compact) {
    return <CompactCampaignCard campaign={campaign} onView={onView} />;
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 relative overflow-hidden group">
      {/* Status Indicator Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getStatusColor(campaign.status)}`} />

      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Campaign Name */}
            <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {campaign.name}
            </h3>

            {/* Client & Type */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-600">{campaign.client}</span>
              <span className="text-gray-400">•</span>
              <Badge variant="secondary" className="text-xs">
                {campaign.type}
              </Badge>
            </div>
          </div>

          {/* Status Badge & Menu */}
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(campaign.status)}>
              {campaign.status}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(campaign.id)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(campaign.id)}>
                  Edit Campaign
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAnalytics?.(campaign.id)}>
                  View Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDuplicate?.(campaign.id)}>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive?.(campaign.id)}>
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alerts Section */}
        {(isAtRisk || isOverBudget || isNearDeadline) && (
          <div className="flex flex-wrap gap-2">
            {isAtRisk && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 rounded text-xs">
                <AlertTriangle className="w-3 h-3" />
                <span>At Risk</span>
              </div>
            )}
            {isOverBudget && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs">
                <DollarSign className="w-3 h-3" />
                <span>Over Budget</span>
              </div>
            )}
            {isNearDeadline && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                <Clock className="w-3 h-3" />
                <span>{daysRemaining} days left</span>
              </div>
            )}
          </div>
        )}

        {/* Health Score & Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Progress</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{campaign.progress}%</span>
          </div>
          <Progress value={campaign.progress} className="h-2" />

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Health Score</span>
            </div>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${getHealthScoreBg(campaign.healthScore)}`}>
              {campaign.healthScore >= 80 ? (
                <CheckCircle className={`w-3.5 h-3.5 ${getHealthScoreColor(campaign.healthScore)}`} />
              ) : campaign.healthScore >= 60 ? (
                <AlertTriangle className={`w-3.5 h-3.5 ${getHealthScoreColor(campaign.healthScore)}`} />
              ) : (
                <AlertTriangle className={`w-3.5 h-3.5 ${getHealthScoreColor(campaign.healthScore)}`} />
              )}
              <span className={`text-sm font-semibold ${getHealthScoreColor(campaign.healthScore)}`}>
                {campaign.healthScore}
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          {/* Budget */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Budget</span>
            </div>
            <div className="font-semibold text-gray-900">{formatCurrency(campaign.budget)}</div>
            <div className="flex items-center gap-1 text-xs">
              <span className={isOverBudget ? 'text-red-600' : 'text-gray-600'}>
                {formatCurrency(campaign.spent)} spent
              </span>
              {isOverBudget && <TrendingUp className="w-3 h-3 text-red-600" />}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Calendar className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </div>
            <div className="font-semibold text-gray-900">
              {daysRemaining > 0 ? `${daysRemaining}d left` : 'Past due'}
            </div>
            <div className="text-xs text-gray-600">
              {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="space-y-2 pt-3 border-t">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Users className="w-3.5 h-3.5" />
            <span>Team ({campaign.team.length} members)</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Team Avatars */}
            <div className="flex -space-x-2">
              {campaign.team.slice(0, 3).map((member) => (
                <Avatar key={member.id} className="w-8 h-8 border-2 border-white">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {campaign.team.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    +{campaign.team.length - 3}
                  </span>
                </div>
              )}
            </div>

            {/* Manager */}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-600">Manager</div>
              <div className="text-sm font-medium text-gray-900 truncate">
                {campaign.manager}
              </div>
            </div>
          </div>
        </div>

        {/* Mapped Project Indicator */}
        {campaign.mappedProjectId && (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
            <LinkIcon className="w-4 h-4 text-green-600" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-green-700">Mapped to PPM</div>
              <div className="text-sm font-medium text-green-900 truncate">
                {campaign.mappedProjectName}
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
              {campaign.mappedTasks?.length || 0} tasks
            </Badge>
          </div>
        )}

        {/* Template Badge */}
        {campaign.fromTemplate && (
          <div className="flex items-center gap-1.5 text-xs text-purple-600">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Created from template</span>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={() => onView?.(campaign.id)}
          className="w-full"
          variant="outline"
        >
          View Campaign
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Compact Campaign Card
 * Smaller version for lists and dense layouts
 */
function CompactCampaignCard({
  campaign,
  onView,
}: {
  campaign: Campaign;
  onView?: (campaignId: string) => void;
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500';
      case 'planning':
        return 'bg-purple-500';
      case 'on-hold':
        return 'bg-amber-500';
      case 'completed':
        return 'bg-green-500';
      case 'archived':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView?.(campaign.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Status Indicator */}
          <div className={`w-1 h-full rounded-full ${getStatusColor(campaign.status)}`} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{campaign.name}</h4>
                <p className="text-sm text-gray-600 truncate">{campaign.client}</p>
              </div>
              <Badge className={getStatusColor(campaign.status)} variant="secondary">
                {campaign.status}
              </Badge>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-700">{campaign.progress}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className={`w-3.5 h-3.5 ${getHealthScoreColor(campaign.healthScore)}`} />
                <span className={getHealthScoreColor(campaign.healthScore)}>
                  {campaign.healthScore}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-700">{formatCurrency(campaign.budget)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <Progress value={campaign.progress} className="h-1.5 mt-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Campaign Card Skeleton Loader
 */
export function CampaignCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-2 bg-gray-200 rounded w-full animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
      </CardContent>
    </Card>
  );
}
