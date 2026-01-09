"use client";

import React, { useEffect, useState } from "react";
import StickyCloseButton from "@/components/BuildingBlocks/Buttons/StickyCloseButton";

// --- Scroll lock counter logic (unchanged) ---
let modalOpenCount = 0;

const lockScroll = () => {
  if (modalOpenCount === 0) {
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "contain";
    
    // iOS Safari specific: hide only the main content, not everything
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent);
    if (isIOSSafari) {
      // Hide only the main page content, not the modal
      const mainContent = document.querySelector('main, #__next > div:first-child');
      if (mainContent) {
        (mainContent as HTMLElement).style.visibility = "hidden";
      }
      // Also hide any sections that might be visible
      const sections = document.querySelectorAll('section:not([class*="modal"])');
      sections.forEach(section => {
        (section as HTMLElement).style.visibility = "hidden";
      });
    }
  }
  modalOpenCount++;
};

const unlockScroll = () => {
  modalOpenCount = Math.max(modalOpenCount - 1, 0);
  if (modalOpenCount === 0) {
    document.body.style.overflow = "";
    document.body.style.overscrollBehavior = "";
    
    // iOS Safari specific: restore content
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent);
    if (isIOSSafari) {
      const mainContent = document.querySelector('main, #__next > div:first-child');
      if (mainContent) {
        (mainContent as HTMLElement).style.visibility = "";
      }
      const sections = document.querySelectorAll('section:not([class*="modal"])');
      sections.forEach(section => {
        (section as HTMLElement).style.visibility = "";
      });
    }
  }
};
// ---------------------------------------------


type ModalProps = {
  isOpen: boolean;
  onClose: () => void;            // we now call this from the sticky button
  children: React.ReactNode;
  fullscreen?: boolean;
  noPadding?: boolean;
  closeOnBackdropClick?: boolean;
};

const Modal = ({
  isOpen,
  onClose,
  children,
  fullscreen = false,
  noPadding = false,
  closeOnBackdropClick = true,
}: ModalProps) => {
  const [viewportHeight, setViewportHeight] = useState('100vh');

  // Dynamic viewport height calculation for iOS Safari/Chrome
  useEffect(() => {
    // Only run on client side to prevent hydration mismatch
    if (typeof window === 'undefined') return;
    
    const updateViewportHeight = () => {
      // Use dvh if supported, otherwise fallback to vh
      if (CSS.supports('height', '100dvh')) {
        setViewportHeight('100dvh');
      } else {
        // For iOS Safari/Chrome, use window.innerHeight
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          setViewportHeight(`${window.innerHeight}px`);
        } else {
          setViewportHeight('100vh');
        }
      }
    };

    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);

    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);

  useEffect(() => {
    if (isOpen) lockScroll();
    return () => {
      if (isOpen) unlockScroll();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Sticky close button rendered outside modal container */}
      <StickyCloseButton onClick={onClose} />
      
      <div
        className={`fixed inset-0 z-50 bg-gray-200 text-black overscroll-contain modal-container ${
          fullscreen ? "p-0" : noPadding ? "p-0" : "p-0"
        }`}
        style={{ 
          WebkitOverflowScrolling: "touch", 
          touchAction: "auto",
          // Additional iOS Safari fixes
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: viewportHeight,
          minHeight: viewportHeight,
          maxHeight: viewportHeight,
          // Prevent content bleeding through
          isolation: 'isolate',
          zIndex: 9999, // Much higher z-index
          // Ensure proper stacking context
          WebkitTransform: 'translate3d(0, 0, 0)',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          // Force full viewport coverage
          margin: 0,
          padding: 0,
          // Allow scrolling within the modal
          overflow: 'auto',
          // Force hardware acceleration
          willChange: 'transform',
          // Prevent any content from showing through
          backgroundColor: 'rgb(229 231 235)'
        }}
        onClick={closeOnBackdropClick ? onClose : undefined}
      >
        {/* Prevent clicks on contents from closing via backdrop */}
        <div onClick={(e) => e.stopPropagation()}>
          <div
            className={`mx-auto h-full relative modal-content ${
              fullscreen
                ? "bg-gray-200"
                : "w-full bg-transparent shadow-none border-none pt-6 px-6 h-full"
            }`}
            style={fullscreen ? {} : { 
              maxWidth: '896px', 
              margin: '0 auto', 
              width: '100%',
              paddingBottom: 'env(safe-area-inset-bottom, 20px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-light text-base">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
