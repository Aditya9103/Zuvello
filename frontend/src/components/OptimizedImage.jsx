import React, { useState, useEffect, useRef } from 'react';

const OptimizedImage = ({
    src,
    alt,
    className = '',
    fallbackSrc = 'https://via.placeholder.com/400x300?text=Image+Not+Found',
    eager = false, // Set to true for above-fold images
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        // If eager loading, load immediately
        if (eager) {
            const img = new Image();
            img.src = src;

            img.onload = () => {
                setImageSrc(src);
                setIsLoading(false);
            };

            img.onerror = () => {
                setImageSrc(fallbackSrc);
                setIsLoading(false);
                setHasError(true);
            };

            return;
        }

        // Otherwise use lazy loading with Intersection Observer
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = new Image();
                        img.src = src;

                        img.onload = () => {
                            setImageSrc(src);
                            setIsLoading(false);
                        };

                        img.onerror = () => {
                            setImageSrc(fallbackSrc);
                            setIsLoading(false);
                            setHasError(true);
                        };

                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '100px', // Start loading 100px before entering viewport
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            if (imgRef.current) {
                observer.unobserve(imgRef.current);
            }
        };
    }, [src, fallbackSrc, eager]);

    return (
        <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            className={`${className} ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}
            onError={() => {
                if (!hasError) {
                    setImageSrc(fallbackSrc);
                    setHasError(true);
                }
            }}
            {...props}
        />
    );
};

export default OptimizedImage;
