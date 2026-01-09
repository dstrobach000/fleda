"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function TitleSetter() {
  const pathname = usePathname();

  useEffect(() => {
    // Only set title on client side to prevent hydration mismatches
    if (typeof window === 'undefined') return;
    
    // Set the title based on the current path
    const title = 'Fleda';
    document.title = title;
  }, [pathname]);

  return null;
}

// Hook to update title from modal components
export function useUpdateTitle(title: string) {
  useEffect(() => {
    // Only set title on client side to prevent hydration mismatches
    if (typeof window === 'undefined' || !title) return;
    
    document.title = title;
  }, [title]);
}
