import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';

import { Platform } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';

const FALLBACK_PADDING = 20;

export const NativeComponentsPage = (): ReactElement => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckedChange = useCallback(() => {
    setIsChecked((prev) => !prev);
  }, []);

  if (Platform.OS !== 'web')
    return (
      <div style={{ padding: FALLBACK_PADDING }}>
        <p>{FM('showcase.webOnly')}</p>
      </div>
    );

  return (
    <div data-testid={TestIds.NATIVE_COMPONENTS_PAGE}>
      <h1>{FM('showcase.nativeComponentsTitle')}</h1>
      <section className="card">
        <h2>{FM('showcase.checkboxesTitle')}</h2>

        <div>
          <label data-testid={TestIds.NATIVE_CHECKBOX_CHECKED}>
            <input
              checked={isChecked}
              type="checkbox"
              onChange={handleCheckedChange}
            />
            {FM('showcase.checkboxChecked')}
          </label>
        </div>

        <div>
          <label data-testid={TestIds.NATIVE_CHECKBOX_UNCHECKED}>
            <input type="checkbox" />
            {FM('showcase.checkboxUnchecked')}
          </label>
        </div>

        <div>
          <label data-testid={TestIds.NATIVE_CHECKBOX_DISABLED}>
            <input disabled type="checkbox" />
            {FM('showcase.checkboxDisabled')}
          </label>
        </div>

        <div>
          <label data-testid={TestIds.NATIVE_CHECKBOX_INDETERMINATE}>
            <input checked readOnly type="checkbox" />
            {FM('showcase.checkboxIndeterminate')}
          </label>
        </div>
      </section>
    </div>
  );
};

export default NativeComponentsPage;
