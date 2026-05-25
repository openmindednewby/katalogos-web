import SharePlatform from '../../../shared/enums/SharePlatform';
import { TestIds } from '../../../shared/testIds';

interface ShareOption {
  platform: SharePlatform;
  icon: string;
  labelKey: string;
  hintKey: string;
  testId: string;
}

/** Ordered list of platform share options shown in the dropdown. */
export const SHARE_OPTIONS: ShareOption[] = [
  {
    platform: SharePlatform.WhatsApp,
    icon: '\uD83D\uDCAC',
    labelKey: 'onlineMenus.socialSharing.shareViaWhatsApp',
    hintKey: 'onlineMenus.socialSharing.shareViaWhatsAppHint',
    testId: TestIds.PUBLIC_MENU_SHARE_WHATSAPP,
  },
  {
    platform: SharePlatform.Facebook,
    icon: '\uD83D\uDCD8',
    labelKey: 'onlineMenus.socialSharing.shareViaFacebook',
    hintKey: 'onlineMenus.socialSharing.shareViaFacebookHint',
    testId: TestIds.PUBLIC_MENU_SHARE_FACEBOOK,
  },
  {
    platform: SharePlatform.Twitter,
    icon: '\uD83D\uDC26',
    labelKey: 'onlineMenus.socialSharing.shareViaTwitter',
    hintKey: 'onlineMenus.socialSharing.shareViaTwitterHint',
    testId: TestIds.PUBLIC_MENU_SHARE_TWITTER,
  },
];

export type { ShareOption };
