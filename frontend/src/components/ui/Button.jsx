import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false, 
  disabled = false, 
  icon: Icon,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-unich-magenta text-white hover:bg-[#c9006c] focus:ring-unich-magenta shadow-sm',
    secondary: 'bg-unich-purple text-white hover:bg-unich-dark focus:ring-unich-purple shadow-sm',
    outline: 'border-2 border-unich-purple text-unich-purple hover:bg-unich-purple hover:text-white focus:ring-unich-purple',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 shadow-sm',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-200',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : Icon ? (
        <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
