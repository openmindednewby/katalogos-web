/**
 * Form card container component.
 * Provides consistent styling for form cards.
 */
import type { ReactElement, ReactNode } from 'react';

import { isValueDefined } from '../../../../../shared/utils/validators';

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  testID?: string;
}

export const FormCard = ({ title, description, children, testID }: Props): ReactElement => {
  return (
    <div className="form-card" data-testid={testID}>
      <h2 className="form-card__title">{title}</h2>
      {isValueDefined(description) && description !== '' ? (
        <p className="form-card__description">{description}</p>
      ) : null}
      {children}
    </div>
  );
}
