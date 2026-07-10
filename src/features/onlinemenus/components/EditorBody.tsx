/**
 * Body of the FullMenuEditor.
 *
 * - Narrow (< EDITOR_TWO_PANE_BREAKPOINT_PX): a single scrollable column,
 *   byte-identical to the pre-two-pane editor layout.
 * - Wide (>= EDITOR_TWO_PANE_BREAKPOINT_PX): a desktop two-pane layout with the
 *   editor form on the left and a live menu preview on the right, each pane
 *   scrolling independently. The preview is driven by the same live editor
 *   state, so edits reflect immediately.
 */
import React from 'react';

import { ScrollView, Text, View } from 'react-native';

import MenuLivePreview from '@/components/OnlineMenus/MenuLivePreview';
import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import type { MenuContents } from '@/types/menuTypes';

import { fullEditorStyles as styles } from './utils/fullMenuEditorStyles';

interface EditorBodyProps {
  isTwoPane: boolean;
  name: string;
  description: string;
  menuContents: MenuContents;
  borderColor: string;
  textColor: string;
  children: React.ReactNode;
}

const EditorBody: React.FC<EditorBodyProps> = ({
  isTwoPane,
  name,
  description,
  menuContents,
  borderColor,
  textColor,
  children,
}) => {
  if (!isTwoPane)
    return (
      <ScrollView showsVerticalScrollIndicator={false} style={styles.contentContainer}>
        {children}
      </ScrollView>
    );

  return (
    <View style={styles.bodyRow}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.leftPane}>
        {children}
      </ScrollView>
      <View style={[styles.rightPane, { borderLeftColor: borderColor }]} testID={TestIds.MENU_EDITOR_LIVE_PANE}>
        <View style={[styles.livePaneHeader, { borderBottomColor: borderColor }]}>
          <Text style={[styles.livePaneTitle, { color: textColor }]}>{FM('onlineMenus.livePreview')}</Text>
        </View>
        <MenuLivePreview contents={menuContents} menuDescription={description} menuName={name} />
      </View>
    </View>
  );
};

export default EditorBody;
