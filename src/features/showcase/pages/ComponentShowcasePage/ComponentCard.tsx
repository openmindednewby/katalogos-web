import type { ReactElement, ReactNode } from 'react';

import { Platform, Text } from 'react-native';

import { FM } from '@/localization/helpers';

interface Props {
  nameKey: string;
  descriptionKey: string;
  importPath: string;
  children: ReactNode;
}

function buildImportLabel(importPath: string): string {
  return FM('showcase.importPathLabel', importPath);
}

const ComponentCard = ({
  nameKey,
  descriptionKey,
  importPath,
  children,
}: Props): ReactElement | null => {
  if (Platform.OS !== 'web') return null;

  return (
    <div className="showcase-card">
      <h3 className="showcase-card__title">
        <Text>{FM(nameKey)}</Text>
      </h3>
      <p className="showcase-card__desc">
        <Text>{FM(descriptionKey)}</Text>
      </p>
      <code className="showcase-card__import">
        <Text>{buildImportLabel(importPath)}</Text>
      </code>
      <div className="showcase-card__demo">
        {children}
      </div>
    </div>
  );
};

export default ComponentCard;
