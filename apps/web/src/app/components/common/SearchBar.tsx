/**
 * Enhanced Search and Filter Component
 * Beautiful search with suggestions and filters
 */

import { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  suggestions?: string[];
  filters?: FilterOption[];
  activeFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
}

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export function SearchBar({
  placeholder = 'Search...',
  value,
  onChange,
  onClear,
  suggestions = [],
  filters = [],
  activeFilters = [],
  onFilterChange,
}: SearchBarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions.filter(s =>
    s.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    setShowSuggestions(value.length > 0 && filteredSuggestions.length > 0);
  }, [value, filteredSuggestions.length]);

  const handleFilterToggle = (filterId: string) => {
    if (!onFilterChange) return;
    
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(f => f !== filterId)
      : [...activeFilters, filterId];
    
    onFilterChange(newFilters);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-10 pr-10 h-11 transition-all focus:ring-2 focus:ring-blue-500"
          />
          {value && (
            <button
              onClick={() => {
                onChange('');
                onClear?.();
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filters Button */}
        {filters.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-11 relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilters.length > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-blue-600 text-white">
                {activeFilters.length}
              </Badge>
            )}
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-2">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  onChange(suggestion);
                  setShowSuggestions(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm text-gray-700"
              >
                <Search className="h-4 w-4 inline mr-2 text-gray-400" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Dropdown */}
      {showFilters && filters.length > 0 && (
        <div className="absolute z-10 right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
              {activeFilters.length > 0 && (
                <button
                  onClick={() => onFilterChange?.([])}
                  className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="space-y-2">
              {filters.map((filter) => (
                <label
                  key={filter.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={activeFilters.includes(filter.id)}
                      onChange={() => handleFilterToggle(filter.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm text-gray-700">{filter.label}</span>
                  </div>
                  {filter.count !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {filter.count}
                    </Badge>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeFilters.map((filterId) => {
            const filter = filters.find(f => f.id === filterId);
            if (!filter) return null;
            return (
              <Badge
                key={filterId}
                variant="secondary"
                className="pl-3 pr-1 py-1 flex items-center gap-2 animate-in fade-in slide-in-from-left-2"
              >
                {filter.label}
                <button
                  onClick={() => handleFilterToggle(filterId)}
                  className="hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
