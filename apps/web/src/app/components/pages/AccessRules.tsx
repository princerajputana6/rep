import { useState, useEffect, useCallback } from 'react'
import { Shield, RotateCcw, Save, Info, Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { accessRulesService, type AccessRule, type ObjectMeta, type BulkUpdateItem } from '@/app/services/accessRulesService'
import { toast } from 'sonner'

// ─────────────────────────────────────────────
// Types & constants
// ─────────────────────────────────────────────

type Permission = 'canCreate' | 'canView' | 'canUpdate' | 'canDelete' | 'canShare'

const PERMISSIONS: { key: Permission; label: string; short: string; color: string }[] = [
  { key: 'canCreate', label: 'Create', short: 'C', color: 'text-emerald-600' },
  { key: 'canView',   label: 'View',   short: 'V', color: 'text-blue-600'   },
  { key: 'canUpdate', label: 'Update', short: 'U', color: 'text-amber-600'  },
  { key: 'canDelete', label: 'Delete', short: 'D', color: 'text-red-600'    },
  { key: 'canShare',  label: 'Share',  short: 'S', color: 'text-purple-600' },
]

const ROLE_META: Record<string, { label: string; description: string; color: string; bg: string }> = {
  AGENCY_OWNER: {
    label: 'Agency Owner',
    description: 'Full administrative control over the agency',
    color: 'text-violet-700',
    bg: 'bg-violet-50 border-violet-200',
  },
  RESOURCE_MANAGER: {
    label: 'Resource Manager',
    description: 'Manages resources, projects and allocations',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
  },
  VIEWER: {
    label: 'Viewer',
    description: 'Read-only access to operational data',
    color: 'text-gray-700',
    bg: 'bg-gray-50 border-gray-200',
  },
}

// ─────────────────────────────────────────────
// Toggle cell
// ─────────────────────────────────────────────

function PermToggle({
  value,
  onChange,
  color,
  disabled,
}: {
  value: boolean
  onChange: (v: boolean) => void
  color: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
        ${value
          ? `bg-current/10 ${color} ring-1 ring-current/30`
          : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
        }`}
      title={value ? 'Allowed — click to deny' : 'Denied — click to allow'}
    >
      {value
        ? <Check className="w-4 h-4" strokeWidth={2.5} />
        : <X className="w-4 h-4" strokeWidth={2} />
      }
    </button>
  )
}

// ─────────────────────────────────────────────
// Object row
// ─────────────────────────────────────────────

function ObjectRow({
  obj,
  rule,
  isOwner,
  onChange,
}: {
  obj: ObjectMeta
  rule: Record<Permission, boolean>
  isOwner: boolean
  onChange: (perm: Permission, value: boolean) => void
}) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
      <td className="py-2.5 px-4">
        <span className="text-sm font-medium text-gray-800">{obj.label}</span>
        <span className="ml-2 text-xs text-gray-400 font-mono">{obj.code}</span>
      </td>
      {PERMISSIONS.map(({ key, color }) => (
        <td key={key} className="py-2.5 px-2 text-center">
          <PermToggle
            value={rule[key]}
            onChange={(v) => onChange(key, v)}
            color={color}
            disabled={isOwner}
          />
        </td>
      ))}
    </tr>
  )
}

// ─────────────────────────────────────────────
// Category section
// ─────────────────────────────────────────────

function CategorySection({
  category,
  objects,
  rules,
  isOwner,
  onToggle,
}: {
  category: string
  objects: ObjectMeta[]
  rules: Map<string, Record<Permission, boolean>>
  isOwner: boolean
  onToggle: (objectCode: string, perm: Permission, value: boolean) => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <tbody>
      <tr
        className="bg-gray-100 cursor-pointer select-none hover:bg-gray-150"
        onClick={() => setOpen((o) => !o)}
      >
        <td colSpan={6} className="py-2 px-4">
          <div className="flex items-center gap-2">
            {open ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{category}</span>
            <span className="text-xs text-gray-400">({objects.length} objects)</span>
          </div>
        </td>
      </tr>
      {open && objects.map((obj) => {
        const rule = rules.get(obj.code) ?? { canCreate: false, canView: false, canUpdate: false, canDelete: false, canShare: false }
        return (
          <ObjectRow
            key={obj.code}
            obj={obj}
            rule={rule}
            isOwner={isOwner}
            onChange={(perm, value) => onToggle(obj.code, perm, value)}
          />
        )
      })}
    </tbody>
  )
}

// ─────────────────────────────────────────────
// Role panel
// ─────────────────────────────────────────────

function RolePanel({
  roleCode,
  objects,
  rules,
  dirty,
  onToggle,
}: {
  roleCode: string
  objects: ObjectMeta[]
  rules: AccessRule[]
  dirty: boolean
  onToggle: (objectCode: string, perm: Permission, value: boolean) => void
}) {
  const meta = ROLE_META[roleCode] ?? { label: roleCode, description: '', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' }
  const isOwner = roleCode === 'AGENCY_OWNER'

  // Build a lookup map: objectCode → permissions
  const ruleMap = new Map<string, Record<Permission, boolean>>()
  for (const r of rules) {
    ruleMap.set(r.objectCode, {
      canCreate: r.canCreate,
      canView:   r.canView,
      canUpdate: r.canUpdate,
      canDelete: r.canDelete,
      canShare:  r.canShare,
    })
  }

  // Group objects by category
  const categories = Array.from(new Set(objects.map((o) => o.category)))

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Role header */}
      <div className={`px-5 py-4 border-b ${meta.bg} flex items-start justify-between`}>
        <div>
          <div className="flex items-center gap-2">
            <Shield className={`w-4 h-4 ${meta.color}`} />
            <h3 className={`font-semibold text-base ${meta.color}`}>{meta.label}</h3>
            {dirty && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Unsaved</span>}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{meta.description}</p>
        </div>
        {isOwner && (
          <span className="flex items-center gap-1 text-xs text-violet-600 bg-violet-100 px-2 py-1 rounded-full font-medium">
            <Info className="w-3 h-3" />
            Always full access
          </span>
        )}
      </div>

      {/* Permission matrix */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="py-2.5 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-64">Object</th>
              {PERMISSIONS.map(({ key, label, short, color }) => (
                <th key={key} className="py-2.5 px-2 text-center w-16">
                  <span className={`text-xs font-semibold ${color} uppercase tracking-wider`} title={label}>{short}</span>
                  <div className="text-xs text-gray-400 font-normal normal-case tracking-normal">{label}</div>
                </th>
              ))}
            </tr>
          </thead>
          {categories.map((cat) => (
            <CategorySection
              key={cat}
              category={cat}
              objects={objects.filter((o) => o.category === cat)}
              rules={ruleMap}
              isOwner={isOwner}
              onToggle={onToggle}
            />
          ))}
        </table>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────

export function AccessRules() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [objects, setObjects] = useState<ObjectMeta[]>([])
  const [rules, setRules] = useState<Map<string, AccessRule[]>>(new Map())
  const [dirty, setDirty] = useState<Set<string>>(new Set())
  const [activeRole, setActiveRole] = useState('AGENCY_OWNER')
  const configurableRoles = ['AGENCY_OWNER', 'RESOURCE_MANAGER', 'VIEWER']

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await accessRulesService.getAll()
      setObjects(data.objects)
      const map = new Map<string, AccessRule[]>()
      for (const role of data.configurableRoles) {
        map.set(role, data.grouped[role] ?? [])
      }
      setRules(map)
      setDirty(new Set())
    } catch {
      toast.error('Failed to load access rules')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const handleToggle = (roleCode: string, objectCode: string, perm: Permission, value: boolean) => {
    setRules((prev) => {
      const next = new Map(prev)
      const roleRules = (next.get(roleCode) ?? []).map((r) =>
        r.objectCode === objectCode ? { ...r, [perm]: value } : r,
      )
      // If rule doesn't exist yet, create it
      if (!roleRules.find((r) => r.objectCode === objectCode)) {
        roleRules.push({
          id: `${roleCode}:${objectCode}`,
          agencyId: '',
          roleCode,
          objectCode,
          canCreate: false,
          canView: true,
          canUpdate: false,
          canDelete: false,
          canShare: false,
          [perm]: value,
          updatedBy: null,
          updatedAt: new Date().toISOString(),
        })
      }
      next.set(roleCode, roleRules)
      return next
    })
    setDirty((prev) => new Set([...prev, roleCode]))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const items: BulkUpdateItem[] = []
      for (const [roleCode, roleRules] of rules) {
        if (roleCode === 'AGENCY_OWNER') continue // Always full — skip
        for (const r of roleRules) {
          items.push({
            roleCode,
            objectCode: r.objectCode,
            canCreate: r.canCreate,
            canView:   r.canView,
            canUpdate: r.canUpdate,
            canDelete: r.canDelete,
            canShare:  r.canShare,
          })
        }
      }
      await accessRulesService.bulkUpdate(items)
      setDirty(new Set())
      toast.success('Access rules saved successfully')
    } catch {
      toast.error('Failed to save access rules')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Reset all access rules to system defaults? This cannot be undone.')) return
    try {
      setResetting(true)
      await accessRulesService.reset()
      await load()
      toast.success('Access rules reset to defaults')
    } catch {
      toast.error('Failed to reset access rules')
    } finally {
      setResetting(false)
    }
  }

  const hasDirty = dirty.size > 0

  // ── Render ──────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-violet-600" />
            Access Rules
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure Create, View, Update, Delete and Share permissions for each role and object.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={resetting || loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={!hasDirty || saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs text-gray-600">
        <span className="font-medium text-gray-700">Legend:</span>
        {PERMISSIONS.map(({ key, label, short, color }) => (
          <span key={key} className="flex items-center gap-1">
            <span className={`font-bold ${color}`}>{short}</span>
            <span>= {label}</span>
          </span>
        ))}
        <span className="ml-auto flex items-center gap-1 text-gray-400">
          <Check className="w-3.5 h-3.5 text-emerald-500" /> Allowed
          <span className="mx-1">·</span>
          <X className="w-3.5 h-3.5 text-gray-400" /> Denied
        </span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">Loading access rules…</div>
      ) : (
        <>
          {/* Role tabs */}
          <div className="flex gap-1 border-b border-gray-200">
            {configurableRoles.map((role) => {
              const meta = ROLE_META[role]
              const isDirty = dirty.has(role)
              return (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors
                    ${activeRole === role
                      ? `border-violet-600 ${meta.color} bg-white`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  {meta.label}
                  {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />}
                </button>
              )
            })}
          </div>

          {/* Active role panel */}
          {configurableRoles.map((role) =>
            activeRole === role ? (
              <RolePanel
                key={role}
                roleCode={role}
                objects={objects}
                rules={rules.get(role) ?? []}
                dirty={dirty.has(role)}
                onToggle={(objectCode, perm, value) => handleToggle(role, objectCode, perm, value)}
              />
            ) : null,
          )}
        </>
      )}
    </div>
  )
}
