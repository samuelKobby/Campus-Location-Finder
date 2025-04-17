import React from 'react';
import { Icons, IconName } from '../../constants/icons';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

export const Icon: React.FC<IconProps> = ({ name, className = "w-6 h-6", ...props }) => {
  const IconComponent = Icons[name];
  return <IconComponent className={className} {...props} />;
};