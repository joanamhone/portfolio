import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'cyber'| 'outline'; // extend variants as needed
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'default', children, className = '', ...props }) => {
  let baseClass = 'btn-primary inline-flex items-center space-x-2';

  // Variant styles
  switch (variant) {
    case 'cyber':
      baseClass += 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500 ';
      break;
    case 'primary':
      baseClass += 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 ';
      break;
    default:
      baseClass += 'bg-gray-300 text-black hover:bg-gray-400 focus:ring-gray-400 ';
      break;
  }

  return (
    <button className={`${baseClass}${className}`} {...props}>
      {children}
    </button>
  );
};
