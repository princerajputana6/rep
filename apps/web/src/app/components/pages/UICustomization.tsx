import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Switch } from '@/app/components/ui/switch';
import { Separator } from '@/app/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Upload,
  Palette,
  Layout,
  Save,
  RotateCcw,
  Eye,
  Settings as SettingsIcon,
  FormInput,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import { CustomFormBuilder } from '@/app/components/pages/CustomFormBuilder';
import { CurrencyMapping } from '@/app/components/pages/CurrencyMapping';

interface BrandingSettings {
  companyName: string;
  companyLogo: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoSize: 'small' | 'medium' | 'large';
}

interface LayoutSettings {
  sidebarPosition: 'left' | 'right';
  sidebarStyle: 'expanded' | 'compact' | 'icons-only';
  headerStyle: 'standard' | 'minimal' | 'prominent';
  cardStyle: 'elevated' | 'flat' | 'bordered';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  density: 'comfortable' | 'compact' | 'spacious';
}

interface WidgetSettings {
  showDashboardStats: boolean;
  showRecentActivity: boolean;
  showPendingApprovals: boolean;
  showProjectHealth: boolean;
  showUtilizationChart: boolean;
  showQuickActions: boolean;
}

export function UICustomization() {
  const [branding, setBranding] = useState<BrandingSettings>({
    companyName: 'REP Platform',
    companyLogo: null,
    primaryColor: '#2563eb',
    secondaryColor: '#7c3aed',
    accentColor: '#10b981',
    logoSize: 'medium'
  });

  const [layout, setLayout] = useState<LayoutSettings>({
    sidebarPosition: 'left',
    sidebarStyle: 'expanded',
    headerStyle: 'standard',
    cardStyle: 'elevated',
    borderRadius: 'medium',
    density: 'comfortable'
  });

  const [widgets, setWidgets] = useState<WidgetSettings>({
    showDashboardStats: true,
    showRecentActivity: true,
    showPendingApprovals: true,
    showProjectHealth: true,
    showUtilizationChart: true,
    showQuickActions: true
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setBranding({ ...branding, companyLogo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = () => {
    localStorage.setItem('rep_branding', JSON.stringify(branding));
    toast.success('Branding settings saved successfully!');
  };

  const handleSaveLayout = () => {
    localStorage.setItem('rep_layout', JSON.stringify(layout));
    toast.success('Layout settings saved successfully!');
  };

  const handleSaveWidgets = () => {
    localStorage.setItem('rep_widgets', JSON.stringify(widgets));
    toast.success('Widget settings saved successfully!');
  };

  const handleResetBranding = () => {
    setBranding({
      companyName: 'REP Platform',
      companyLogo: null,
      primaryColor: '#2563eb',
      secondaryColor: '#7c3aed',
      accentColor: '#10b981',
      logoSize: 'medium'
    });
    setLogoPreview(null);
    toast.success('Branding settings reset to default');
  };

  const presetThemes = [
    { name: 'Ocean Blue', primary: '#2563eb', secondary: '#0ea5e9', accent: '#06b6d4' },
    { name: 'Forest Green', primary: '#059669', secondary: '#10b981', accent: '#34d399' },
    { name: 'Royal Purple', primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' },
    { name: 'Sunset Orange', primary: '#ea580c', secondary: '#f97316', accent: '#fb923c' },
    { name: 'Ruby Red', primary: '#dc2626', secondary: '#ef4444', accent: '#f87171' },
    { name: 'Slate Gray', primary: '#475569', secondary: '#64748b', accent: '#94a3b8' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
          <Palette className="w-8 h-8 text-purple-600" />
          UI Customization
        </h1>
        <p className="text-gray-600 mt-1">
          Customize your REP Platform experience with branding, layout, and widget preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full max-w-4xl grid-cols-5">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="widgets" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            Widgets
          </TabsTrigger>
          <TabsTrigger value="forms" className="flex items-center gap-2">
            <FormInput className="w-4 h-4" />
            Custom Forms
          </TabsTrigger>
          <TabsTrigger value="currency" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Currency
          </TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Identity</CardTitle>
                  <CardDescription>
                    Upload your company logo and set your brand name
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={branding.companyName}
                      onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label>Company Logo</Label>
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                          <input
                            type="file"
                            id="logo-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoUpload}
                          />
                          <label htmlFor="logo-upload" className="cursor-pointer">
                            {logoPreview ? (
                              <div className="space-y-2">
                                <img
                                  src={logoPreview}
                                  alt="Logo preview"
                                  className="mx-auto h-24 object-contain"
                                />
                                <p className="text-sm text-gray-600">Click to change logo</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    Click to upload logo
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    PNG, JPG, SVG up to 5MB
                                  </p>
                                </div>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logo-size">Logo Size</Label>
                      <Select
                        value={branding.logoSize}
                        onValueChange={(value: 'small' | 'medium' | 'large') =>
                          setBranding({ ...branding, logoSize: value })
                        }
                      >
                        <SelectTrigger id="logo-size">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small (24px)</SelectItem>
                          <SelectItem value="medium">Medium (32px)</SelectItem>
                          <SelectItem value="large">Large (40px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Color Scheme</CardTitle>
                  <CardDescription>
                    Customize your platform's color palette
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="primary-color"
                          value={branding.primaryColor}
                          onChange={(e) =>
                            setBranding({ ...branding, primaryColor: e.target.value })
                          }
                          className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={branding.primaryColor}
                          onChange={(e) =>
                            setBranding({ ...branding, primaryColor: e.target.value })
                          }
                          placeholder="#2563eb"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="secondary-color"
                          value={branding.secondaryColor}
                          onChange={(e) =>
                            setBranding({ ...branding, secondaryColor: e.target.value })
                          }
                          className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={branding.secondaryColor}
                          onChange={(e) =>
                            setBranding({ ...branding, secondaryColor: e.target.value })
                          }
                          placeholder="#7c3aed"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accent-color">Accent Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="accent-color"
                          value={branding.accentColor}
                          onChange={(e) =>
                            setBranding({ ...branding, accentColor: e.target.value })
                          }
                          className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={branding.accentColor}
                          onChange={(e) =>
                            setBranding({ ...branding, accentColor: e.target.value })
                          }
                          placeholder="#10b981"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-3 block">Preset Themes</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {presetThemes.map((theme) => (
                        <button
                          key={theme.name}
                          onClick={() =>
                            setBranding({
                              ...branding,
                              primaryColor: theme.primary,
                              secondaryColor: theme.secondary,
                              accentColor: theme.accent
                            })
                          }
                          className="p-3 border border-gray-200 rounded-lg hover:border-blue-400 transition-colors text-left"
                        >
                          <div className="flex gap-1.5 mb-2">
                            <div
                              className="w-6 h-6 rounded"
                              style={{ backgroundColor: theme.primary }}
                            />
                            <div
                              className="w-6 h-6 rounded"
                              style={{ backgroundColor: theme.secondary }}
                            />
                            <div
                              className="w-6 h-6 rounded"
                              style={{ backgroundColor: theme.accent }}
                            />
                          </div>
                          <p className="text-xs font-medium text-gray-900">{theme.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button onClick={handleSaveBranding} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Branding Settings
                </Button>
                <Button onClick={handleResetBranding} variant="outline" className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset to Default
                </Button>
              </div>
            </div>

            {/* Live Preview */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Logo Preview */}
                  <div
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: '#f9fafb' }}
                  >
                    <div className="flex items-center gap-2">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo"
                          className={`${
                            branding.logoSize === 'small'
                              ? 'h-6'
                              : branding.logoSize === 'large'
                              ? 'h-10'
                              : 'h-8'
                          } object-contain`}
                        />
                      ) : (
                        <div
                          className={`${
                            branding.logoSize === 'small'
                              ? 'w-6 h-6'
                              : branding.logoSize === 'large'
                              ? 'w-10 h-10'
                              : 'w-8 h-8'
                          } rounded-lg flex items-center justify-center`}
                          style={{ backgroundColor: branding.primaryColor }}
                        >
                          <SettingsIcon className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="font-semibold text-gray-900">
                        {branding.companyName}
                      </span>
                    </div>
                  </div>

                  {/* Color Swatches */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Primary</p>
                    <div
                      className="h-12 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      Primary Button
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Secondary</p>
                    <div
                      className="h-12 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                      style={{ backgroundColor: branding.secondaryColor }}
                    >
                      Secondary Button
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Accent</p>
                    <div
                      className="h-12 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                      style={{ backgroundColor: branding.accentColor }}
                    >
                      Success / Accent
                    </div>
                  </div>

                  {/* Sample Card */}
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: branding.primaryColor }}
                      />
                      <p className="text-sm font-medium">Sample Card</p>
                    </div>
                    <p className="text-xs text-gray-600">
                      This is how your themed content will appear in the platform.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout Preferences</CardTitle>
              <CardDescription>
                Customize the visual layout and density of your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sidebar-position">Sidebar Position</Label>
                  <Select
                    value={layout.sidebarPosition}
                    onValueChange={(value: 'left' | 'right') =>
                      setLayout({ ...layout, sidebarPosition: value })
                    }
                  >
                    <SelectTrigger id="sidebar-position">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left Side</SelectItem>
                      <SelectItem value="right">Right Side</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sidebar-style">Sidebar Style</Label>
                  <Select
                    value={layout.sidebarStyle}
                    onValueChange={(value: 'expanded' | 'compact' | 'icons-only') =>
                      setLayout({ ...layout, sidebarStyle: value })
                    }
                  >
                    <SelectTrigger id="sidebar-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expanded">Expanded (Full Width)</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="icons-only">Icons Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="header-style">Header Style</Label>
                  <Select
                    value={layout.headerStyle}
                    onValueChange={(value: 'standard' | 'minimal' | 'prominent') =>
                      setLayout({ ...layout, headerStyle: value })
                    }
                  >
                    <SelectTrigger id="header-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="prominent">Prominent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card-style">Card Style</Label>
                  <Select
                    value={layout.cardStyle}
                    onValueChange={(value: 'elevated' | 'flat' | 'bordered') =>
                      setLayout({ ...layout, cardStyle: value })
                    }
                  >
                    <SelectTrigger id="card-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elevated">Elevated (Shadow)</SelectItem>
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="bordered">Bordered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="border-radius">Border Radius</Label>
                  <Select
                    value={layout.borderRadius}
                    onValueChange={(value: 'none' | 'small' | 'medium' | 'large') =>
                      setLayout({ ...layout, borderRadius: value })
                    }
                  >
                    <SelectTrigger id="border-radius">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Square)</SelectItem>
                      <SelectItem value="small">Small (2px)</SelectItem>
                      <SelectItem value="medium">Medium (6px)</SelectItem>
                      <SelectItem value="large">Large (12px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="density">Content Density</Label>
                  <Select
                    value={layout.density}
                    onValueChange={(value: 'comfortable' | 'compact' | 'spacious') =>
                      setLayout({ ...layout, density: value })
                    }
                  >
                    <SelectTrigger id="density">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSaveLayout} className="gap-2">
            <Save className="w-4 h-4" />
            Save Layout Settings
          </Button>
        </TabsContent>

        {/* Widgets Tab */}
        <TabsContent value="widgets" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Widgets</CardTitle>
              <CardDescription>
                Choose which widgets to display on your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Statistics Cards</p>
                  <p className="text-sm text-gray-600">
                    Show resource, agency, utilization, and revenue stats
                  </p>
                </div>
                <Switch
                  checked={widgets.showDashboardStats}
                  onCheckedChange={(checked) =>
                    setWidgets({ ...widgets, showDashboardStats: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Recent Activity</p>
                  <p className="text-sm text-gray-600">
                    Display recent borrow requests and activity feed
                  </p>
                </div>
                <Switch
                  checked={widgets.showRecentActivity}
                  onCheckedChange={(checked) =>
                    setWidgets({ ...widgets, showRecentActivity: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Pending Approvals Widget</p>
                  <p className="text-sm text-gray-600">
                    Show pending resource approvals requiring action
                  </p>
                </div>
                <Switch
                  checked={widgets.showPendingApprovals}
                  onCheckedChange={(checked) =>
                    setWidgets({ ...widgets, showPendingApprovals: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Project Health Overview</p>
                  <p className="text-sm text-gray-600">
                    Display project status breakdown and health metrics
                  </p>
                </div>
                <Switch
                  checked={widgets.showProjectHealth}
                  onCheckedChange={(checked) =>
                    setWidgets({ ...widgets, showProjectHealth: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Utilization Charts</p>
                  <p className="text-sm text-gray-600">
                    Show utilization trends and role distribution charts
                  </p>
                </div>
                <Switch
                  checked={widgets.showUtilizationChart}
                  onCheckedChange={(checked) =>
                    setWidgets({ ...widgets, showUtilizationChart: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Quick Actions</p>
                  <p className="text-sm text-gray-600">
                    Display quick action buttons for common tasks
                  </p>
                </div>
                <Switch
                  checked={widgets.showQuickActions}
                  onCheckedChange={(checked) =>
                    setWidgets({ ...widgets, showQuickActions: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSaveWidgets} className="gap-2">
            <Save className="w-4 h-4" />
            Save Widget Settings
          </Button>
        </TabsContent>

        {/* Custom Forms Tab */}
        <TabsContent value="forms" className="mt-6">
          <CustomFormBuilder />
        </TabsContent>

        {/* Currency Tab */}
        <TabsContent value="currency" className="mt-6">
          <CurrencyMapping />
        </TabsContent>
      </Tabs>

      {/* Quick Tip */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-purple-900">
                Quick Tip: Real-Time Preview
              </div>
              <div className="text-sm text-purple-700 mt-1">
                Changes to branding and layout will be reflected across the entire platform. 
                Use the preview panel to see how your customizations will look before saving.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
