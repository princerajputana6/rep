import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Pin,
  Command,
  Palette,
  Layout,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Grid3x3,
} from 'lucide-react';

export function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('rep_welcome_seen');
    if (!hasSeenWelcome) {
      setOpen(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('rep_welcome_seen', 'true');
    setOpen(false);
  };

  const steps = [
    {
      icon: Sparkles,
      title: 'Welcome to REP Platform',
      description:
        'Your comprehensive Resource and Engagement Platform for multi-agency resource management and collaboration.',
      features: [
        'Multi-tenant service plan architecture',
        'Cross-agency resource sharing and borrowing',
        'Real-time capacity utilization tracking',
        'Financial intelligence with margin tracking',
        'Workfront integration for project data',
      ],
    },
    {
      icon: Grid3x3,
      title: 'Waffle Menu - All Apps in One Place',
      description:
        'Click the grid icon (⋮⋮⋮) in the top right corner to access all platform features and tools in one organized menu.',
      features: [
        'Featured apps for quick access',
        'Search across all available apps',
        'Organized by category',
        'View badge notifications',
        'Switch between Featured and All Apps view',
      ],
    },
    {
      icon: Pin,
      title: 'Pin Your Favorite Pages',
      description:
        'Quick access to frequently used pages directly in the header for maximum productivity.',
      features: [
        'Click "Pin Page" button in the header',
        'Select up to 6 favorite pages',
        'One-click navigation to pinned pages',
        'Remove pins anytime with hover action',
      ],
    },
    {
      icon: Command,
      title: 'Command Menu - Quick Navigation',
      description:
        'Press Cmd+K (Mac) or Ctrl+K (Windows) to open the command menu for lightning-fast navigation.',
      features: [
        'Instant search across all pages',
        'Keyboard shortcuts for power users',
        'Categorized command groups',
        'Search by keywords and synonyms',
      ],
    },
    {
      icon: Palette,
      title: 'Customize Your Experience',
      description:
        'Personalize the platform with your company branding, colors, and layout preferences.',
      features: [
        'Upload your company logo',
        'Choose from preset color themes',
        'Customize sidebar and header styles',
        'Configure widget visibility',
        'Access settings via sidebar menu',
      ],
    },
  ];

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComplete}
              className="text-gray-500"
            >
              Skip tour
            </Button>
          </div>
          <div className="flex items-start gap-4 mt-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <StepIcon className="w-6 h-6 text-blue-700" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{currentStepData.title}</DialogTitle>
              <DialogDescription className="mt-2 text-base">
                {currentStepData.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          <ul className="space-y-3">
            {currentStepData.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 py-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-blue-600'
                  : index < currentStep
                  ? 'w-2 bg-blue-400'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        <DialogFooter>
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)} className="gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Get Started
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}