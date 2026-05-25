import React, { lazy, Suspense, useMemo } from 'react';

import { ActivityIndicator, FlatList, View } from 'react-native';

import { useSelector } from 'react-redux';

import EmptyListState from '../../../src/components/Shared/EmptyListState';
import ErrorState from '../../../src/components/Shared/ErrorState';
import { LoadingFallback } from '../../../src/components/Shared/Fallbacks';
import PageHeaderWithActions from '../../../src/components/Shared/PageHeaderWithActions';
import TenantListItem from '../../../src/components/Tenants/TenantListItem';
import DeleteInactiveButton from '../../../src/features/questioner/components/DeleteInactiveButton';
import TemplateForm from '../../../src/features/questioner/components/TemplateForm';
import { useQuizTemplateActions } from '../../../src/hooks/useQuizTemplateActions';
import { FM } from '../../../src/localization/helpers';
import ThemeMode from '../../../src/shared/enums/ThemeMode';
import { TestIds } from '../../../src/shared/testIds';
import { layoutStyles, themePalette } from '../../../src/theme/utils/styles';
import { getErrorMessage } from '../../../src/utils/errorMessage';

import type { RootState } from '../../../src/store/reduxStore';

// Lazy load the editor modal - only loaded when editing
const TemplateEditorModal = lazy(async () => import('../../../src/features/questioner/components/TemplateEditorModal'));

const QuizTemplatesPage = (): React.ReactElement => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;

  const {
    items,
    isLoading,
    isError,
    error,
    editingItem,
    isModalVisible,
    isCreating,
    handleRefetch,
    handleEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleDelete,
    handleActivate,
    handleCreate,
    handleDeleteInactiveSuccess,
  } = useQuizTemplateActions();

  const colorStyles = useMemo(
    () => ({
      container: { backgroundColor: String(colors.background) },
      listItemBorder: { borderBottomColor: String(colors.border) },
    }),
    [colors.background, colors.border],
  );

  return (
    <View style={[layoutStyles.container, colorStyles.container]}>
      <PageHeaderWithActions
        refreshing={isLoading}
        refreshLabel={FM('common.refresh')}
        title={FM('quizTemplates.title')}
        onRefresh={handleRefetch}
      >
        <DeleteInactiveButton disabled={isLoading} onSuccess={handleDeleteInactiveSuccess} />
      </PageHeaderWithActions>

      <View style={layoutStyles.formRow} testID={TestIds.CREATE_TEMPLATE_FORM}>
        <TemplateForm
          initialDescription=""
          initialName=""
          saving={isCreating}
          showStatus={false}
          onCancel={() => {}}
          onSave={handleCreate}
        />
      </View>

      {isLoading ? <ActivityIndicator /> : null}
      {!isLoading && isError ? (
        <ErrorState
          message={getErrorMessage(error, FM('common.errorOccurred'))}
          onRetry={handleRefetch}
        />
      ) : null}
      {!isLoading && !isError ? (
        <FlatList
          data={items}
          keyExtractor={(it, idx) => it.externalId ?? String(idx)}
          ListEmptyComponent={
            <EmptyListState
              messageKey="dashboard.templates.emptyList"
              testID={TestIds.EMPTY_LIST_STATE}
            />
          }
          renderItem={({ item }) => (
            <View style={[layoutStyles.listItem, colorStyles.listItemBorder]}>
              <TenantListItem
                item={item}
                statusKey="isActive"
                titleKey="name"
                translationNs="quizTemplates"
                onActivate={(id, current) => handleActivate(id, current)}
                onDelete={(id) => handleDelete(id)}
                onEdit={() => handleEdit(item)}
              />
            </View>
          )}
          testID={TestIds.TEMPLATE_LIST}
        />
      ) : null}

      {/* Lazy load editor modal - only loaded when modal is opened */}
      {isModalVisible ? (
        <Suspense fallback={<LoadingFallback fullScreen />}>
          <TemplateEditorModal
            enableAnswerSection={false}
            item={editingItem}
            visible={isModalVisible}
            onCancel={handleCancelEdit}
            onSave={handleSaveEdit}
          />
        </Suspense>
      ) : null}
    </View>
  );
};

export default QuizTemplatesPage;
