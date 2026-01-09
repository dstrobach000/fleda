"use client";

import React, { useEffect, useState, useRef } from "react";
import CurrentLabel from "@/components/BuildingBlocks/Labels/CurrentLabel";
import GlowButton from "@/components/BuildingBlocks/Buttons/GlowButton";

type SlideShowCardProps = {
  images: string[];
  buttonText: string;
  author: string;
  date: string;
  interval?: number;
  onPillClick?: () => void;
  buttonClassName?: string;
  isCurrent?: boolean;
  exhibitionGraphic?: string; // Optional exhibition graphic URL
};

const SlideShowCard: React.FC<SlideShowCardProps> = ({
  images,
  buttonText,
  author,
  date,
  interval = 4,
  onPillClick,
  buttonClassName,
  isCurrent = false,
  exhibitionGraphic,
}) => {
  const [index, setIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to only load images when slideshow is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '200px' // Start loading 200px before entering viewport for smoother experience
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (images.length === 0 || !isVisible) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval * 1000);
    return () => clearInterval(timer);
  }, [images.length, interval, isVisible]);

  // Optimized image preloading - only preload next 2 images
  useEffect(() => {
    if (!isVisible || images.length <= 1) return;
    
    // Only preload the next 2 images to reduce memory usage
    const imagesToPreload = Math.min(2, images.length - 1);
    
    for (let i = 1; i <= imagesToPreload; i++) {
      const img = new window.Image();
      img.src = images[i];
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, i]));
      };
      img.onerror = () => {
        setLoadedImages(prev => new Set([...prev, i]));
      };
    }
  }, [isVisible, images]);

  // Preload next image only when needed (reduced frequency)
  useEffect(() => {
    if (!isVisible || images.length <= 1) return;
    
    const nextIndex = (index + 1) % images.length;
    if (!loadedImages.has(nextIndex) && nextIndex <= 2) { // Only preload first 2 additional images
      const img = new window.Image();
      img.src = images[nextIndex];
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, nextIndex]));
      };
      img.onerror = () => {
        setLoadedImages(prev => new Set([...prev, nextIndex]));
      };
    }
  }, [index, images.length, loadedImages, isVisible, images]);

  return (
    <div ref={containerRef} className="w-full aspect-[4/5] flex flex-col items-start">
      <div className="relative w-full h-full overflow-hidden shadow-md">
        {/* Always render first image immediately for LCP optimization */}
        {images.length > 0 && (
          <div
            className={`absolute inset-0 ${
              0 === index ? 'block' : 'hidden'
            }`}
          >
            <img
              src={images[0]}
              alt={`${author} 1`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Render other images only when visible and loaded */}
        {isVisible && images.slice(1).map((imageSrc, imgIndex) => {
          const actualIndex = imgIndex + 1;
          if (!loadedImages.has(actualIndex)) return null;
          return (
            <div
              key={imageSrc}
              className={`absolute inset-0 ${
                actualIndex === index ? 'block' : 'hidden'
              }`}
            >
              <img
                src={imageSrc}
                alt={`${author} ${actualIndex + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          );
        })}
        
        {/* Show exhibition graphic when no photos are available */}
        {images.length === 0 && exhibitionGraphic && (
          <div className="absolute inset-0">
            <img
              src={exhibitionGraphic}
              alt={`${author} exhibition graphic`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Show loading state when not visible and no images/graphic */}
        {!isVisible && images.length === 0 && !exhibitionGraphic && (
          <div className="w-full h-full bg-gray-100 animate-pulse" />
        )}
        
        <div className="absolute inset-0 flex items-center justify-center">
          <GlowButton
            onClick={onPillClick}
            className={`inline-block px-6 py-2 text-sm font-light text-black ${buttonClassName || ""}`}
            glowColor="bg-orange-500"
            floating={false}
            type="button"
          >
            {buttonText}
          </GlowButton>
        </div>
      </div>

      {/* Author, Date, and Aktuální button below image */}
      <div className="mt-2 w-full flex flex-row items-center justify-between">
        <div className="text-left text-sm text-black font-light">
          {author}
          <br />
          {date}
        </div>
        {isCurrent && (
          <CurrentLabel>
            Aktuální
          </CurrentLabel>
        )}
      </div>
    </div>
  );
};

export default SlideShowCard;
