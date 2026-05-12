import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { 
  Save, 
  Trash2, 
  Download, 
  Plus,
  GitCompare,
  Calendar,
  DollarSign,
  Users,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  createdDate: string;
  inputs: {
    budget: number;
    teamSize: number;
    duration: number;
  };
  results: {
    estimatedCost: number;
    timeToComplete: number;
    riskScore: number;
    successProbability: number;
    resourceUtilization: number;
  };
}

interface SimulationManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenarios: SimulationScenario[];
  onSaveScenario: (scenario: Omit<SimulationScenario, 'id' | 'createdDate'>) => void;
  onDeleteScenario: (scenarioId: string) => void;
  onLoadScenario: (scenario: SimulationScenario) => void;
  onCompareScenarios: (scenarioIds: string[]) => void;
  currentSimulation?: {
    budget: number;
    teamSize: number;
    duration: number;
  };
}

export function SimulationManager({
  open,
  onOpenChange,
  scenarios,
  onSaveScenario,
  onDeleteScenario,
  onLoadScenario,
  onCompareScenarios,
  currentSimulation,
}: SimulationManagerProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const handleSaveCurrentSimulation = () => {
    if (!scenarioName) {
      toast.error('Please enter a scenario name');
      return;
    }

    if (!currentSimulation) {
      toast.error('No active simulation to save');
      return;
    }

    // Calculate mock results based on inputs
    const results = {
      estimatedCost: currentSimulation.budget * 0.85,
      timeToComplete: currentSimulation.duration * 1.1,
      riskScore: Math.random() * 100,
      successProbability: 75 + Math.random() * 20,
      resourceUtilization: 65 + Math.random() * 30,
    };

    onSaveScenario({
      name: scenarioName,
      description: scenarioDescription,
      inputs: currentSimulation,
      results,
    });

    setShowSaveDialog(false);
    setScenarioName('');
    setScenarioDescription('');
    toast.success('Simulation scenario saved!');
  };

  const handleDeleteScenario = (scenarioId: string, scenarioName: string) => {
    if (confirm(`Delete scenario "${scenarioName}"?`)) {
      onDeleteScenario(scenarioId);
      toast.success('Scenario deleted');
    }
  };

  const handleExportScenario = (scenario: SimulationScenario) => {
    const dataStr = JSON.stringify(scenario, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-${scenario.name.replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Scenario exported!');
  };

  const handleToggleCompare = (scenarioId: string) => {
    if (selectedForCompare.includes(scenarioId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== scenarioId));
    } else {
      if (selectedForCompare.length >= 3) {
        toast.error('You can compare maximum 3 scenarios at once');
        return;
      }
      setSelectedForCompare([...selectedForCompare, scenarioId]);
    }
  };

  const handleCompare = () => {
    if (selectedForCompare.length < 2) {
      toast.error('Select at least 2 scenarios to compare');
      return;
    }
    onCompareScenarios(selectedForCompare);
    onOpenChange(false);
  };

  return (
    <>
      {/* Main Manager Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Simulation Scenario Manager
            </DialogTitle>
            <DialogDescription>
              Save, load, and compare simulation scenarios • {scenarios.length} saved scenarios
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedForCompare.length > 0 && (
                  <Badge variant="secondary">
                    {selectedForCompare.length} selected for comparison
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {selectedForCompare.length >= 2 && (
                  <Button onClick={handleCompare} className="gap-2">
                    <GitCompare className="w-4 h-4" />
                    Compare Selected
                  </Button>
                )}
                <Button onClick={() => setShowSaveDialog(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Save Current Simulation
                </Button>
              </div>
            </div>

            {/* Scenarios List */}
            {scenarios.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <div className="font-semibold text-gray-900 mb-2">No saved scenarios</div>
                  <div className="text-sm text-gray-600 mb-4">
                    Run a simulation and save it to compare different scenarios
                  </div>
                  <Button onClick={() => setShowSaveDialog(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Save First Scenario
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          disabled
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead>Scenario Name</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Team Size</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Est. Cost</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scenarios.map((scenario) => (
                      <TableRow key={scenario.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedForCompare.includes(scenario.id)}
                            onChange={() => handleToggleCompare(scenario.id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{scenario.name}</div>
                            {scenario.description && (
                              <div className="text-xs text-gray-600 mt-1">
                                {scenario.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <DollarSign className="w-3 h-3 text-gray-500" />
                            ${(scenario.inputs.budget / 1000).toFixed(0)}K
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="w-3 h-3 text-gray-500" />
                            {scenario.inputs.teamSize}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3 text-gray-500" />
                            {scenario.inputs.duration} days
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            ${(scenario.results.estimatedCost / 1000).toFixed(0)}K
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            scenario.results.successProbability >= 80 ? 'bg-green-500' :
                            scenario.results.successProbability >= 60 ? 'bg-blue-500' :
                            'bg-amber-500'
                          }>
                            {scenario.results.successProbability.toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-gray-600">
                            {new Date(scenario.createdDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onLoadScenario(scenario)}
                              title="Load Scenario"
                            >
                              <BarChart3 className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExportScenario(scenario)}
                              title="Export"
                            >
                              <Download className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteScenario(scenario.id, scenario.name)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Scenario Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Save Simulation Scenario</DialogTitle>
            <DialogDescription>
              Save the current simulation for future reference and comparison
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Simulation Preview */}
            {currentSimulation && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm font-semibold text-purple-900 mb-2">Current Simulation</div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-purple-700">Budget</div>
                    <div className="font-medium text-purple-900">
                      ${(currentSimulation.budget / 1000).toFixed(0)}K
                    </div>
                  </div>
                  <div>
                    <div className="text-purple-700">Team Size</div>
                    <div className="font-medium text-purple-900">
                      {currentSimulation.teamSize} members
                    </div>
                  </div>
                  <div>
                    <div className="text-purple-700">Duration</div>
                    <div className="font-medium text-purple-900">
                      {currentSimulation.duration} days
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scenario Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Scenario Name *</label>
              <Input
                placeholder="e.g., High Budget - Large Team"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                placeholder="Add notes about this scenario..."
                value={scenarioDescription}
                onChange={(e) => setScenarioDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCurrentSimulation} className="gap-2">
              <Save className="w-4 h-4" />
              Save Scenario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
