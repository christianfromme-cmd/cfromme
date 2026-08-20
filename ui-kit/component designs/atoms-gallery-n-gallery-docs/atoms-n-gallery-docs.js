document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    document.querySelectorAll('.n-gallery_swiper').forEach((swiperElement, index) => {
        const swiperId = `n-gallery-swiper-${index}`;
        swiperElement.id = swiperId;

        const autoplayAttr = swiperElement.getAttribute('data-autoplay');
        const shouldAutoplay = autoplayAttr === 'true';
        const autoplaySpeed = swiperElement.dataset.autoplayspeed ? parseInt(swiperElement.dataset.autoplayspeed) : 2500;

        const swiperWrapper = swiperElement.querySelector('.swiper-wrapper');
        const slides = swiperWrapper.querySelectorAll('.swiper-slide');
        const hasMultipleSlides = slides.length > 1;
        swiperWrapper.classList.toggle('has-multiple-slides', hasMultipleSlides);

        const prevButton = swiperElement.querySelector('.prev-button-container');
        const nextButton = swiperElement.querySelector('.next-button-container');

        if (prevButton) {
            const prevIcon = prevButton.querySelector('.prev-button-icon');
            const prevIconUrl = prevButton.dataset.icon;
            if (prevIcon && prevIconUrl) {
                prevIcon.style.webkitMaskImage = `url('${prevIconUrl}')`;
                prevIcon.style.maskImage = `url('${prevIconUrl}')`;
            }
        }

        if (nextButton) {
            const nextIcon = nextButton.querySelector('.next-button-icon');
            const nextIconUrl = nextButton.dataset.icon;
            if (nextIcon && nextIconUrl) {
                nextIcon.style.webkitMaskImage = `url('${nextIconUrl}')`;
                nextIcon.style.maskImage = `url('${nextIconUrl}')`;
            }
        }

        const swiperConfig = {
            speed: 300,
            loop: hasMultipleSlides,
            updateOnImagesReady: true,
            allowTouchMove: hasMultipleSlides,
            navigation: {
                nextEl: `#${swiperId} .next-button-container`,
                prevEl: `#${swiperId} .prev-button-container`,
            },
            pagination: {
                el: `#${swiperId} .n-gallery_pagination`,
                type: 'bullets',
                clickable: true,
                dynamicBullets: true,
                dynamicMainBullets: 1,
            },
        };

        if (shouldAutoplay === true) {
            swiperConfig.autoplay = {
                delay: autoplaySpeed,
                disableOnInteraction: false,
            };
        }

        const swiperInstance = new Swiper(`#${swiperId}`, swiperConfig);

        // Prevent autoplay after init
        const container = swiperElement.closest('.tile__container');
        if (!container?.classList.contains('tile__container--big')) {
            swiperInstance?.autoplay?.stop();
        }

        // Start or stop autoplay after tile click
        const observer = new MutationObserver(() => {
            const container = swiperElement.closest('.tile__container');
            if (shouldAutoplay && (container?.classList.contains('tile__container--big') || container?.classList.contains('is-open'))) {
                swiperInstance.autoplay?.start();
            } else {
                swiperInstance.autoplay?.stop();
            }
        });

        const galleryContainer = swiperElement.closest('.tile__container');
        if (galleryContainer) {
            observer.observe(galleryContainer, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    });
});