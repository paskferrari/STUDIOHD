import React from 'react';
import { View, ViewStyle } from 'react-native';
import { AnimatedContainer } from './AnimatedContainer';
import { stagger } from '../../theme/motion';

interface StaggeredListProps {
  children: React.ReactNode[];
  staggerType?: 'fast' | 'base' | 'slow';
  animation?: 'fadeInUp' | 'fadeInRight' | 'scaleIn' | 'fadeIn';
  containerStyle?: ViewStyle;
  itemStyle?: ViewStyle;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerType = 'base',
  animation = 'fadeInUp',
  containerStyle,
  itemStyle,
}) => {
  return (
    <View style={containerStyle}>
      {React.Children.map(children, (child, index) => (
        <AnimatedContainer
          key={index}
          animation={animation}
          index={index}
          staggerType={staggerType}
          style={itemStyle}
        >
          {child}
        </AnimatedContainer>
      ))}
    </View>
  );
};
