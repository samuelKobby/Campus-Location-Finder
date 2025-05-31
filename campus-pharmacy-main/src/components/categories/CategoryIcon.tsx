import React from 'react';
import { Icons } from '../../constants/icons';

interface CategoryIconProps {
  icon: keyof typeof Icons;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ icon, className = "w-8 h-8" }) => {
  const IconComponent = Icons[icon];
  return <IconComponent className={className} />;
};