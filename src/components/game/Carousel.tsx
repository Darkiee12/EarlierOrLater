import React, { useCallback, useEffect, useState } from "react";
import { EmblaOptionsType, EmblaCarouselType } from "embla-carousel";
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from "@/components/game/CarouselArrowButtons";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { DetailedEventType } from "@/lib/types/events/DetailedEvent";
import { monthNames } from "@/lib/types/events/eventdate";
import Image from "next/image";
import Option from "@/lib/rust_prelude/option";
import { FaExternalLinkAlt } from "react-icons/fa";
type PropType = {
  slides: DetailedEventType[];
  options?: EmblaOptionsType;
};

const Carousel: React.FC<PropType> = (props) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [Autoplay()]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const getImageSrc = (event: DetailedEventType): Option<string> =>
    Option.into(event.thumbnail).map((img) => img.source);
  const onNavButtonClick = useCallback((emblaApi: EmblaCarouselType) => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;

    const resetOrStop =
      autoplay.options.stopOnInteraction === false
        ? autoplay.reset
        : autoplay.stop;

    resetOrStop();
  }, []);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect).on('select', onSelect);
  }, [emblaApi, onSelect]);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi, onNavButtonClick);

  return (
    <section className="w-screen sm:max-w-4xl mx-auto">
      <div className="px-2">
         <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y touch-pinch-zoom -ml-4">
          {slides.map((event) => (
            <div
              className="min-w-0 pl-4 transform-gpu flex-[0_0_100%]"
              key={event.id}
            >
              <div className="shadow-[inset_0_0_0_0.2rem_currentColor] border-none font-semibold flex items-center justify-center select-none">
                <div
                  key={event.id}
                  className="p-1 flex items-center justify-center"
                >
                  <div className="px-4 h-[20rem]">
                    <div className="flex">
                      <div className="w-1/2 h-full px-1 flex flex-col">
                        <p className="text-xs py-1">{`${
                          monthNames[event.month]
                        } ${event.day}, ${event.year}`}</p>
                        <p className="text-lg font-bold text-center">
                          {event.title}
                        </p>
                        <div className="overflow-y-auto flex-1">
                          <p>{event.extract}</p>
                        </div>
                      </div>
                      <div className="w-1/2 h-full flex items-center justify-center">
                        {getImageSrc(event).match({
                          Some: (src) => <ImageComponent source={src} alt={event.title} />,
                          None: () => (
                            <div className="flex items-center justify-center">
                              No image preview :(
                            </div>
                          ),
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center items-center gap-[0.6rem] mt-2">
        <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
        <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        <span>
          <a
            href={slides[currentIndex ?? 0]?.contentUrls.desktop.page}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaExternalLinkAlt className="inline-block ml-2 w-[2rem] h-[2rem]" />
          </a>
        </span>
      </div>
      </div>
     
    </section>
  );
};

const ImageComponent: React.FC<{ source: string, alt: string }> = ({ source, alt }) => {
  return source.endsWith('.gif') ? <Image
      src={source}
      alt={alt}
      width={256}
      height={256}
      unoptimized={true}
      className="object-scale-down w-[256px] h-[256px] py-3"
    /> : <Image
      src={source}
      alt={alt}
      width={256}
      height={256}
      className="object-scale-down w-[256px] h-[256px] py-3"
    />;
};

export default Carousel;
