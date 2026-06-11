import React from 'react';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={`w-full px-4 py-3 bg-gray-50 rounded-lg focus:bg-white focus:ring-2 focus:ring-[rgba(139,15,18,0.12)] outline-none text-slate-dark transition-all text-sm ${props.className || ''}`} />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`w-full px-4 py-3 bg-gray-50 rounded-lg focus:bg-white focus:ring-2 focus:ring-[rgba(139,15,18,0.12)] outline-none text-slate-dark transition-all text-sm ${props.className || ''}`}>
      {props.children}
    </select>
  );
}
