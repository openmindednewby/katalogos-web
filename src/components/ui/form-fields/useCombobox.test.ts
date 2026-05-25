import { act, renderHook } from '@testing-library/react-native';

import { useCombobox } from './useCombobox';

import type { SelectOption } from './types';

// =============================================================================
// Test Data
// =============================================================================

const MOCK_OPTIONS: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
];

const DEFAULT_PARAMS = {
  options: MOCK_OPTIONS,
  value: '',
  onChange: jest.fn(),
  onBlur: jest.fn(),
};

// =============================================================================
// Test Suite
// =============================================================================

describe('useCombobox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Initial State
  // ---------------------------------------------------------------------------

  describe('initial state', () => {
    it('starts with dropdown closed', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));
      expect(result.current.isOpen).toBe(false);
    });

    it('starts with empty search text', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));
      expect(result.current.searchText).toBe('');
    });

    it('returns all options when no search text', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));
      expect(result.current.filteredOptions).toHaveLength(MOCK_OPTIONS.length);
    });

    it('returns empty selected label when no value', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));
      expect(result.current.selectedLabel).toBe('');
    });

    it('returns correct selected label for a value', () => {
      const { result } = renderHook(() =>
        useCombobox({ ...DEFAULT_PARAMS, value: 'banana' }),
      );
      expect(result.current.selectedLabel).toBe('Banana');
    });
  });

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  describe('filtering', () => {
    it('filters options case-insensitively as user types', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));

      act(() => {
        result.current.handleInputChange('an');
      });

      const labels = result.current.filteredOptions.map((opt) => opt.label);
      expect(labels).toEqual(['Banana']);
    });

    it('shows all options when search is cleared', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));

      act(() => {
        result.current.handleInputChange('an');
      });
      expect(result.current.filteredOptions).toHaveLength(1);

      act(() => {
        result.current.handleInputChange('');
      });
      expect(result.current.filteredOptions).toHaveLength(MOCK_OPTIONS.length);
    });

    it('returns empty array when no options match', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));

      act(() => {
        result.current.handleInputChange('xyz');
      });

      expect(result.current.filteredOptions).toHaveLength(0);
    });

    it('matches substring anywhere in label', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));

      act(() => {
        result.current.handleInputChange('err');
      });

      const labels = result.current.filteredOptions.map((opt) => opt.label);
      expect(labels).toEqual(['Cherry', 'Elderberry']);
    });
  });

  // ---------------------------------------------------------------------------
  // Open / Close
  // ---------------------------------------------------------------------------

  describe('open and close', () => {
    it('opens dropdown on input focus', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));

      act(() => {
        result.current.handleInputFocus();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('opens dropdown when typing', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));

      act(() => {
        result.current.handleInputChange('a');
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('closes dropdown via closeDropdown', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));

      act(() => {
        result.current.handleInputFocus();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.closeDropdown();
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('resets search text when closing', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));

      act(() => {
        result.current.handleInputChange('ban');
      });
      expect(result.current.searchText).toBe('ban');

      act(() => {
        result.current.closeDropdown();
      });
      expect(result.current.searchText).toBe('');
    });
  });

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------

  describe('selection', () => {
    it('calls onChange when option is clicked', () => {
      const mockOnChange = jest.fn();
      const { result } = renderHook(() =>
        useCombobox({ ...DEFAULT_PARAMS, onChange: mockOnChange }),
      );

      act(() => {
        result.current.handleOptionClick(MOCK_OPTIONS[2]);
      });

      expect(mockOnChange).toHaveBeenCalledWith('cherry');
    });

    it('closes dropdown after selecting option', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));

      act(() => {
        result.current.handleInputFocus();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.handleOptionClick(MOCK_OPTIONS[0]);
      });
      expect(result.current.isOpen).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Keyboard Navigation
  // ---------------------------------------------------------------------------

  describe('keyboard navigation', () => {
    const createKeyEvent = (key: string): React.KeyboardEvent =>
      ({ key, preventDefault: jest.fn() }) as unknown as React.KeyboardEvent;

    it('opens dropdown on ArrowDown when closed', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.highlightedIndex).toBe(0);
    });

    it('opens dropdown on ArrowUp when closed', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowUp'));
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('moves highlight down with ArrowDown', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));

      act(() => {
        result.current.handleInputFocus();
      });

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });
      expect(result.current.highlightedIndex).toBe(0);

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });
      expect(result.current.highlightedIndex).toBe(1);
    });

    it('wraps to first item when pressing ArrowDown at end', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));

      act(() => {
        result.current.handleInputFocus();
      });

      // Navigate through all options (5 presses: 0,1,2,3,4)
      for (let i = 0; i < MOCK_OPTIONS.length; i++)
        act(() => {
          result.current.handleKeyDown(createKeyEvent('ArrowDown'));
        });

      expect(result.current.highlightedIndex).toBe(MOCK_OPTIONS.length - 1);

      // One more press wraps to first
      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });
      expect(result.current.highlightedIndex).toBe(0);
    });

    it('moves highlight up with ArrowUp', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));

      act(() => {
        result.current.handleInputFocus();
      });

      // Go down twice
      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });
      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });
      expect(result.current.highlightedIndex).toBe(1);

      // Go up once
      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowUp'));
      });
      expect(result.current.highlightedIndex).toBe(0);
    });

    it('wraps to last item when pressing ArrowUp at beginning', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));

      act(() => {
        result.current.handleInputFocus();
      });

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });
      expect(result.current.highlightedIndex).toBe(0);

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowUp'));
      });
      expect(result.current.highlightedIndex).toBe(MOCK_OPTIONS.length - 1);
    });

    it('selects highlighted option on Enter', () => {
      const mockOnChange = jest.fn();
      const { result } = renderHook(() =>
        useCombobox({ ...DEFAULT_PARAMS, onChange: mockOnChange }),
      );

      act(() => {
        result.current.handleInputFocus();
      });

      // Navigate to second option
      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });
      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });

      // Press Enter
      act(() => {
        result.current.handleKeyDown(createKeyEvent('Enter'));
      });

      expect(mockOnChange).toHaveBeenCalledWith('banana');
      expect(result.current.isOpen).toBe(false);
    });

    it('closes dropdown on Escape', () => {
      const { result } = renderHook(() => useCombobox(DEFAULT_PARAMS));

      act(() => {
        result.current.handleInputFocus();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.handleKeyDown(createKeyEvent('Escape'));
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('does not select on Enter when no option highlighted', () => {
      const mockOnChange = jest.fn();
      const { result } = renderHook(() =>
        useCombobox({ ...DEFAULT_PARAMS, onChange: mockOnChange }),
      );

      act(() => {
        result.current.handleInputFocus();
      });

      act(() => {
        result.current.handleKeyDown(createKeyEvent('Enter'));
      });

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Click Outside
  // ---------------------------------------------------------------------------

  describe('click outside', () => {
    it('closes dropdown and calls onBlur on click outside', () => {
      const mockOnBlur = jest.fn();
      const { result } = renderHook(() =>
        useCombobox({ ...DEFAULT_PARAMS, onBlur: mockOnBlur }),
      );

      act(() => {
        result.current.handleInputFocus();
      });
      expect(result.current.isOpen).toBe(true);

      // Simulate click outside
      act(() => {
        const event = new MouseEvent('mousedown', { bubbles: true });
        document.dispatchEvent(event);
      });

      expect(result.current.isOpen).toBe(false);
      expect(mockOnBlur).toHaveBeenCalled();
    });
  });
});
