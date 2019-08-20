/**
 * Include your custom JavaScript here.
 *
 * We also offer some hooks so you can plug your own logic. For instance, if you want to be notified when the variant
 * changes on product page, you can attach a listener to the document:
 *
 * document.addEventListener('variant:changed', function(event) {
 *   var variant = event.detail.variant; // Gives you access to the whole variant details
 * });
 *
 * You can also add a listener whenever a product is added to the cart:
 *
 * document.addEventListener('product:added', function(event) {
 *   var variant = event.detail.variant; // Get the variant that was added
 *   var quantity = event.detail.quantity; // Get the quantity that was added
 * });
 */


$(document).ready(function() {
	$(".JXB.FeaturedImage.Major .FlexContainer").slick({
		mobileFirst: true,
		dots: true,
		responsive: [{
			breakpoint: 768,
			settings: 'unslick',
		}]
	});

    $('[data-action="reveal-drawer"]').on('click', this, function() {
        $this = $(this);
        $drawer = $('#' + $this.attr('data-drawer-id'));
        $this.toggleClass('is-open');
        $drawer.toggleClass('open');
    });
});

window.theme = window.theme || {}


// ################################################################################################################
// SCRIPTS
// ################################################################################################################
theme.scripts = (function () {
	function init() {
		$('a[href="#"]').on('click', function (e) {
			e.preventDefault()
		})

		$('.js-back-top').on('click', function (e) {
			e.preventDefault()
			$('html, body').animate({ scrollTop: 0 }, 'fast')
		})
	}
	return {
		init: init,
	}
})()


// ################################################################################################################
// PRODUCT SECTION
// ################################################################################################################
theme.ProductSection = (function () {
	function ProductSection(container, flickityInstance) {
		this.flickityInstance = flickityInstance
		this.cache = {}
		this.productData = {}
		this.$container = $(container)
		this.captureProductJSON()
		this.cacheSelectors(container)
		this.initSwatches()
		this.initSliderNav()
		this.bindUIEvents()
	}

	ProductSection.prototype.captureProductJSON = function () {
		var jsonData = JSON.parse(this.$container[0].querySelector('[data-product-json]').innerHTML)
		this.productData = jsonData.product
		this.productData.currentVariant = this.productData.variants.filter(function (variant) {
			return variant.id === jsonData.selected_variant_id
		})[0]

		var self = this
		
		if (!self.flickityInstance) {
			$('.Product__SlideItem').each(function () {
				var color = $(this).attr('data-color')
				if (self.productData.currentVariant.options.indexOf(color) !== -1 || color === self.productData.title) {
					$(this).show()
				} else {
					$(this).hide()
				}
			})
		}
	}

	ProductSection.prototype.cacheSelectors = function (container) {
		this.cache.$carousel = $(container).find('Carousel')
		this.cache.$form = this.$container.find('form[action^="/cart/add"]')
		this.cache.$radio = this.$container.find('.swatch :radio')
		this.cache.$sliderNav = $('.Product__SlideshowNavScroller')
	}

	ProductSection.prototype.initSwatches = function () {
		var variant = this.productData.currentVariant
		if (variant) {
			var form = this.cache.$form
			for (var i=0,length=variant.options.length; i<length; i++) {
				var radioButton = form.find('.swatch[data-option-index="' + i + '"] :radio[value="' + variant.options[i] +'"]')
				if (radioButton.size()) {
					radioButton.get(0).checked = true
					radioButton.closest('.js-swatch-element').addClass('element-checked')
				}
			}
		}
	}

	ProductSection.prototype.initSliderNav = function () {
		this.cache.$sliderNav.flickity({
			asNavFor: '.Product__Slideshow',
			contain: true,
			pageDots: false,
			prevNextButtons: false,
		})
	}

	ProductSection.prototype.bindUIEvents = function () {
		var self = this
		this.cache.$radio.on('change', function () {
			var $swatchElement = $(this).parent()
			$(this)
				.closest('.swatch')
				.find('.js-swatch-element')
				.not($swatchElement)
				.removeClass('element-checked')
			$swatchElement.addClass('element-checked')

			var optionIndex = $(this)
				.closest('.swatch')
				.attr('data-option-index')
			var optionValue = $(this).val()

			if (!self.flickityInstance) {
				$('.Product__SlideItem').each(function (i) {
					var color = $(this).attr('data-color')
					if (color === optionValue || color === self.productData.title) {
						$(this).show()
					} else {
						$(this).hide()
					}
				})
			}

			if (self.flickityInstance) {
				var index = -1
				$('.Product__SlideItem').each(function (i) {
					var color = $(this).attr('data-color')
					var isMatch = color === optionValue || color === self.productData.title
					if (isMatch && index === -1) {
						index = i
					}
				})

				if (index !== -1) {
					self.flickityInstance.select(index, false, true)
				}
			}

			self.$container
				.find('.js-swatch-header')
				.eq(optionIndex)
				.text(optionValue)

			self.$container
				.find('.OptionSelector')
				.eq(optionIndex)
				.find('.Popover__Value[data-value="' + optionValue + '"]')
				.trigger('click')
		})
	}

	return ProductSection
})()


// ################################################################################################################
// COLLECTION SECTION
// ################################################################################################################
theme.CollectionSection = (function () {
	function CollectionSection() {
		this.endlessScroll = new Ajaxinate({
			method: 'click',
			callback: function () {
				$('.ProductItem').each(function () {
					if (!$(this).is('visible')) {
						$(this).css({
							visibility: 'inherit',
							opacity: '1',
							transform: 'matrix(1, 0, 0, 1, 0, 0)',
						})
					}
				})
			}
		})
	}

	return CollectionSection
})()


// ################################################################################################################
// QUICKVIEW
// ################################################################################################################
theme.QuickViewSection = (function () {
	function QuickViewSection(container) {
		var $carousel = $(container).find('Carousel')
		this.otherSection = new theme._ProductSection(container)
		this.section = new theme.ProductSection(container, this.otherSection.productSlideshow.flickityInstance)
		this.otherSection.productSlideshow.flickityInstance.reposition()
	}

	return QuickViewSection
})()


// ################################################################################################################
// VIDEO MODULE
// ################################################################################################################
theme.videoModule = (function () {
	function init() {
		var $playBtn = $('.js-video-play')
		var $video = $('.js-video')

		$playBtn.on('click', function () {
				var $container = $(this).parent().parent().parent()
				var videoId = $(this).attr('data-video')
				var $video = $('#' + videoId)
				$container.fadeOut(function () {
						$video[0].play()
				})
		})

		$video.on('ended', function () {
				$(this).prev().fadeIn()
		})
	}
	return { init: init }
})()


// ################################################################################################################
// ABOUT
// ################################################################################################################
theme.AboutSection = (function () {
	function AboutSection(container) {
		theme.videoModule.init()
	}

	return AboutSection
})()


// ################################################################################################################
// HERO VIDEO
// ################################################################################################################
theme.HeroVideoSection = (function () {
	function HeroVideoSection(container) {
		theme.videoModule.init()
	}

	return HeroVideoSection
})()


// ################################################################################################################
// INIT
// ################################################################################################################
theme.init = function () {
	theme.scripts.init()
	theme.sections.register('product', theme.ProductSection)
	theme.sections.register('collection', theme.CollectionSection)
	theme.sections.register('about', theme.AboutSection)
	theme.sections.register('hero-video', theme.HeroVideoSection)
}

$(theme.init)
