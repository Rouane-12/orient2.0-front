import { useState, useEffect } from 'react';

export default function ImageSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = ['/images/f1.jpg', '/images/f3.jpg', '/images/f4.jpg', '/images/f5.jpg'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      overflow: 'hidden'
    }}>
      {images.map((image, index) => (
        <img
          key={image}
          src={image}
          alt={`Slide ${index + 1}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: index === currentIndex ? 0.8 : 0,
            transition: 'opacity 1s ease-in-out',
          }}
        />
      ))}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.35) 100%)',
        zIndex: 1
      }} />
    </div>
  );
}
