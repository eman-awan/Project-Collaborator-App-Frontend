import React from 'react';
import { View, ViewProps } from 'react-native';

import { StackStyleProps } from '@/types/StackStyleProps';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { boxStyle } from './styles';

type IBoxProps = ViewProps &
  VariantProps<typeof boxStyle> & { className?: string } & StackStyleProps;

const Box = React.forwardRef<React.ComponentRef<typeof View>, IBoxProps>(
  function Box({ className, ...props }, ref) {
    return (
      <View ref={ref} {...props} className={boxStyle({ class: className })} />
    );
  }
);

Box.displayName = 'Box';
export { Box };

