import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import LayoutTemplateSelector, { TEMPLATE_COUNT, TEMPLATES } from './LayoutTemplateSelector';
import LayoutTemplate from '../../../../types/enums/LayoutTemplate';


// Mock dependencies
jest.mock('react-redux', () => ({
  useSelector: () => 'light',
}));

describe('LayoutTemplateSelector', () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    value: 'classic-list' as LayoutTemplate,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all 5 template options', () => {
      const { getByTestId } = render(<LayoutTemplateSelector {...defaultProps} />);

      expect(getByTestId('layout-template-modern-grid')).toBeTruthy();
      expect(getByTestId('layout-template-classic-list')).toBeTruthy();
      expect(getByTestId('layout-template-cards')).toBeTruthy();
      expect(getByTestId('layout-template-compact')).toBeTruthy();
      expect(getByTestId('layout-template-elegant')).toBeTruthy();
    });

    it('has correct number of templates defined in TEMPLATES constant', () => {
      expect(TEMPLATES).toHaveLength(TEMPLATE_COUNT);
    });

    it('renders container with correct testID', () => {
      const { getByTestId } = render(<LayoutTemplateSelector {...defaultProps} />);

      expect(getByTestId('layout-template-selector')).toBeTruthy();
    });
  });

  describe('selection behavior', () => {
    it('calls onChange with correct template when a template is pressed', () => {
      const { getByTestId } = render(<LayoutTemplateSelector {...defaultProps} />);

      const modernGridCard = getByTestId('layout-template-modern-grid');
      fireEvent.press(modernGridCard);

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith('modern-grid');
    });

    it('calls onChange with cards template when cards is pressed', () => {
      const { getByTestId } = render(<LayoutTemplateSelector {...defaultProps} />);

      const cardsCard = getByTestId('layout-template-cards');
      fireEvent.press(cardsCard);

      expect(mockOnChange).toHaveBeenCalledWith('cards');
    });

    it('calls onChange with compact template when compact is pressed', () => {
      const { getByTestId } = render(<LayoutTemplateSelector {...defaultProps} />);

      const compactCard = getByTestId('layout-template-compact');
      fireEvent.press(compactCard);

      expect(mockOnChange).toHaveBeenCalledWith('compact');
    });

    it('calls onChange with elegant template when elegant is pressed', () => {
      const { getByTestId } = render(<LayoutTemplateSelector {...defaultProps} />);

      const elegantCard = getByTestId('layout-template-elegant');
      fireEvent.press(elegantCard);

      expect(mockOnChange).toHaveBeenCalledWith('elegant');
    });

    it('calls onChange with classic-list template when classic-list is pressed', () => {
      const { getByTestId } = render(
        <LayoutTemplateSelector {...defaultProps} value={LayoutTemplate.ModernGrid} />,
      );

      const classicListCard = getByTestId('layout-template-classic-list');
      fireEvent.press(classicListCard);

      expect(mockOnChange).toHaveBeenCalledWith('classic-list');
    });
  });

  describe('disabled state', () => {
    it('does not call onChange when disabled is true', () => {
      const { getByTestId } = render(<LayoutTemplateSelector {...defaultProps} disabled />);

      const modernGridCard = getByTestId('layout-template-modern-grid');
      fireEvent.press(modernGridCard);

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('does not call onChange for any template when disabled', () => {
      const { getByTestId } = render(<LayoutTemplateSelector {...defaultProps} disabled />);

      const cardsCard = getByTestId('layout-template-cards');
      const compactCard = getByTestId('layout-template-compact');
      const elegantCard = getByTestId('layout-template-elegant');

      fireEvent.press(cardsCard);
      fireEvent.press(compactCard);
      fireEvent.press(elegantCard);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has correct accessibility role for each template card', () => {
      const { getByTestId } = render(<LayoutTemplateSelector {...defaultProps} />);

      const modernGridCard = getByTestId('layout-template-modern-grid');

      expect(modernGridCard.props.accessibilityRole).toBe('button');
    });

    it('has accessibilityLabel for each template', () => {
      const { getByTestId } = render(<LayoutTemplateSelector {...defaultProps} />);

      const modernGridCard = getByTestId('layout-template-modern-grid');
      const classicListCard = getByTestId('layout-template-classic-list');

      // FM() returns the i18n key when translation is not in en.json
      expect(modernGridCard.props.accessibilityLabel).toBe('onlineMenus.layoutTemplates.modernGrid.name');
      expect(classicListCard.props.accessibilityLabel).toBe('onlineMenus.layoutTemplates.classicList.name');
    });

    it('has accessibilityHint for each template', () => {
      const { getByTestId } = render(<LayoutTemplateSelector {...defaultProps} />);

      const modernGridCard = getByTestId('layout-template-modern-grid');

      expect(modernGridCard.props.accessibilityHint).toBe('Select a layout template');
    });

    it('shows selected state in accessibility for current value', () => {
      const { getByTestId } = render(
        <LayoutTemplateSelector {...defaultProps} value={LayoutTemplate.ModernGrid} />,
      );

      const modernGridCard = getByTestId('layout-template-modern-grid');
      const classicListCard = getByTestId('layout-template-classic-list');

      expect(modernGridCard.props.accessibilityState.selected).toBe(true);
      expect(classicListCard.props.accessibilityState.selected).toBe(false);
    });

    it('shows disabled state in accessibility when disabled', () => {
      const { getByTestId } = render(<LayoutTemplateSelector {...defaultProps} disabled />);

      const modernGridCard = getByTestId('layout-template-modern-grid');

      expect(modernGridCard.props.accessibilityState.disabled).toBe(true);
    });

    it('shows disabled as false in accessibility when not disabled', () => {
      const { getByTestId } = render(<LayoutTemplateSelector {...defaultProps} />);

      const modernGridCard = getByTestId('layout-template-modern-grid');

      expect(modernGridCard.props.accessibilityState.disabled).toBe(false);
    });
  });

  describe('selection state indication', () => {
    it('indicates selected template with different styling (via value prop)', () => {
      const { getByTestId, rerender } = render(
        <LayoutTemplateSelector {...defaultProps} value={LayoutTemplate.ModernGrid} />,
      );

      // Check initial selection
      let modernGridCard = getByTestId('layout-template-modern-grid');
      expect(modernGridCard.props.accessibilityState.selected).toBe(true);

      // Change selection
      rerender(<LayoutTemplateSelector {...defaultProps} value={LayoutTemplate.Cards} />);

      modernGridCard = getByTestId('layout-template-modern-grid');
      const cardsCard = getByTestId('layout-template-cards');

      expect(modernGridCard.props.accessibilityState.selected).toBe(false);
      expect(cardsCard.props.accessibilityState.selected).toBe(true);
    });

    it('updates selection when value prop changes', () => {
      const { getByTestId, rerender } = render(
        <LayoutTemplateSelector {...defaultProps} value={LayoutTemplate.ClassicList} />,
      );

      let classicListCard = getByTestId('layout-template-classic-list');
      expect(classicListCard.props.accessibilityState.selected).toBe(true);

      rerender(<LayoutTemplateSelector {...defaultProps} value={LayoutTemplate.Elegant} />);

      classicListCard = getByTestId('layout-template-classic-list');
      const elegantCard = getByTestId('layout-template-elegant');

      expect(classicListCard.props.accessibilityState.selected).toBe(false);
      expect(elegantCard.props.accessibilityState.selected).toBe(true);
    });
  });

  describe('TEMPLATES constant', () => {
    it('contains all required template IDs', () => {
      const templateIds = TEMPLATES.map((t) => t.id);

      expect(templateIds).toContain('modern-grid');
      expect(templateIds).toContain('classic-list');
      expect(templateIds).toContain('cards');
      expect(templateIds).toContain('compact');
      expect(templateIds).toContain('elegant');
    });

    it('each template has required properties', () => {
      for (const template of TEMPLATES) {
        expect(template.id).toBeDefined();
        expect(template.nameKey).toBeDefined();
        expect(template.descriptionKey).toBeDefined();
        expect(template.icon).toBeDefined();
      }
    });

    it('each template has unique ID', () => {
      const templateIds = TEMPLATES.map((t) => t.id);
      const uniqueIds = new Set(templateIds);

      expect(uniqueIds.size).toBe(templateIds.length);
    });
  });
});
