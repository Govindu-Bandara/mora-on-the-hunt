import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export function ProductGallerySwiper({ images, alt }) {
  if (!images || images.length === 0) {
    return <div className="aspect-[4/5] w-full rounded-xl bg-white/5" />;
  }

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true }}
      className="aspect-[4/5] w-full rounded-xl overflow-hidden"
    >
      {images.map((src) => (
        <SwiperSlide key={src}>
          <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
