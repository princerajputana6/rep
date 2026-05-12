import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Trophy,
  Award,
  Star,
  Zap,
  Target,
  TrendingUp,
  Medal,
  Crown,
  Flame,
  Gift,
  CheckCircle2,
  Lock,
  Users,
  Calendar,
  BarChart3,
  Clock,
  Sparkles,
  Rocket,
  Shield,
  Heart,
  Brain,
  MessageSquare,
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'productivity' | 'collaboration' | 'accuracy' | 'speed' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
  progress?: number;
  total?: number;
  unlockedDate?: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  points: number;
  achievements: number;
  trend: 'up' | 'down' | 'same';
  trendChange?: number;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: 'perks' | 'recognition' | 'training' | 'swag';
  icon: any;
  available: boolean;
  claimed?: boolean;
}

interface UserStats {
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  currentStreak: number;
  rank: number;
  totalUsers: number;
}

const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first resource allocation',
    icon: Target,
    category: 'productivity',
    rarity: 'common',
    points: 10,
    unlocked: true,
    unlockedDate: '2025-01-15',
  },
  {
    id: '2',
    name: 'Speed Demon',
    description: 'Approve 10 requests in under 5 minutes',
    icon: Zap,
    category: 'speed',
    rarity: 'rare',
    points: 25,
    unlocked: true,
    unlockedDate: '2025-02-03',
  },
  {
    id: '3',
    name: 'Team Player',
    description: 'Collaborate on 5 resource pools',
    icon: Users,
    category: 'collaboration',
    rarity: 'common',
    points: 15,
    unlocked: true,
    unlockedDate: '2025-02-10',
  },
  {
    id: '4',
    name: 'Perfect Match',
    description: 'Achieve 100% AI match accuracy on 20 allocations',
    icon: Star,
    category: 'accuracy',
    rarity: 'epic',
    points: 50,
    unlocked: false,
    progress: 14,
    total: 20,
  },
  {
    id: '5',
    name: 'Hot Streak',
    description: 'Log in for 30 consecutive days',
    icon: Flame,
    category: 'productivity',
    rarity: 'rare',
    points: 30,
    unlocked: false,
    progress: 18,
    total: 30,
  },
  {
    id: '6',
    name: 'Resource Master',
    description: 'Manage 100+ resources successfully',
    icon: Crown,
    category: 'productivity',
    rarity: 'legendary',
    points: 100,
    unlocked: false,
    progress: 67,
    total: 100,
  },
  {
    id: '7',
    name: 'Early Bird',
    description: 'Complete 10 tasks before 9 AM',
    icon: Clock,
    category: 'special',
    rarity: 'rare',
    points: 20,
    unlocked: true,
    unlockedDate: '2025-01-28',
  },
  {
    id: '8',
    name: 'Efficiency Expert',
    description: 'Reduce average allocation time by 50%',
    icon: TrendingUp,
    category: 'speed',
    rarity: 'epic',
    points: 40,
    unlocked: false,
    progress: 32,
    total: 50,
  },
];

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Sarah Mitchell', points: 2847, achievements: 42, trend: 'same' },
  { rank: 2, name: 'John Smith', points: 2650, achievements: 38, trend: 'up', trendChange: 1 },
  { rank: 3, name: 'Emily Rodriguez', points: 2489, achievements: 36, trend: 'down', trendChange: 1 },
  { rank: 4, name: 'You', points: 2234, achievements: 28, trend: 'up', trendChange: 2 },
  { rank: 5, name: 'Michael Chen', points: 2156, achievements: 31, trend: 'same' },
  { rank: 6, name: 'Lisa Anderson', points: 2043, achievements: 29, trend: 'up', trendChange: 1 },
  { rank: 7, name: 'David Brown', points: 1987, achievements: 27, trend: 'down', trendChange: 2 },
  { rank: 8, name: 'Jennifer Lee', points: 1876, achievements: 25, trend: 'same' },
];

const mockRewards: Reward[] = [
  {
    id: '1',
    name: 'Extra Day Off',
    description: 'Redeem 1 additional vacation day',
    pointsCost: 500,
    category: 'perks',
    icon: Calendar,
    available: true,
  },
  {
    id: '2',
    name: 'Team Lunch',
    description: 'Sponsored team lunch for your department',
    pointsCost: 300,
    category: 'perks',
    icon: Users,
    available: true,
  },
  {
    id: '3',
    name: 'Public Recognition',
    description: 'Featured in company newsletter',
    pointsCost: 200,
    category: 'recognition',
    icon: Award,
    available: true,
  },
  {
    id: '4',
    name: 'Online Course',
    description: 'Access to premium online training course',
    pointsCost: 400,
    category: 'training',
    icon: Brain,
    available: true,
  },
  {
    id: '5',
    name: 'REP Pro Hoodie',
    description: 'Exclusive REP Platform branded hoodie',
    pointsCost: 250,
    category: 'swag',
    icon: Gift,
    available: true,
  },
  {
    id: '6',
    name: 'Conference Ticket',
    description: 'Pass to industry conference of your choice',
    pointsCost: 800,
    category: 'training',
    icon: Rocket,
    available: false,
  },
];

const userStats: UserStats = {
  totalPoints: 2234,
  level: 12,
  nextLevelPoints: 2500,
  achievementsUnlocked: 28,
  totalAchievements: 50,
  currentStreak: 18,
  rank: 4,
  totalUsers: 247,
};

export function Gamification() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All', icon: Trophy },
    { id: 'productivity', label: 'Productivity', icon: Target },
    { id: 'collaboration', label: 'Collaboration', icon: Users },
    { id: 'accuracy', label: 'Accuracy', icon: CheckCircle2 },
    { id: 'speed', label: 'Speed', icon: Zap },
    { id: 'special', label: 'Special', icon: Sparkles },
  ];

  const filteredAchievements = selectedCategory === 'all'
    ? mockAchievements
    : mockAchievements.filter(a => a.category === selectedCategory);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300';
      case 'rare': return 'border-blue-300';
      case 'epic': return 'border-purple-300';
      case 'legendary': return 'border-amber-300 shadow-lg shadow-amber-200';
      default: return 'border-gray-300';
    }
  };

  const levelProgress = ((userStats.totalPoints % 500) / 500) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-600" />
            Achievements & Rewards
          </h1>
          <p className="text-gray-600 mt-1">
            Track your progress, compete with teammates, and earn rewards
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg px-4 py-2">
          <Star className="w-4 h-4 mr-2" />
          Level {userStats.level}
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {userStats.totalPoints.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Next Level</span>
                <span className="font-medium">{userStats.nextLevelPoints}</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Achievements</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {userStats.achievementsUnlocked}/{userStats.totalAchievements}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Trophy className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress
                value={(userStats.achievementsUnlocked / userStats.totalAchievements) * 100}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {userStats.currentStreak} days
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Flame className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">Keep it going! 🔥</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Global Rank</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  #{userStats.rank}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Crown className="w-8 h-8 text-amber-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Top {Math.round((userStats.rank / userStats.totalUsers) * 100)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="achievements" className="w-full">
        <TabsList>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="rewards">Rewards Store</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-6">
          {/* Category Filter */}
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

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => {
              const Icon = achievement.icon;
              const rarityColor = getRarityColor(achievement.rarity);
              const rarityBorder = getRarityBorder(achievement.rarity);
              
              return (
                <Card
                  key={achievement.id}
                  className={`${rarityBorder} border-2 ${
                    achievement.unlocked ? '' : 'opacity-60'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 rounded-lg ${
                            achievement.unlocked ? rarityColor : 'bg-gray-300'
                          } text-white`}
                        >
                          {achievement.unlocked ? (
                            <Icon className="w-6 h-6" />
                          ) : (
                            <Lock className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base">{achievement.name}</CardTitle>
                          <Badge className={`${rarityColor} text-xs mt-1`}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        +{achievement.points} pts
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {achievement.description}
                    </CardDescription>
                    
                    {achievement.unlocked ? (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Unlocked on {achievement.unlockedDate}</span>
                      </div>
                    ) : achievement.progress !== undefined ? (
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">
                            {achievement.progress}/{achievement.total}
                          </span>
                        </div>
                        <Progress
                          value={(achievement.progress / (achievement.total || 1)) * 100}
                          className="h-2"
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">🔒 Locked</div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Global Leaderboard
              </CardTitle>
              <CardDescription>Top performers this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockLeaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      entry.name === 'You' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 font-bold text-lg">
                      {entry.rank === 1 ? (
                        <Crown className="w-6 h-6 text-amber-500" />
                      ) : entry.rank === 2 ? (
                        <Medal className="w-6 h-6 text-gray-400" />
                      ) : entry.rank === 3 ? (
                        <Medal className="w-6 h-6 text-orange-600" />
                      ) : (
                        <span className="text-gray-600">#{entry.rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {entry.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{entry.name}</span>
                        {entry.name === 'You' && (
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {entry.achievements} achievements
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-900">
                        {entry.points.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        {entry.trend === 'up' && (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        )}
                        {entry.trend === 'down' && (
                          <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                        )}
                        {entry.trendChange && (
                          <span
                            className={
                              entry.trend === 'up' ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            {entry.trendChange}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Your Balance</h3>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {userStats.totalPoints.toLocaleString()} points
                  </p>
                </div>
                <Gift className="w-16 h-16 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRewards.map((reward) => {
              const Icon = reward.icon;
              const canAfford = userStats.totalPoints >= reward.pointsCost;
              
              return (
                <Card
                  key={reward.id}
                  className={`${!reward.available || !canAfford ? 'opacity-60' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 rounded-lg ${
                            canAfford && reward.available
                              ? 'bg-gradient-to-br from-purple-500 to-blue-500'
                              : 'bg-gray-300'
                          } text-white`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{reward.name}</CardTitle>
                          <Badge
                            variant="secondary"
                            className="text-xs mt-1 capitalize"
                          >
                            {reward.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {reward.description}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-600 text-lg px-3 py-1">
                        <Star className="w-4 h-4 mr-1" />
                        {reward.pointsCost}
                      </Badge>
                      <Button
                        size="sm"
                        disabled={!canAfford || !reward.available}
                        className="gap-1"
                      >
                        {!reward.available ? (
                          'Coming Soon'
                        ) : !canAfford ? (
                          'Not Enough Points'
                        ) : (
                          <>
                            <Gift className="w-4 h-4" />
                            Redeem
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Trophy className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-amber-900">Gamification System</div>
              <div className="text-sm text-amber-700 mt-1">
                Earn points by completing tasks, unlocking achievements, and maintaining streaks.
                Compete with teammates on the leaderboard and redeem points for exclusive rewards!
                Points reset annually, but achievements are permanent.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
