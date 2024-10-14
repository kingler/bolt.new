import React, { useState, useCallback, memo } from 'react';
import { IconButton } from '~/components/ui/IconButton';
import { classNames } from '~/utils/classNames';

interface MenuProps {
  className?: string;
  children: React.ReactNode;
}

export const Menu: React.FC<MenuProps> = memo(({ className, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  }, []);

  return (
    <div className={classNames('menu', { open: isOpen }, className)}>
      <IconButton
        className="menu-toggle"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ?
          <div className="i-bolt:close text-xl" aria-hidden="true" /> :
          <div className="i-bolt:menu text-xl" aria-hidden="true" />
        }
      </IconButton>
      {isOpen && (
        <nav className="menu-content" role="menu">
          {children}
        </nav>
      )}
    </div>
  );
});

Menu.displayName = 'Menu';
