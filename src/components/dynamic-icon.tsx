import React from 'react';
import { icons, LucideProps, ShoppingCart } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name?: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  // @ts-ignore
  const IconComponent = name ? icons[name] : null;

  if (!IconComponent) {
    return <ShoppingCart {...props} />;
  }

  return <IconComponent {...props} />;
}
