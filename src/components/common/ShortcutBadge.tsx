/**
 * @file ShortcutBadge.tsx
 * @description Badge pequeno para mostrar atalho de teclado em menus
 * @version 1.0.0
 */

import React from 'react';
import './ShortcutBadge.css';

interface ShortcutBadgeProps {
  keys: string[];
  className?: string;
}

export const ShortcutBadge: React.FC<ShortcutBadgeProps> = ({ keys, className = '' }) => {
  return (
    <span className={`shortcut-badge ${className}`}>
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="shortcut-plus">+</span>}
          <kbd className="shortcut-key">{key}</kbd>
        </React.Fragment>
      ))}
    </span>
  );
};

export default ShortcutBadge;
