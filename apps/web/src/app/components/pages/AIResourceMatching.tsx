import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Brain,
  Sparkles,
  TrendingUp,
  Target,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  BarChart3,
  Zap,
  Award,
  RefreshCw,
  BookOpen,
  Calculator,
  Shield,
  Lightbulb,
} from 'lucide-react';
import { Progress } from '@/app/components/ui/progress';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ResourceMatch {
  id: string;
  name: string;
  role: string;
  matchScore: number;
  skills: string[];
  availability: number;
  experience: number;
  costRate: number;
  location: string;
  matchFactors: {
    skillMatch: number;
    experienceMatch: number;
    availabilityMatch: number;
    costEfficiency: number;
    pastPerformance: number;
  };
}

const mockMatches: ResourceMatch[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    role: 'Senior Full Stack Developer',
    matchScore: 95,
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'GraphQL'],
    availability: 100,
    experience: 8,
    costRate: 185,
    location: 'New York, NY',
    matchFactors: {
      skillMatch: 98,
      experienceMatch: 95,
      availabilityMatch: 100,
      costEfficiency: 85,
      pastPerformance: 92,
    },
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Full Stack Developer',
    matchScore: 88,
    skills: ['React', 'Node.js', 'TypeScript', 'Docker', 'MongoDB'],
    availability: 80,
    experience: 6,
    costRate: 155,
    location: 'San Francisco, CA',
    matchFactors: {
      skillMatch: 92,
      experienceMatch: 85,
      availabilityMatch: 80,
      costEfficiency: 95,
      pastPerformance: 88,
    },
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Senior Frontend Developer',
    matchScore: 82,
    skills: ['React', 'Vue.js', 'TypeScript', 'CSS', 'Figma'],
    availability: 60,
    experience: 7,
    costRate: 165,
    location: 'Austin, TX',
    matchFactors: {
      skillMatch: 85,
      experienceMatch: 88,
      availabilityMatch: 60,
      costEfficiency: 88,
      pastPerformance: 90,
    },
  },
];

export function AIResourceMatching() {
  const [projectRequirements, setProjectRequirements] = useState({
    role: 'full-stack-developer',
    skills: ['React', 'Node.js', 'TypeScript'],
    experience: '5',
    availability: '80',
    budget: '170',
    duration: '6',
  });
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState<ResourceMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<ResourceMatch | null>(null);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setMatches(mockMatches);
      setIsSearching(false);
    }, 2000);
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-amber-600 bg-amber-50';
    return 'text-gray-600 bg-gray-50';
  };

  const radarData = selectedMatch ? [
    { factor: 'Skills', value: selectedMatch.matchFactors.skillMatch },
    { factor: 'Experience', value: selectedMatch.matchFactors.experienceMatch },
    { factor: 'Availability', value: selectedMatch.matchFactors.availabilityMatch },
    { factor: 'Cost', value: selectedMatch.matchFactors.costEfficiency },
    { factor: 'Performance', value: selectedMatch.matchFactors.pastPerformance },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-semibold text-gray-900">AI-Powered Resource Matching</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Intelligent resource matching using machine learning algorithms
          </p>
        </div>
        <Badge className="bg-purple-500 text-white gap-1">
          <Sparkles className="w-3 h-3" />
          AI-Powered
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">ML Models Active</p>
                <p className="text-2xl font-semibold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Match Accuracy</p>
                <p className="text-2xl font-semibold text-gray-900">94.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Match Time</p>
                <p className="text-2xl font-semibold text-gray-900">2.3s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-semibold text-gray-900">91%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList>
          <TabsTrigger value="search">Smart Search</TabsTrigger>
          <TabsTrigger value="history">Match History</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="methodology">How It Works</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search Criteria */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Project Requirements</CardTitle>
                <CardDescription>Define your resource needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={projectRequirements.role}
                    onValueChange={(value) =>
                      setProjectRequirements({ ...projectRequirements, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-stack-developer">Full Stack Developer</SelectItem>
                      <SelectItem value="frontend-developer">Frontend Developer</SelectItem>
                      <SelectItem value="backend-developer">Backend Developer</SelectItem>
                      <SelectItem value="devops-engineer">DevOps Engineer</SelectItem>
                      <SelectItem value="data-scientist">Data Scientist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Required Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {projectRequirements.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <Input placeholder="Add skill..." />
                </div>

                <div className="space-y-2">
                  <Label>Min. Experience (years)</Label>
                  <Input
                    type="number"
                    value={projectRequirements.experience}
                    onChange={(e) =>
                      setProjectRequirements({ ...projectRequirements, experience: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Min. Availability (%)</Label>
                  <Input
                    type="number"
                    value={projectRequirements.availability}
                    onChange={(e) =>
                      setProjectRequirements({
                        ...projectRequirements,
                        availability: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max. Hourly Rate ($)</Label>
                  <Input
                    type="number"
                    value={projectRequirements.budget}
                    onChange={(e) =>
                      setProjectRequirements({ ...projectRequirements, budget: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duration (months)</Label>
                  <Input
                    type="number"
                    value={projectRequirements.duration}
                    onChange={(e) =>
                      setProjectRequirements({ ...projectRequirements, duration: e.target.value })
                    }
                  />
                </div>

                <Button onClick={handleSearch} className="w-full gap-2" disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Find Matches
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Match Results */}
            <div className="lg:col-span-2 space-y-4">
              {matches.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Brain className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Ready to Find Your Perfect Match
                    </h3>
                    <p className="text-gray-600 text-center max-w-md">
                      Define your project requirements and let our AI find the best resources for your
                      needs
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Matches ({matches.length})</CardTitle>
                      <CardDescription>
                        Ranked by AI confidence score and multiple factors
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {matches.map((match) => (
                        <div
                          key={match.id}
                          className="p-4 border rounded-lg hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => setSelectedMatch(match)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{match.name}</h4>
                                {match.matchScore >= 90 && (
                                  <Badge className="bg-green-500 gap-1">
                                    <Award className="w-3 h-3" />
                                    Top Match
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{match.role}</p>
                              <p className="text-xs text-gray-500 mt-1">{match.location}</p>
                            </div>
                            <div className="text-right">
                              <div
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getMatchColor(
                                  match.matchScore
                                )}`}
                              >
                                <Target className="w-4 h-4" />
                                {match.matchScore}% Match
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Skills</div>
                              <div className="flex flex-wrap gap-1">
                                {match.skills.map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-gray-600">Experience</div>
                                <div className="font-semibold">{match.experience} years</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Availability</div>
                                <div className="font-semibold">{match.availability}%</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Rate</div>
                                <div className="font-semibold">${match.costRate}/hr</div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Overall Match Score</span>
                                <span className="font-semibold">{match.matchScore}%</span>
                              </div>
                              <Progress value={match.matchScore} className="h-2" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>

          {/* Detailed Match Analysis */}
          {selectedMatch && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Match Analysis: {selectedMatch.name}
                </CardTitle>
                <CardDescription>Detailed breakdown of match factors</CardDescription>
              </CardHeader>
              <CardContent className="bg-white rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-4">Match Factor Breakdown</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="factor" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Match Score"
                          dataKey="value"
                          stroke="#9333ea"
                          fill="#9333ea"
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Skill Match</span>
                        <span className="font-semibold">
                          {selectedMatch.matchFactors.skillMatch}%
                        </span>
                      </div>
                      <Progress value={selectedMatch.matchFactors.skillMatch} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Experience Match</span>
                        <span className="font-semibold">
                          {selectedMatch.matchFactors.experienceMatch}%
                        </span>
                      </div>
                      <Progress
                        value={selectedMatch.matchFactors.experienceMatch}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Availability Match</span>
                        <span className="font-semibold">
                          {selectedMatch.matchFactors.availabilityMatch}%
                        </span>
                      </div>
                      <Progress
                        value={selectedMatch.matchFactors.availabilityMatch}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Cost Efficiency</span>
                        <span className="font-semibold">
                          {selectedMatch.matchFactors.costEfficiency}%
                        </span>
                      </div>
                      <Progress value={selectedMatch.matchFactors.costEfficiency} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Past Performance</span>
                        <span className="font-semibold">
                          {selectedMatch.matchFactors.pastPerformance}%
                        </span>
                      </div>
                      <Progress value={selectedMatch.matchFactors.pastPerformance} className="h-2" />
                    </div>

                    <div className="pt-4 border-t">
                      <Button className="w-full gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Request Resource
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
              <CardDescription>History of AI-powered resource matches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">Project Alpha - Senior Developer</p>
                        <p className="text-xs text-gray-600">Matched 3 candidates • 2 days ago</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500">Completed</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Performance Insights
              </CardTitle>
              <CardDescription>Model performance and optimization metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold">Model Accuracy</h4>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">94.5%</p>
                  <p className="text-sm text-purple-600 mt-1">↑ 2.3% from last month</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold">Processing Speed</h4>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">2.3s</p>
                  <p className="text-sm text-blue-600 mt-1">Average match time</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold">Success Rate</h4>
                  </div>
                  <p className="text-3xl font-bold text-green-900">91%</p>
                  <p className="text-sm text-green-600 mt-1">Accepted matches</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methodology" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                How It Works
              </CardTitle>
              <CardDescription>Understanding the AI matching process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Our AI-powered resource matching system uses advanced machine learning algorithms to
                  analyze and match project requirements with the most suitable resources. The process
                  involves several key steps:
                </p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    <strong>Input Project Requirements:</strong> Define the role, skills, experience,
                    availability, budget, and duration for your project.
                  </li>
                  <li>
                    <strong>Data Analysis:</strong> The system analyzes a vast database of resources,
                    including their skills, experience, availability, cost rates, and past performance.
                  </li>
                  <li>
                    <strong>Match Scoring:</strong> Based on the input criteria, the system calculates a
                    match score for each resource, considering factors such as skill match, experience
                    match, availability match, cost efficiency, and past performance.
                  </li>
                  <li>
                    <strong>Ranking:</strong> Resources are ranked based on their match scores, with the
                    highest scores appearing first in the results.
                  </li>
                  <li>
                    <strong>Match Analysis:</strong> Detailed breakdown of match factors is provided for
                    each resource, allowing you to understand the reasoning behind the match scores.
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}