/**
 * Feedback components showcase section.
 * Demonstrates: ConfirmDialog, LoadingFallback, PageSkeleton.
 */
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';

import { FM } from '@/localization/helpers';

import { Button } from '../../../../../components/core/Button';
import ConfirmDialog from '../../../../../components/Shared/ConfirmDialog';
import LoadingFallback from '../../../../../components/Shared/Fallbacks/LoadingFallback';
import PageSkeleton from '../../../../../components/Shared/Fallbacks/PageSkeleton';
import ComponentCard from '../ComponentCard';

const SKELETON_DEMO_ROWS = 3;

const FeedbackSection = (): ReactElement => {
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleShowDialog = useCallback(() => setDialogVisible(true), []);
  const handleHideDialog = useCallback(() => setDialogVisible(false), []);

  return (
    <div>
      <ComponentCard
        descriptionKey="showcase.componentConfirmDialogDesc"
        importPath="@/components/Shared/ConfirmDialog"
        nameKey="showcase.componentConfirmDialog"
      >
        <Button
          accessibilityHint={FM('showcase.showConfirmDialogHint')}
          accessibilityLabel={FM('showcase.showConfirmDialog')}
          label={FM('showcase.showConfirmDialog')}
          testID="demo-show-confirm"
          onPress={handleShowDialog}
        />
        <ConfirmDialog
          message={FM('showcase.sampleConfirmMessage')}
          title={FM('showcase.sampleConfirmTitle')}
          visible={dialogVisible}
          onCancel={handleHideDialog}
          onConfirm={handleHideDialog}
        />
      </ComponentCard>

      <ComponentCard
        descriptionKey="showcase.componentLoadingFallbackDesc"
        importPath="@/components/Shared/Fallbacks/LoadingFallback"
        nameKey="showcase.componentLoadingFallback"
      >
        <LoadingFallback size="small" />
      </ComponentCard>

      <ComponentCard
        descriptionKey="showcase.componentPageSkeletonDesc"
        importPath="@/components/Shared/Fallbacks/PageSkeleton"
        nameKey="showcase.componentPageSkeleton"
      >
        <div className="showcase-skeleton-clip">
          <PageSkeleton showHeader rows={SKELETON_DEMO_ROWS} variant="list" />
        </div>
      </ComponentCard>
    </div>
  );
};

export default FeedbackSection;
