import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
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
import { Grid3x3, Edit, Trash2, Copy, Search, Plus, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface CampaignTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  duration: string;
  teamSize: string;
  budgetRange: string;
  requiredSkills: string[];
  optionalSkills: string[];
  createdBy: string;
  createdDate: string;
  isPublic: boolean;
  usageCount: number;
}

interface TemplateManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: CampaignTemplate[];
  onUseTemplate: (template: CampaignTemplate) => void;
  onEditTemplate?: (template: CampaignTemplate) => void;
  onDeleteTemplate?: (templateId: string) => void;
  onDuplicateTemplate?: (template: CampaignTemplate) => void;
}

export function TemplateManager({
  open,
  onOpenChange,
  templates,
  onUseTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
}: TemplateManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUseTemplate = (template: CampaignTemplate) => {
    onUseTemplate(template);
    onOpenChange(false);
    toast.success(`Using template: ${template.name}`);
  };

  const handleEditTemplate = (template: CampaignTemplate) => {
    if (onEditTemplate) {
      onEditTemplate(template);
      toast.info(`Editing template: ${template.name}`);
    }
  };

  const handleDeleteTemplate = (template: CampaignTemplate) => {
    if (onDeleteTemplate) {
      if (confirm(`Delete template "${template.name}"? This cannot be undone.`)) {
        onDeleteTemplate(template.id);
        toast.success('Template deleted successfully');
      }
    }
  };

  const handleDuplicateTemplate = (template: CampaignTemplate) => {
    if (onDuplicateTemplate) {
      onDuplicateTemplate(template);
      toast.success('Template duplicated successfully');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-purple-600" />
            Template Manager
          </DialogTitle>
          <DialogDescription>
            Manage, edit, and use campaign templates • {templates.length} templates available
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Template
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Total Templates</div>
                <div className="text-2xl font-bold mt-1">{templates.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Public Templates</div>
                <div className="text-2xl font-bold mt-1">
                  {templates.filter(t => t.isPublic).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Total Usage</div>
                <div className="text-2xl font-bold mt-1">
                  {templates.reduce((sum, t) => sum + t.usageCount, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Templates Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Team Size</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No templates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {template.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{template.teamSize}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{template.duration}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{template.usageCount}x</div>
                      </TableCell>
                      <TableCell>
                        {template.isPublic ? (
                          <Badge className="bg-green-500 gap-1">
                            <Share2 className="w-3 h-3" />
                            Public
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Private</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUseTemplate(template)}
                            title="Use Template"
                          >
                            <Plus className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicateTemplate(template)}
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
