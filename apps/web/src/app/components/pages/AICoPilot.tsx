import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Brain,
  Send,
  Sparkles,
  Zap,
  Wand2,
  Bot,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Command,
  Lightbulb,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
  Settings,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  suggestions?: string[];
  action?: {
    type: string;
    label: string;
    data?: any;
  };
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  status: 'active' | 'paused' | 'draft';
  lastRun?: string;
  runs: number;
}

interface Suggestion {
  id: string;
  type: 'optimization' | 'allocation' | 'risk' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actions: string[];
}

const mockWorkflows: Workflow[] = [];

const mockSuggestions: Suggestion[] = [];

const quickCommands = [
  { command: 'Show me available developers', icon: Users },
  { command: 'What\'s my team utilization?', icon: TrendingUp },
  { command: 'Find resources for Project Alpha', icon: Sparkles },
  { command: 'Approve all pending requests', icon: CheckCircle2 },
  { command: 'Show capacity forecast for Q2', icon: Calendar },
  { command: 'Create a new resource pool', icon: Plus },
];

export function AICoPilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI Co-Pilot. I can help you with resource management, capacity planning, approvals, and more. What would you like to do today?',
      timestamp: new Date().toLocaleTimeString(),
      suggestions: [
        'Show me pending approvals',
        'What\'s the team utilization?',
        'Find resources for a project',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // Both workflows and suggestions are pulled from the generic /insights
  // store. Each insight's `data` blob is merged into the local shape.
  useEffect(() => {
    Promise.all([
      api.get<{ _id: string; title: string; data: Record<string, unknown> }[]>('/insights?type=copilot-workflow').catch(() => []),
      api.get<{ _id: string; title: string; data: Record<string, unknown> }[]>('/insights?type=copilot-suggestion').catch(() => []),
    ]).then(([wfs, sugs]) => {
      setWorkflows((Array.isArray(wfs) ? wfs : []).map((w) => ({
        id: w._id, name: w.title, ...(w.data as object),
      } as unknown as Workflow)))
      setSuggestions((Array.isArray(sugs) ? sugs : []).map((s) => ({
        id: s._id, title: s.title, ...(s.data as object),
      } as unknown as Suggestion)))
    })
  }, []);

  const handleSendMessage = async (message?: string) => {
    const messageText = message || input;
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        type: 'ai',
        content: generateAIResponse(messageText),
        timestamp: new Date().toLocaleTimeString(),
        suggestions: [
          'Show more details',
          'Export this data',
          'What else can you help with?',
        ],
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('utilization') || lowerInput.includes('capacity')) {
      return '📊 Current team utilization is at 78.5%, which is healthy. Here\'s the breakdown:\n\n• Frontend Team: 82% (near optimal)\n• Backend Team: 76% (good)\n• DevOps: 91% (⚠️ high - consider rebalancing)\n• QA Team: 65% (capacity available)\n\nWould you like me to suggest optimizations?';
    }
    
    if (lowerInput.includes('approval') || lowerInput.includes('pending')) {
      return '✅ You have 3 pending approvals:\n\n1. Sarah Mitchell → Digital Transformation (85% match)\n2. Michael Chen → Cloud Migration (92% match)\n3. Emma Davis → Mobile App (78% match)\n\nI recommend approving all three based on skills match and availability. Would you like to proceed?';
    }
    
    if (lowerInput.includes('find') || lowerInput.includes('resource')) {
      return '🔍 I found 8 available resources that match your criteria:\n\n• 3 Senior Developers (React, Node.js)\n• 2 DevOps Engineers (AWS, Kubernetes)\n• 2 UX Designers (Figma, User Research)\n• 1 Product Manager (Agile, Strategy)\n\nTop match: David Brown (95% skills match, 40h available). Shall I create an allocation?';
    }
    
    if (lowerInput.includes('forecast') || lowerInput.includes('predict')) {
      return '📈 Q2 Capacity Forecast:\n\n• Expected demand: +15% increase\n• Current capacity will be at 94% by May\n• Recommended actions:\n  1. Hire 2 senior developers\n  2. Borrow 1 DevOps from TechVentures\n  3. Delay non-critical projects by 2 weeks\n\nWould you like me to initiate any of these actions?';
    }
    
    return '✨ I understand you\'re asking about "' + input + '". I can help with:\n\n• Resource allocation and matching\n• Capacity planning and forecasting\n• Approval workflows\n• Team utilization analysis\n• Budget and cost optimization\n\nWhat specific information do you need?';
  };

  const handleQuickCommand = (command: string) => {
    setInput(command);
    handleSendMessage(command);
  };

  const toggleWorkflow = (id: string) => {
    setWorkflows(workflows.map(w => 
      w.id === id 
        ? { ...w, status: w.status === 'active' ? 'paused' : 'active' }
        : w
    ));
    toast.success(`Workflow ${workflows.find(w => w.id === id)?.status === 'active' ? 'paused' : 'activated'}`);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'optimization': return Sparkles;
      case 'allocation': return Users;
      case 'risk': return AlertCircle;
      case 'opportunity': return Lightbulb;
      default: return Brain;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            AI Co-Pilot
          </h1>
          <p className="text-gray-600 mt-1">
            Natural language commands, automated workflows, and intelligent suggestions
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <Sparkles className="w-3 h-3 mr-1" />
          Powered by AI
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chat Window */}
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-6 h-6 text-purple-600" />
                  <div>
                    <CardTitle>Chat with AI Co-Pilot</CardTitle>
                    <CardDescription>Ask questions in plain English</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-600">Online</span>
                </div>
              </div>
            </CardHeader>
            
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {message.timestamp}
                    </div>
                    
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {message.suggestions.map((suggestion, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            variant="outline"
                            className="text-xs bg-white hover:bg-gray-50"
                            onClick={() => handleQuickCommand(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything... (e.g., 'Show me available developers')"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={() => handleSendMessage()} className="gap-2">
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Command className="w-5 h-5 text-blue-600" />
                Quick Commands
              </CardTitle>
              <CardDescription>Click to execute common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickCommands.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  return (
                    <Button
                      key={idx}
                      variant="outline"
                      className="justify-start h-auto py-3 gap-2"
                      onClick={() => handleQuickCommand(cmd.command)}
                    >
                      <Icon className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">{cmd.command}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - 1 column */}
        <div className="space-y-6">
          {/* AI Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                Intelligent Suggestions
              </CardTitle>
              <CardDescription>AI-powered recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions.map((suggestion) => {
                const TypeIcon = getTypeIcon(suggestion.type);
                return (
                  <div
                    key={suggestion.id}
                    className="p-3 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-4 h-4 text-purple-600" />
                        <Badge className={getImpactColor(suggestion.impact)}>
                          {suggestion.impact} impact
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.confidence}% confidence
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">
                      {suggestion.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-3">
                      {suggestion.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestion.actions.map((action, idx) => (
                        <Button key={idx} size="sm" variant="outline" className="text-xs">
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Automated Workflows */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Automated Workflows
                  </CardTitle>
                  <CardDescription>Active automation rules</CardDescription>
                </div>
                <Button size="sm" variant="outline" className="gap-1">
                  <Plus className="w-3 h-3" />
                  New
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="p-3 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-gray-900">
                          {workflow.name}
                        </h4>
                        <Badge
                          variant={workflow.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {workflow.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {workflow.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>🔄 {workflow.runs} runs</span>
                        <span>⏱️ {workflow.lastRun}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      onClick={() => toggleWorkflow(workflow.id)}
                    >
                      {workflow.status === 'active' ? (
                        <>
                          <Pause className="w-3 h-3" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" /> Activate
                        </>
                      )}
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-purple-900">AI-Powered Assistance</div>
              <div className="text-sm text-purple-700 mt-1">
                The AI Co-Pilot uses machine learning to understand your needs and provide intelligent
                recommendations. It learns from your patterns and can automate repetitive tasks through
                workflows. Try asking questions in natural language!
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
