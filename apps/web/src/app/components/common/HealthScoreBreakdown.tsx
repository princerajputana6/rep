import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Users, 
  Target,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Progress } from '@/app/components/ui/progress';

interface HealthScoreBreakdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: {
    name: string;
    healthScore: number;
    progress: number;
    budget: number;
    spent: number;
    burnRate: number;
    daysRemaining: number;
    teamSize: number;
    status: string;
  };
}

export function HealthScoreBreakdown({ open, onOpenChange, campaign }: HealthScoreBreakdownProps) {
  // Calculate individual scores
  const progressScore = campaign.progress >= 80 ? 30 : campaign.progress >= 50 ? 20 : 10;
  const budgetUtilization = (campaign.spent / campaign.budget) * 100;
  const budgetScore = budgetUtilization <= 80 ? 25 : budgetUtilization <= 100 ? 15 : 5;
  const scheduleScore = campaign.daysRemaining > 7 ? 20 : campaign.daysRemaining > 0 ? 10 : 5;
  const teamScore = campaign.teamSize >= 3 ? 15 : campaign.teamSize >= 2 ? 10 : 5;
  const statusScore = campaign.status === 'active' ? 10 : campaign.status === 'planning' ? 5 : 0;

  const totalScore = progressScore + budgetScore + scheduleScore + teamScore + statusScore;

  const factors = [
    {
      name: 'Progress',
      score: progressScore,
      maxScore: 30,
      value: `${campaign.progress}%`,
      icon: <Target className="w-5 h-5" />,
      color: 'blue',
      description: 'Campaign completion progress',
      status: campaign.progress >= 80 ? 'excellent' : campaign.progress >= 50 ? 'good' : 'needs-attention',
    },
    {
      name: 'Budget Health',
      score: budgetScore,
      maxScore: 25,
      value: `${budgetUtilization.toFixed(0)}%`,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'green',
      description: 'Budget utilization efficiency',
      status: budgetUtilization <= 80 ? 'excellent' : budgetUtilization <= 100 ? 'good' : 'needs-attention',
    },
    {
      name: 'Schedule',
      score: scheduleScore,
      maxScore: 20,
      value: `${campaign.daysRemaining} days`,
      icon: <Calendar className="w-5 h-5" />,
      color: 'purple',
      description: 'Timeline adherence',
      status: campaign.daysRemaining > 7 ? 'excellent' : campaign.daysRemaining > 0 ? 'good' : 'needs-attention',
    },
    {
      name: 'Team Capacity',
      score: teamScore,
      maxScore: 15,
      value: `${campaign.teamSize} members`,
      icon: <Users className="w-5 h-5" />,
      color: 'amber',
      description: 'Team size adequacy',
      status: campaign.teamSize >= 3 ? 'excellent' : campaign.teamSize >= 2 ? 'good' : 'needs-attention',
    },
    {
      name: 'Status',
      score: statusScore,
      maxScore: 10,
      value: campaign.status,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'indigo',
      description: 'Campaign status health',
      status: campaign.status === 'active' ? 'excellent' : 'good',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-500">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-blue-500">Good</Badge>;
      case 'needs-attention':
        return <Badge className="bg-amber-500">Needs Attention</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Health Score Breakdown
          </DialogTitle>
          <DialogDescription>
            Understanding how the health score is calculated for "{campaign.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Score */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-700 mb-1">Overall Health Score</div>
                  <div className="text-5xl font-bold text-blue-900">{totalScore}</div>
                  <div className="text-sm text-blue-600 mt-1">out of 100 points</div>
                </div>
                <div className="text-right">
                  {totalScore >= 80 ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="w-8 h-8" />
                      <div>
                        <div className="font-bold text-xl">Excellent</div>
                        <div className="text-sm">Campaign is healthy</div>
                      </div>
                    </div>
                  ) : totalScore >= 60 ? (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Target className="w-8 h-8" />
                      <div>
                        <div className="font-bold text-xl">Good</div>
                        <div className="text-sm">On track</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600">
                      <TrendingDown className="w-8 h-8" />
                      <div>
                        <div className="font-bold text-xl">At Risk</div>
                        <div className="text-sm">Needs attention</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formula Explanation */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-semibold text-blue-900 mb-1">How is this calculated?</div>
                <div className="text-sm text-blue-700">
                  Health Score = Progress (30) + Budget Health (25) + Schedule (20) + Team Capacity (15) + Status (10)
                </div>
              </div>
            </div>
          </div>

          {/* Individual Factors */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Score Breakdown</h3>
            {factors.map((factor) => (
              <Card key={factor.name}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${factor.color}-100 text-${factor.color}-600`}>
                        {factor.icon}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{factor.name}</div>
                        <div className="text-xs text-gray-600">{factor.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-900">
                        {factor.score}/{factor.maxScore}
                      </div>
                      <div className="text-xs text-gray-600">{factor.value}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Score</span>
                      {getStatusBadge(factor.status)}
                    </div>
                    <Progress 
                      value={(factor.score / factor.maxScore) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recommendations */}
          {totalScore < 80 && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-900 mb-2">Recommendations</div>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {campaign.progress < 50 && (
                      <li>• Increase campaign progress to improve overall health</li>
                    )}
                    {budgetUtilization > 80 && (
                      <li>• Monitor budget closely - approaching or exceeding allocation</li>
                    )}
                    {campaign.daysRemaining <= 7 && (
                      <li>• Timeline is tight - prioritize critical tasks</li>
                    )}
                    {campaign.teamSize < 3 && (
                      <li>• Consider adding more team members for better capacity</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
