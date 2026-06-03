/**
 * Custom hook for combobox behavior: filtering, keyboard navigation,
 * and open/close state management.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { SelectOption } from './types';

const FIRST_INDEX = 0;
const NOT_FOUND_INDEX = -1;
const LISTBOX_ID = 'combobox-listbox';

interface UseComboboxParams {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

interface UseComboboxReturn {
  isOpen: boolean;
  searchText: string;
  highlightedIndex: number;
  filteredOptions: SelectOption[];
  selectedLabel: string;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  listboxId: string;
  handleInputChange: (text: string) => void;
  handleInputFocus: () => void;
  handleOptionClick: (option: SelectOption) => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  closeDropdown: () => void;
}

function findLabelForValue(options: SelectOption[], value: string): string {
  const match = options.find((opt) => opt.value === value);
  return match?.label ?? '';
}

function filterOptions(options: SelectOption[], searchText: string): SelectOption[] {
  if (searchText === '') return options;
  const lowerSearch = searchText.toLowerCase();
  return options.filter((opt) => opt.label.toLowerCase().includes(lowerSearch));
}

// =============================================================================
// Keyboard navigation helpers
// =============================================================================

interface OpenKeyDownContext {
  filteredOptions: SelectOption[];
  highlightedIndex: number;
  setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>;
  selectOption: (option: SelectOption) => void;
}

function navigateDown(setIndex: React.Dispatch<React.SetStateAction<number>>, length: number): void {
  setIndex((prev) => (prev + 1 >= length ? FIRST_INDEX : prev + 1));
}

function navigateUp(setIndex: React.Dispatch<React.SetStateAction<number>>, length: number): void {
  setIndex((prev) => (prev - 1 < FIRST_INDEX ? length - 1 : prev - 1));
}

function handleOpenKeyDown(event: React.KeyboardEvent, ctx: OpenKeyDownContext): void {
  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault();
      navigateDown(ctx.setHighlightedIndex, ctx.filteredOptions.length);
      break;
    }
    case 'ArrowUp': {
      event.preventDefault();
      navigateUp(ctx.setHighlightedIndex, ctx.filteredOptions.length);
      break;
    }
    case 'Enter': {
      event.preventDefault();
      const hasHighlight = ctx.highlightedIndex >= FIRST_INDEX && ctx.highlightedIndex < ctx.filteredOptions.length;
      if (hasHighlight) ctx.selectOption(ctx.filteredOptions[ctx.highlightedIndex]);
      break;
    }
    default:
      break;
  }
}

// =============================================================================
// Click-outside hook
// =============================================================================

function useClickOutside(
  wrapperRef: React.RefObject<HTMLDivElement | null>,
  closeDropdown: () => void,
  onBlur: () => void,
): void {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      const target = event.target instanceof Node ? event.target : null;
      const isInsideWrapper = wrapperRef.current?.contains(target) === true;
      if (!isInsideWrapper) {
        closeDropdown();
        onBlur();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef, closeDropdown, onBlur]);
}

// =============================================================================
// Combobox state management hook
// =============================================================================

interface ComboboxState {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  highlightedIndex: number;
  setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>;
  filteredOptions: SelectOption[];
  closeDropdown: () => void;
  selectOption: (option: SelectOption) => void;
}

function useComboboxKeyDown(state: ComboboxState): (event: React.KeyboardEvent) => void {
  return useCallback(
    (event: React.KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        state.closeDropdown();
        return;
      }
      if (!state.isOpen) {
        const isArrowKey = event.key === 'ArrowDown' || event.key === 'ArrowUp';
        if (isArrowKey) {
          event.preventDefault();
          state.setIsOpen(true);
          state.setHighlightedIndex(FIRST_INDEX);
        }
        return;
      }
      handleOpenKeyDown(event, {
        filteredOptions: state.filteredOptions,
        highlightedIndex: state.highlightedIndex,
        setHighlightedIndex: state.setHighlightedIndex,
        selectOption: state.selectOption,
      });
    },
    [state],
  );
}

interface ComboboxCallbacks {
  closeDropdown: () => void;
  selectOption: (option: SelectOption) => void;
  handleInputChange: (text: string) => void;
  handleInputFocus: () => void;
}

function useComboboxCallbacks(
  onChange: (value: string) => void,
  isOpen: boolean,
  setters: { setIsOpen: (v: boolean) => void; setSearchText: (v: string) => void; setHighlightedIndex: (v: number) => void },
): ComboboxCallbacks {
  const closeDropdown = useCallback((): void => {
    setters.setIsOpen(false);
    setters.setSearchText('');
    setters.setHighlightedIndex(NOT_FOUND_INDEX);
  }, [setters]);

  const selectOption = useCallback(
    (option: SelectOption): void => {
      onChange(option.value);
      closeDropdown();
    },
    [onChange, closeDropdown],
  );

  const handleInputChange = useCallback((text: string): void => {
    setters.setSearchText(text);
    setters.setHighlightedIndex(FIRST_INDEX);
    if (!isOpen) setters.setIsOpen(true);
  }, [isOpen, setters]);

  const handleInputFocus = useCallback((): void => {
    setters.setIsOpen(true);
    setters.setSearchText('');
    setters.setHighlightedIndex(NOT_FOUND_INDEX);
  }, [setters]);

  return { closeDropdown, selectOption, handleInputChange, handleInputFocus };
}

// =============================================================================
// Main hook
// =============================================================================

export function useCombobox({ options, value, onChange, onBlur }: UseComboboxParams): UseComboboxReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(NOT_FOUND_INDEX);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = useMemo(() => findLabelForValue(options, value), [options, value]);
  const filteredOptions = useMemo(() => filterOptions(options, searchText), [options, searchText]);

  const setters = useMemo(() => ({ setIsOpen, setSearchText, setHighlightedIndex }), []);
  const { closeDropdown, selectOption, handleInputChange, handleInputFocus } =
    useComboboxCallbacks(onChange, isOpen, setters);

  const state = useMemo<ComboboxState>(() => ({
    isOpen, setIsOpen, setSearchText, highlightedIndex,
    setHighlightedIndex, filteredOptions, closeDropdown, selectOption,
  }), [isOpen, highlightedIndex, filteredOptions, closeDropdown, selectOption]);
  const handleKeyDown = useComboboxKeyDown(state);

  useClickOutside(wrapperRef, closeDropdown, onBlur);

  return {
    isOpen, searchText, highlightedIndex, filteredOptions, selectedLabel,
    wrapperRef, listboxId: LISTBOX_ID,
    handleInputChange, handleInputFocus, handleOptionClick: selectOption,
    handleKeyDown, closeDropdown,
  };
}
