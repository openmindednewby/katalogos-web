/**
 * Provides global and navigation keyboard shortcuts for the admin panel.
 * Renders the shortcuts help modal and manages its visibility.
 * Web-only -- the hook is a no-op on native platforms.
 */
import React, { useCallback, useMemo, useState } from 'react';

import { useRouter } from 'expo-router';

import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { Routes } from '../../navigation/routes';

import type { KeyboardShortcut } from './keyboardShortcutTypes';

interface Props {
  children: React.ReactNode;
  /** Optional external save handler (e.g., from current form). */
  onSave?: () => void;
}

const KeyboardShortcutsProvider: React.FC<Props> = ({ children, onSave }) => {
  const [helpVisible, setHelpVisible] = useState(false);
  const router = useRouter();

  const openHelp = useCallback(() => { setHelpVisible(true); }, []);
  const closeHelp = useCallback(() => { setHelpVisible(false); }, []);

  const handleSave = useCallback(() => { onSave?.(); }, [onSave]);
  const navDashboard = useCallback(() => { router.push(Routes.DASHBOARD); }, [router]);
  const navMenus = useCallback(() => { router.push(Routes.MENUS); }, [router]);
  const navSettings = useCallback(() => { router.push(Routes.ACCOUNT_SETTINGS); }, [router]);

  const shortcuts = useMemo<KeyboardShortcut[]>(() => [
    // Global
    { id: 'global-save', labelKey: 'keyboardShortcuts.save', key: 's', ctrlOrMeta: true, handler: handleSave },
    { id: 'global-command-palette', labelKey: 'keyboardShortcuts.commandPalette', key: 'k', ctrlOrMeta: true, handler: openHelp },
    { id: 'help-question', labelKey: 'keyboardShortcuts.showHelp', key: '?', suppressInInput: true, handler: openHelp },
    { id: 'help-ctrl-slash', labelKey: 'keyboardShortcuts.showHelp', key: '/', ctrlOrMeta: true, handler: openHelp },
    // Navigation
    { id: 'nav-dashboard', labelKey: 'keyboardShortcuts.navDashboard', key: '1', alt: true, handler: navDashboard },
    { id: 'nav-menus', labelKey: 'keyboardShortcuts.navMenus', key: '2', alt: true, handler: navMenus },
    { id: 'nav-settings', labelKey: 'keyboardShortcuts.navSettings', key: '3', alt: true, handler: navSettings },
  ], [handleSave, openHelp, navDashboard, navMenus, navSettings]);

  useKeyboardShortcuts(shortcuts);

  return (
    <>
      {children}
      <KeyboardShortcutsModal visible={helpVisible} onClose={closeHelp} />
    </>
  );
};

export default KeyboardShortcutsProvider;
