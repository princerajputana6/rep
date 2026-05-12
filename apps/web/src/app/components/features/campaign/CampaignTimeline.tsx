import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

interface CampaignPhase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'completed' | 'active' | 'upcoming';
  dependencies?: string[];
}

interface Campaign {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  phases: CampaignPhase[];
  milestones?: Array<{
    id: string;
    name: string;
    date: string;
    achieved: boolean;
  }>;
}

interface CampaignTimelineProps {
  campaign: Campaign;
}

export function CampaignTimeline({ campaign }: CampaignTimelineProps) {
  // Calculate timeline dimensions
  const startDate = new Date(campaign.startDate);
  const endDate = new Date(campaign.endDate);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const today = new Date();

  const getPositionAndWidth = (phaseStart: string, phaseEnd: string) => {
    const phaseStartDate = new Date(phaseStart);
    const phaseEndDate = new Date(phaseEnd);
    
    const daysFromStart = Math.ceil((phaseStartDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const phaseDuration = Math.ceil((phaseEndDate.getTime() - phaseStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const left = (daysFromStart / totalDays) * 100;
    const width = (phaseDuration / totalDays) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const getTodayPosition = () => {
    const daysFromStart = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return (daysFromStart / totalDays) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'active':
        return 'bg-blue-500';
      case 'upcoming':
        return 'bg-gray-300';
      default:
        return 'bg-gray-300';
    }
  };

  const getMilestonePosition = (date: string) => {
    const milestoneDate = new Date(date);
    const daysFromStart = Math.ceil((milestoneDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return (daysFromStart / totalDays) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Campaign Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Timeline Header */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="font-semibold text-gray-900">{campaign.name}</div>
              <div className="text-gray-600 mt-1 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
              </div>
            </div>
            <Badge variant="secondary">{totalDays} days</Badge>
          </div>

          {/* Timeline Grid */}
          <div className="relative bg-gray-50 rounded-lg p-6 min-h-[400px]">
            {/* Month Markers */}
            <div className="absolute top-0 left-0 right-0 h-8 border-b border-gray-200 flex">
              {Array.from({ length: Math.ceil(totalDays / 30) }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 text-center text-xs text-gray-600 font-medium"
                  style={{ minWidth: '60px' }}
                >
                  Month {i + 1}
                </div>
              ))}
            </div>

            {/* Today Marker */}
            {today >= startDate && today <= endDate && (
              <div
                className="absolute top-8 bottom-0 w-0.5 bg-red-500 z-20"
                style={{ left: `${getTodayPosition()}%` }}
              >
                <div className="absolute -top-1 -left-8 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Today
                </div>
              </div>
            )}

            {/* Phases */}
            <div className="relative mt-12 space-y-4">
              {campaign.phases.map((phase, index) => {
                const position = getPositionAndWidth(phase.startDate, phase.endDate);
                
                return (
                  <div key={phase.id} className="relative h-16">
                    {/* Phase Label */}
                    <div className="absolute left-0 -translate-x-full pr-4 w-48 text-right">
                      <div className="text-sm font-medium text-gray-900">{phase.name}</div>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {phase.status}
                      </Badge>
                    </div>

                    {/* Phase Bar */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-12 rounded-lg shadow-sm border-2 border-white"
                      style={{
                        left: position.left,
                        width: position.width,
                      }}
                    >
                      <div className={`h-full rounded-lg ${getStatusColor(phase.status)} relative overflow-hidden`}>
                        {/* Progress Overlay */}
                        {phase.status === 'active' && (
                          <>
                            <div
                              className="absolute top-0 left-0 h-full bg-green-500 opacity-50"
                              style={{ width: `${phase.progress}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                              {phase.progress}%
                            </div>
                          </>
                        )}
                        
                        {phase.status === 'completed' && (
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                            ✓ Complete
                          </div>
                        )}

                        {phase.status === 'upcoming' && (
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-600">
                            Upcoming
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dependencies Arrow */}
                    {phase.dependencies && phase.dependencies.length > 0 && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" title="Has dependencies" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Milestones */}
            {campaign.milestones && campaign.milestones.length > 0 && (
              <div className="relative mt-8 pt-8 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-700 mb-4">Milestones</div>
                <div className="relative h-12">
                  {campaign.milestones.map((milestone) => {
                    const position = getMilestonePosition(milestone.date);
                    
                    return (
                      <div
                        key={milestone.id}
                        className="absolute"
                        style={{ left: `${position}%` }}
                      >
                        <div className="relative -translate-x-1/2">
                          {/* Diamond Marker */}
                          <div
                            className={`w-4 h-4 rotate-45 ${
                              milestone.achieved ? 'bg-green-500' : 'bg-gray-400'
                            } border-2 border-white shadow-sm`}
                          />
                          {/* Label */}
                          <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-gray-600">
                            {milestone.name}
                          </div>
                          <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-gray-500">
                            {new Date(milestone.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded" />
              <span>Upcoming</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rotate-45" />
              <span>Milestone</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
