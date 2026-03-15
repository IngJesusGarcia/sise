import React from 'react';

export const FormGroup = ({ children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>{children}</div>
);

export const Label = ({ children, htmlFor, className = '' }) => (
  <label 
    htmlFor={htmlFor} 
    className={`block text-sm font-semibold text-gray-700 mb-1 ${className}`}
  >
    {children}
  </label>
);

export const Input = React.forwardRef(({ className = '', error, ...props }, ref) => (
  <div className="relative">
    <input 
      ref={ref}
      className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-unich-purple/50
        ${error ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500' : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-unich-purple focus:bg-white'} 
        ${className}`}
      {...props} 
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
));
Input.displayName = 'Input';

export const Select = React.forwardRef(({ className = '', error, children, ...props }, ref) => (
  <div className="relative">
    <select 
      ref={ref}
      className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-unich-purple/50 appearance-none
        ${error ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500' : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-unich-purple focus:bg-white'} 
        ${className}`}
      {...props} 
    >
      {children}
    </select>
    {/* Custom Dropdown arrow */}
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
));
Select.displayName = 'Select';
