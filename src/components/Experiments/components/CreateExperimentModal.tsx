/**
 * CreateExperimentModal -- form to create a new A/B test experiment.
 * Uses a dropdown to select available menus instead of raw menu ID input.
 */
import React, { useCallback, useMemo, useState } from 'react';

import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { notifyError, notifySuccess } from '../../../lib/notifications';
import { FM } from '../../../localization/helpers';
import { useCreateExperiment } from '../../../server/customHooks/experiments/useCreateExperiment';
import { MODAL_OVERLAY_COLOR } from '../../../shared/constants';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import { Button } from '../../core/Button';
import ButtonVariant from '../../core/Button/utils/ButtonVariant';
import { experimentStyles } from '../styles';

const DROPDOWN_ITEM_PADDING_V = 10;
const DROPDOWN_ITEM_PADDING_H = 12;
const DROPDOWN_MAX_HEIGHT = 200;

interface MenuOption {
  id: string;
  name: string;
}

interface MenuDropdownListProps {
  menus: MenuOption[];
  selectedMenuId: string;
  colors: { text: string; textSecondary: string; border: string; surface: string };
  onSelect: (id: string, name: string) => void;
}

const MenuDropdownList = ({ menus, selectedMenuId, colors, onSelect }: MenuDropdownListProps): React.ReactElement => (
  <ScrollView
    style={[
      experimentStyles.input,
      { borderColor: colors.border, maxHeight: DROPDOWN_MAX_HEIGHT },
    ]}
  >
    {menus.length === 0 ? (
      <Text style={{ color: colors.textSecondary, paddingVertical: DROPDOWN_ITEM_PADDING_V, paddingHorizontal: DROPDOWN_ITEM_PADDING_H }}>
        {FM('experiments.create.noMenusAvailable')}
      </Text>
    ) : null}
    {menus.map((menu) => {
      const isSelected = selectedMenuId === menu.id;
      return (
        <TouchableOpacity
          key={menu.id}
          accessibilityHint={FM('experiments.create.menuSelectHint')}
          accessibilityLabel={menu.name}
          accessibilityRole="button"
          style={{
            paddingVertical: DROPDOWN_ITEM_PADDING_V,
            paddingHorizontal: DROPDOWN_ITEM_PADDING_H,
            backgroundColor: isSelected ? colors.border : colors.surface,
          }}
          testID={`${TestIds.EXPERIMENT_CREATE_MENU_SELECT}-${menu.id}`}
          onPress={() => onSelect(menu.id, menu.name)}
        >
          <Text style={{ color: colors.text }}>{menu.name}</Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

interface Props {
  visible: boolean;
  onClose: () => void;
  menus: MenuOption[];
  menusLoading: boolean;
}

const CreateExperimentModal = ({
  visible,
  onClose,
  menus,
  menusLoading,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;

  const [name, setName] = useState('');
  const [menuId, setMenuId] = useState('');
  const [menuName, setMenuName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const createCallbacks = useMemo(() => ({
    onSuccess: () => {
      notifySuccess(FM('experiments.messages.createSuccess'));
      setName('');
      setMenuId('');
      setMenuName('');
      onClose();
    },
    onError: () => notifyError(FM('experiments.errors.createFailed')),
  }), [onClose]);

  const { mutate: createExperiment, isPending } = useCreateExperiment(createCallbacks);

  const handleSubmit = useCallback(() => {
    if (name.trim() === '' || menuId.trim() === '') return;
    createExperiment({
      name: name.trim(),
      menuId: menuId.trim(),
      variantBConfig: { themePreset: null, menuVersionId: null },
    });
  }, [name, menuId, createExperiment]);

  const handleCancel = useCallback(() => {
    setName('');
    setMenuId('');
    setMenuName('');
    setShowDropdown(false);
    onClose();
  }, [onClose]);

  const handleMenuSelect = useCallback((id: string, selectedName: string) => {
    setMenuId(id);
    setMenuName(selectedName);
    setShowDropdown(false);
  }, []);

  const handleToggleDropdown = useCallback(() => {
    setShowDropdown((v) => !v);
  }, []);

  const dropdownLabel = useMemo(() => {
    if (menusLoading) return FM('experiments.create.menuLoadingPlaceholder');
    if (menuName !== '') return menuName;
    return FM('experiments.create.menuPlaceholder');
  }, [menusLoading, menuName]);

  const dropdownLabelColor = menuName !== '' ? colors.text : colors.textSecondary;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleCancel}>
      <View style={[experimentStyles.modalOverlay, { backgroundColor: MODAL_OVERLAY_COLOR }]}>
        <View
          style={[experimentStyles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}
          testID={TestIds.EXPERIMENT_CREATE_MODAL}
        >
          <Text style={[experimentStyles.modalTitle, { color: colors.text }]}>
            {FM('experiments.create.title')}
          </Text>

          <Text style={[experimentStyles.inputLabel, { color: colors.text }]}>
            {FM('experiments.create.nameLabel')}
          </Text>
          <TextInput
            accessibilityHint={FM('experiments.create.nameHint')}
            accessibilityLabel={FM('experiments.create.nameLabel')}
            placeholder={FM('experiments.create.namePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            style={[experimentStyles.input, { borderColor: colors.border, color: colors.text }]}
            testID={TestIds.EXPERIMENT_CREATE_NAME_INPUT}
            value={name}
            onChangeText={setName}
          />

          <Text style={[experimentStyles.inputLabel, { color: colors.text }]}>
            {FM('experiments.create.menuLabel')}
          </Text>
          <TouchableOpacity
            accessibilityHint={FM('experiments.create.menuSelectHint')}
            accessibilityLabel={FM('experiments.create.menuLabel')}
            accessibilityRole="button"
            disabled={menusLoading}
            style={[experimentStyles.input, { borderColor: colors.border }]}
            testID={TestIds.EXPERIMENT_CREATE_MENU_SELECT}
            onPress={handleToggleDropdown}
          >
            <Text style={{ color: dropdownLabelColor }}>
              {dropdownLabel}
            </Text>
          </TouchableOpacity>

          {showDropdown ? (
            <MenuDropdownList
              colors={colors}
              menus={menus}
              selectedMenuId={menuId}
              onSelect={handleMenuSelect}
            />
          ) : null}

          <View style={experimentStyles.modalButtons}>
            <Button
              accessibilityHint={FM('experiments.create.cancelButtonHint')}
              accessibilityLabel={FM('experiments.create.cancelButton')}
              label={FM('experiments.create.cancelButton')}
              testID={TestIds.EXPERIMENT_CREATE_CANCEL_BUTTON}
              variant={ButtonVariant.Outline}
              onPress={handleCancel}
            />
            <Button
              accessibilityHint={FM('experiments.create.submitButtonHint')}
              accessibilityLabel={FM('experiments.create.submitButton')}
              disabled={isPending || name.trim() === '' || menuId === ''}
              label={FM('experiments.create.submitButton')}
              loading={isPending}
              testID={TestIds.EXPERIMENT_CREATE_SUBMIT_BUTTON}
              variant={ButtonVariant.Primary}
              onPress={handleSubmit}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CreateExperimentModal;
