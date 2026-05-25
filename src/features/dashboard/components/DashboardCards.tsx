import React from 'react';

import { StyleSheet, View } from 'react-native';

import PopularItemsCard from '@/components/Analytics/components/PopularItemsCard';
import GuidedActionCard from '@/components/Dashboard/components/GuidedActionCard';
import OverviewCard from '@/components/Dashboard/components/OverviewCard';
import QuickActions from '@/components/Dashboard/components/QuickActions';
import type { DashboardData } from '@/components/Dashboard/types';
import { featureFlags } from '@/config/featureFlags';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Routes } from '@/navigation/routes';
import { TestIds } from '@/shared/testIds';

/** Emoji icon for restaurant/menu-related cards */
const ICON_RESTAURANT = '\uD83C\uDF7D\uFE0F';
/** Emoji icon for clipboard/survey-related cards */
const ICON_CLIPBOARD = '\uD83D\uDCCB';

const CARDS_ROW_GAP = 16;
const DESKTOP_CARD_WIDTH = '48%' as const;

const styles = StyleSheet.create({
  cardsRow: {
    gap: CARDS_ROW_GAP,
  },
  cardsRowDesktop: {
    gap: CARDS_ROW_GAP,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  desktopCard: {
    width: DESKTOP_CARD_WIDTH,
  },
});

interface DashboardCardsProps {
  dashboardData: DashboardData;
}

const EmptyStateCards = ({ cardStyle }: { cardStyle: typeof styles.desktopCard | undefined }): React.ReactElement => {
  return (
    <>
      {featureFlags.onlineMenuModule ? (
        <View style={cardStyle}>
          <GuidedActionCard
            ctaHintKey="dashboard.menus.guidedCtaHint"
            ctaRoute={Routes.MENUS}
            ctaTestID={TestIds.DASHBOARD_GUIDED_ACTION_CARD_CTA_MENUS}
            ctaTextKey="dashboard.menus.guidedCta"
            descriptionKey="dashboard.menus.guidedDescription"
            iconName={ICON_RESTAURANT}
            testID={TestIds.DASHBOARD_GUIDED_ACTION_CARD_MENUS}
            titleKey="dashboard.menus.guidedTitle"
          />
        </View>
      ) : null}
      {featureFlags.questionerModule ? (
        <View style={cardStyle}>
          <GuidedActionCard
            ctaHintKey="dashboard.templates.guidedCtaHint"
            ctaRoute={Routes.QUIZ_TEMPLATES}
            ctaTestID={TestIds.DASHBOARD_GUIDED_ACTION_CARD_CTA_TEMPLATES}
            ctaTextKey="dashboard.templates.guidedCta"
            descriptionKey="dashboard.templates.guidedDescription"
            iconName={ICON_CLIPBOARD}
            testID={TestIds.DASHBOARD_GUIDED_ACTION_CARD_TEMPLATES}
            titleKey="dashboard.templates.guidedTitle"
          />
        </View>
      ) : null}
    </>
  );
}

const ActiveStateCards = ({ data, cardStyle }: { data: DashboardData; cardStyle: typeof styles.desktopCard | undefined }): React.ReactElement => {
  return (
    <>
      {data.hasMenus ? (
        <View style={cardStyle}>
          <OverviewCard
            count={data.menuCount}
            ctaHintKey="dashboard.menus.overviewCtaHint"
            ctaRoute={Routes.MENUS}
            ctaTestID={TestIds.DASHBOARD_OVERVIEW_CARD_CTA_MENUS}
            ctaTextKey="dashboard.menus.overviewCta"
            iconName={ICON_RESTAURANT}
            testID={TestIds.DASHBOARD_OVERVIEW_CARD_MENUS}
            titleKey="dashboard.menus.overviewTitle"
          />
        </View>
      ) : null}
      {data.hasTemplates ? (
        <View style={cardStyle}>
          <OverviewCard
            count={data.templateCount}
            ctaHintKey="dashboard.templates.overviewCtaHint"
            ctaRoute={Routes.QUIZ_TEMPLATES}
            ctaTestID={TestIds.DASHBOARD_OVERVIEW_CARD_CTA_TEMPLATES}
            ctaTextKey="dashboard.templates.overviewCta"
            iconName={ICON_CLIPBOARD}
            testID={TestIds.DASHBOARD_OVERVIEW_CARD_TEMPLATES}
            titleKey="dashboard.templates.overviewTitle"
          />
        </View>
      ) : null}
      <View style={cardStyle}><QuickActions /></View>
      {data.hasMenus ? (
        <View style={cardStyle}><PopularItemsCard /></View>
      ) : null}
    </>
  );
}

const DashboardCards = ({ dashboardData }: DashboardCardsProps): React.ReactElement => {
  const { isDesktop } = useBreakpoint();
  const containerStyle = isDesktop ? styles.cardsRowDesktop : styles.cardsRow;
  const cardStyle = isDesktop ? styles.desktopCard : undefined;

  return (
    <View style={containerStyle}>
      {dashboardData.isEmpty
        ? <EmptyStateCards cardStyle={cardStyle} />
        : <ActiveStateCards cardStyle={cardStyle} data={dashboardData} />}
    </View>
  );
};

export default DashboardCards;
