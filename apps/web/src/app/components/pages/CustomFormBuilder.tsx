import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  FormInput,
  Plus,
  Trash2,
  Edit,
  Copy,
  X,
  GripVertical,
  Play,
  Download,
  Type,
  Hash,
  Mail,
  Calendar as CalendarIcon,
  CheckSquare,
  List,
  ToggleLeft,
  Save,
  Eye,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

interface FormField {
  id: string;
  type: 'text' | 'number' | 'email' | 'date' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];  // For select/radio
}

interface CustomForm {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  createdAt: string;
  usageCount: number;
}

const fieldTypes = [
  { value: 'text', label: 'Text Input', icon: Type },
  { value: 'number', label: 'Number Input', icon: Hash },
  { value: 'email', label: 'Email Input', icon: Mail },
  { value: 'date', label: 'Date Picker', icon: CalendarIcon },
  { value: 'textarea', label: 'Text Area', icon: FileText },
  { value: 'select', label: 'Dropdown', icon: List },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { value: 'radio', label: 'Radio Buttons', icon: ToggleLeft },
];

export function CustomFormBuilder() {
  const [forms, setForms] = useState<CustomForm[]>([
    {
      id: '1',
      name: 'Resource Intake Form',
      description: 'Capture new resource information for onboarding',
      fields: [
        { id: 'f1', type: 'text', label: 'Full Name', required: true },
        { id: 'f2', type: 'email', label: 'Email Address', required: true },
        { id: 'f3', type: 'select', label: 'Role', required: true, options: ['Developer', 'Designer', 'Manager'] },
      ],
      createdAt: '2025-02-10',
      usageCount: 45,
    },
  ]);

  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingForm, setEditingForm] = useState<CustomForm | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `f${Date.now()}`,
      type,
      label: `New ${type} Field`,
      required: false,
      options: type === 'select' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined,
    };
    setFormFields([...formFields, newField]);
    setSelectedFieldId(newField.id);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormFields(formFields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  const removeField = (fieldId: string) => {
    setFormFields(formFields.filter(f => f.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  const duplicateField = (fieldId: string) => {
    const field = formFields.find(f => f.id === fieldId);
    if (field) {
      const newField = { ...field, id: `f${Date.now()}`, label: `${field.label} (Copy)` };
      setFormFields([...formFields, newField]);
    }
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const index = formFields.findIndex(f => f.id === fieldId);
    if (index === -1) return;
    
    const newFields = [...formFields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < formFields.length) {
      [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
      setFormFields(newFields);
    }
  };

  const saveForm = () => {
    if (!formName || formFields.length === 0) {
      toast.error('Please provide a form name and at least one field');
      return;
    }

    const newForm: CustomForm = {
      id: editingForm?.id || `form${Date.now()}`,
      name: formName,
      description: formDescription,
      fields: formFields,
      createdAt: editingForm?.createdAt || new Date().toISOString().split('T')[0],
      usageCount: editingForm?.usageCount || 0,
    };

    if (editingForm) {
      setForms(forms.map(f => f.id === editingForm.id ? newForm : f));
      toast.success('Form updated successfully!');
    } else {
      setForms([...forms, newForm]);
      toast.success('Form created successfully!');
    }

    resetFormBuilder();
  };

  const resetFormBuilder = () => {
    setShowFormBuilder(false);
    setEditingForm(null);
    setFormName('');
    setFormDescription('');
    setFormFields([]);
    setSelectedFieldId(null);
  };

  const editForm = (form: CustomForm) => {
    setEditingForm(form);
    setFormName(form.name);
    setFormDescription(form.description);
    setFormFields(form.fields);
    setShowFormBuilder(true);
  };

  const deleteForm = (formId: string) => {
    setForms(forms.filter(f => f.id !== formId));
    toast.success('Form deleted successfully');
  };

  const selectedField = formFields.find(f => f.id === selectedFieldId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Custom Form Builder</h2>
          <p className="text-gray-600 mt-1">
            Design custom forms for resource workflows, project intake, and data collection
          </p>
        </div>
        <Button onClick={() => setShowFormBuilder(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Form
        </Button>
      </div>

      {/* Existing Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {forms.map((form) => (
          <Card key={form.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{form.name}</CardTitle>
                  <CardDescription className="mt-1">{form.description}</CardDescription>
                </div>
                <Badge variant="secondary">{form.fields.length} fields</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Created: {form.createdAt}</span>
                <span>{form.usageCount} uses</span>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => editForm(form)}>
                  <Edit className="w-3 h-3" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => {}}>
                  <Copy className="w-3 h-3" />
                  Duplicate
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => deleteForm(form.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Builder Dialog */}
      <Dialog open={showFormBuilder} onOpenChange={setShowFormBuilder}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingForm ? 'Edit Form' : 'Create New Form'}</DialogTitle>
            <DialogDescription>
              Drag and drop fields to build your custom form
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex gap-4">
            {/* Left: Form Settings & Fields Palette */}
            <div className="w-64 space-y-4 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <Label>Form Name</Label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter form name"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="What is this form for?"
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Add Fields</Label>
                <div className="space-y-2">
                  {fieldTypes.map((fieldType) => {
                    const Icon = fieldType.icon;
                    return (
                      <button
                        key={fieldType.value}
                        onClick={() => addField(fieldType.value as FormField['type'])}
                        className="w-full flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-900">{fieldType.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Center: Form Canvas */}
            <div className="flex-1 border rounded-lg p-6 bg-gray-50 overflow-y-auto">
              <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{formName || 'Untitled Form'}</h3>
                  {formDescription && <p className="text-sm text-gray-600 mt-1">{formDescription}</p>}
                </div>

                {formFields.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FormInput className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Add fields from the left panel to start building your form</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formFields.map((field, index) => {
                      const Icon = fieldTypes.find(ft => ft.value === field.type)?.icon || FormInput;
                      const isSelected = selectedFieldId === field.id;

                      return (
                        <div
                          key={field.id}
                          onClick={() => setSelectedFieldId(field.id)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <GripVertical className="w-4 h-4 text-gray-400 mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Icon className="w-4 h-4 text-gray-600" />
                                <Label>{field.label}</Label>
                                {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                              </div>
                              {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
                                <Input placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} disabled />
                              ) : field.type === 'textarea' ? (
                                <Textarea placeholder={field.placeholder} rows={3} disabled />
                              ) : field.type === 'select' ? (
                                <Select disabled>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select an option" />
                                  </SelectTrigger>
                                </Select>
                              ) : field.type === 'checkbox' ? (
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" disabled />
                                  <span className="text-sm text-gray-600">{field.label}</span>
                                </div>
                              ) : field.type === 'radio' && field.options ? (
                                <div className="space-y-2">
                                  {field.options.map((option, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <input type="radio" name={field.id} disabled />
                                      <span className="text-sm text-gray-600">{option}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                            {isSelected && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => duplicateField(field.id)}>
                                  <Copy className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => removeField(field.id)}>
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Field Properties */}
            <div className="w-64 space-y-4 overflow-y-auto">
              {selectedField ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Field Properties</h4>
                  </div>

                  <div>
                    <Label>Label</Label>
                    <Input
                      value={selectedField.label}
                      onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Placeholder</Label>
                    <Input
                      value={selectedField.placeholder || ''}
                      onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                      placeholder="Enter placeholder text"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label>Required Field</Label>
                    <input
                      type="checkbox"
                      checked={selectedField.required}
                      onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                      className="w-4 h-4"
                    />
                  </div>

                  {(selectedField.type === 'select' || selectedField.type === 'radio') && (
                    <div>
                      <Label>Options</Label>
                      <div className="space-y-2 mt-2">
                        {selectedField.options?.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(selectedField.options || [])];
                                newOptions[index] = e.target.value;
                                updateField(selectedField.id, { options: newOptions });
                              }}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const newOptions = selectedField.options?.filter((_, i) => i !== index);
                                updateField(selectedField.id, { options: newOptions });
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            const newOptions = [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`];
                            updateField(selectedField.id, { options: newOptions });
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <FormInput className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Select a field to edit its properties</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPreview(true)} className="gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export JSON
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetFormBuilder}>
                Cancel
              </Button>
              <Button onClick={saveForm} className="gap-2">
                <Save className="w-4 h-4" />
                Save Form
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FormInput className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900">Custom Form Use Cases</div>
              <div className="text-sm text-blue-700 mt-1">
                • Resource Onboarding Forms • Project Intake Requests • Skill Assessment Forms • 
                Client Information Collection • Custom Approval Workflows • Capacity Planning Surveys
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
