"use client";
import React, { useState, useEffect } from 'react';

const Banner = () => {
  const banners = [
    '/banner1.jpg',
    '/banner2.jpg',
    '/banner3.jpg'
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    // ❗️ Магія тут: max-w-[1300px] (ширина твого сайту) + mx-auto (центрування)
    <div className='w-full max-w-[1300px] mx-auto mt-6 px-4 xl:px-0'>
      
      <div className='relative w-full overflow-hidden rounded-2xl shadow-lg group'>
        
        {/* Висоту трохи зменшили, щоб вона виглядала акуратніше */}
        <div
          className='flex transition-transform duration-700 ease-out h-[150px] sm:h-[250px] md:h-[300px] lg:h-[350px]'
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((src, index) => (
            <img
              key={index}
              className='w-full h-full object-cover flex-shrink-0'
              src={src}
              alt={`Cyber Monday Promo ${index + 1}`}
            />
          ))}
        </div>

        {/* Ліва стрілка */}
        <button
          className='absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/30 backdrop-blur-sm hover:bg-white/70 text-black rounded-full transition-all opacity-0 group-hover:opacity-100 focus:outline-none z-20'
          onClick={prevSlide}
        >
          <svg className="w-6 h-6 pr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Права стрілка */}
        <button
          className='absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/30 backdrop-blur-sm hover:bg-white/70 text-black rounded-full transition-all opacity-0 group-hover:opacity-100 focus:outline-none z-20'
          onClick={nextSlide}
        >
          <svg className="w-6 h-6 pl-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Навігаційні крапочки */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentIndex === index 
                  ? 'bg-white w-8 shadow-md'
                  : 'bg-white/50 w-2.5 hover:bg-white/80'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default Banner;