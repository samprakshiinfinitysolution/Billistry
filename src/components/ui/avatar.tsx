import * as React from 'react'

export function Avatar({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center overflow-hidden rounded-full ${className}`}>
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt, className = '' }: { src?: string; alt?: string; className?: string }) {
  return <img src={src} alt={alt} className={`${className ? className + ' ' : ''}w-8 h-8 rounded-full object-cover`} />;
}

export function AvatarFallback({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <div className={`${className ? className + ' ' : ''}w-8 h-8 bg-gray-200 text-gray-700 flex items-center justify-center rounded-full`}>{children}</div>;
}

export default Avatar;
