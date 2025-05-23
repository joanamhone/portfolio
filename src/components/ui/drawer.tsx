import React, { ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-lg z-50 p-4 overflow-auto">
        {children}
      </div>
    </>
  );
};

export const DrawerContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};

export const DrawerHeader: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <header className="mb-4">{children}</header>;
};

export const DrawerTitle: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <h2 className="text-xl font-bold">{children}</h2>;
};

export const DrawerDescription: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <p className="text-sm text-gray-600 dark:text-gray-400">{children}</p>;
};

export const DrawerBody: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="mb-4">{children}</div>;
};

export const DrawerFooter: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <footer className="mt-4">{children}</footer>;
};

export const DrawerClose: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
      aria-label="Close drawer"
    >
      ×
    </button>
  );
};
