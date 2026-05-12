/**
 * Enhanced Action Menu Component
 * Beautiful dropdown menu with icons and keyboard support
 */

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, MoreHorizontal } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export interface MenuAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'danger';
  divider?: boolean;
  disabled?: boolean;
}

interface ActionMenuProps {
  actions: MenuAction[];
  orientation?: 'vertical' | 'horizontal';
  align?: 'left' | 'right';
}

export function ActionMenu({ actions, orientation = 'vertical', align = 'right' }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: MenuAction) => {
    if (!action.disabled) {
      action.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
      >
        {orientation === 'vertical' ? (
          <MoreVertical className="h-4 w-4" />
        ) : (
          <MoreHorizontal className="h-4 w-4" />
        )}
      </Button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-in fade-in slide-in-from-top-2 duration-200 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {actions.map((action, index) => (
            <div key={index}>
              {action.divider && index > 0 && (
                <div className="my-1 border-t border-gray-200" />
              )}
              <button
                onClick={() => handleAction(action)}
                disabled={action.disabled}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  action.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : action.variant === 'danger'
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {action.icon && <action.icon className="h-4 w-4" />}
                <span>{action.label}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
