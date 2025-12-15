import { StackStyleProps } from '@/types/StackStyleProps';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import React from 'react';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';
import { hstackStyle } from './styles';

type IHStackProps = ViewProps & VariantProps<typeof hstackStyle> & StackStyleProps;

const HStack = React.forwardRef<React.ComponentRef<typeof View>, IHStackProps>(
  function HStack({ className, space, reversed, ...props }, ref) {
    const style = {
      display: "flex",
      ...props.style as any
    }
    return (
      <View
        className={hstackStyle({
          space,
          reversed: reversed as boolean,
          class: className,
        })}
        flexDirection="row"
        {...props}
        style={style}
        ref={ref}
      />
    );
  }
);

HStack.displayName = 'HStack';

export { HStack };

