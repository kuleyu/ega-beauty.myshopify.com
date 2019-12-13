var $ = jQuery.noConflict();
"use_strict";

/*!
 * Object: EGA.product
 * Author: Tu.Nguyen
 *
 * Product Scripts Object
 * Do not Change this Object
 *
 ------------------*/

EGA.product = {
  // add to cart
  addToCartBtn: '[data-role=addtocart]',
  buyNowBtn: '[data-role=buynow]',
  removeItemBtn: '[data-role=removeitem]',
  quickViewBtn: '[data-role=quickview]',

  // quantity
  quantityTag: '[data-role=quantity]',
  qtyInput: '[data-role=qty]',
  qtyMinus: '[data-role=minus]',
  qtyPlus: '[data-role=plus]',

  /*
 * function: productPage()
 * Tu.Nguyen
 * v.1.0 20161104
 * update variant
 ------------------*/
  productPage: function(options) {
    var variant = options.variant,
        translations = options.translations;

    // Selectors
    var addToCart = options.productTag.addToCart,
        buyNow = options.productTag.buyNow,
        productSlideThumb = options.productTag.productSlideThumb,
        price = options.productTag.price,
        comparePrice = options.productTag.comparePrice,
        quantity = options.productTag.quantity,
        sale = options.productTag.sale;

    if (variant) {

      // Update variant image, if one is set
      
      if (variant.featured_image) {
        var newImg = variant.featured_image.src;
        this.switchImage(newImg, productSlideThumb);
      }
      

      // Select a valid variant if available
      if (variant.available) {
        // Available, enable the submit button, change text, show quantity elements
        addToCart.removeClass('disabled').prop('disabled', false);
        addToCart.html(translations.addToCart);
        buyNow.show();
        quantity.show();
      } else {
        // Sold out, disable the submit button, change text, hide quantity elements
        addToCart.addClass('disabled').prop('disabled', true);
        addToCart.html(translations.soldOut);
        buyNow.hide();
        quantity.hide();
      }

      // Regardless of stock, update the product price
      price.html( EGA.platform.formatMoney(variant.price, EGA.moneyFormat)).show();
      comparePrice.hide();
      sale.hide();

      // Also update and show the product's compare price if necessary
      if (variant.compare_at_price > variant.price) {
        comparePrice
        .html(EGA.platform.formatMoney(variant.compare_at_price, EGA.moneyFormat))
        .show();
        sale.show();
      }

    } else {
      // The variant doesn't exist, disable submit button.
      // This may be an error or notice that a specific variant is not available.
      // To only show available variants, implement linked product options:
      //   - http://docs.shopify.com/manual/configuration/store-customization/advanced-navigation/linked-product-options
      addToCart.addClass('disabled').prop('disabled', true);
      addToCart.html(translations.unavailable);
      buyNow.hide();
      quantity.hide();
      price.hide();
      comparePrice.hide();
      sale.hide();
    }
  },

  /*
 * Tu.Nguyen
 * v.1.0 20160728
 * Change quantity
 ------------------*/
  updateQuantity: function() {
    var quantityTag = this.quantityTag,
        qtyInput = this.qtyInput,
        qtyMinus = this.qtyMinus,
        qtyPlus = this.qtyPlus,
        addToCartBtn = this.addToCartBtn,
        buyNowBtn = this.buyNowBtn;
    $.each($(quantityTag), function() {
      var form = $(this).parents('form');
      var quantity = parseInt($(this).find(qtyInput).val());
      $(this).find(qtyMinus).click(function() {
        if (quantity > 0) {
          if (quantity === 1) {
            form.find(addToCartBtn).addClass('disabled','disabled');
            form.find(buyNowBtn).addClass('disabled','disabled');
          }
          quantity -= 1;
        }
        else {
          quantity = 0;
        }
        $(this).parent().find(qtyInput).val(quantity);

      });
      $(this).find(qtyPlus).click(function() {
        form.find(addToCartBtn).removeClass('disabled');
        form.find(buyNowBtn).removeClass('disabled');
        if (quantity < 100) {
          quantity += 1;
        }
        else {
          quantity = 100;
        }
        $(this).parent().find(qtyInput).val(quantity);
      });

      $(this).find(qtyInput).on('change', function(){
        var qty = parseInt($(this).val()); 
        if(qty <= 0){
          form.find(addToCartBtn).addClass('disabled');
          form.find(buyNowBtn).addClass('disabled');
        }
        else {
          form.find(addToCartBtn).removeClass('disabled');
          form.find(buyNowBtn).removeClass('disabled');
        }
      });
    })
  },

  /*
* Tu.Nguyen 
* v.1.0 20160727
*	Update Cart Ajax
------------------*/
  updateCartAjax: function(cart) {
    if(cart.item_count <= 0) {
      $('#top_cart_content .no_item').removeClass('hidden');
      $('#top_cart_content .has_items').addClass('hidden');
    }
    else {
      var itemId, itemUrl, itemImage, itemTitle, itemVariant, itemPrice, itemQuantity;
      var source   = $("#top_cart_template").html();
      var template = Handlebars.compile(source);
      var context;
      var html = '';

      for(var i in cart.items) {
        itemId = cart.items[i].id;
        itemUrl = cart.items[i].url;
        itemImage = EGA.platform.resizeImage(cart.items[i].image, 'small');
        itemTitle = cart.items[i].product_title;
        itemVariant = (cart.items[i].variant_options[0].indexOf('Default') >= 0) ? null : cart.items[i].variant_options;
        itemPrice = EGA.platform.formatMoney(cart.items[i].price, EGA.moneyFormat);
        itemQuantity = cart.items[i].quantity;

        context = {
          item_id: itemId,
          item_url: itemUrl,
          item_image: itemImage,
          item_title: itemTitle,
          item_variant: itemVariant,
          item_price: itemPrice,
          item_quantity: itemQuantity
        }
        html += template(context);        
      }
      $('#top_cart_content .has_items .top_cart_items').html(html);
      $('#top_cart_content .has_items').removeClass('hidden');
      $('#top_cart_content .no_item').addClass('hidden');
    }

    var qtyHtml = $('.top_cart_title strong, #top_cart_trigger');
    var cartQty = cart.item_count;
    var totalPrice = EGA.platform.formatMoney(cart.total_price, EGA.moneyFormat);
    qtyHtml.html(cartQty);
    $('.top_cart_price ins').html(totalPrice);
  },

  /*
* Tu.Nguyen 
* v.1.0 20160727
*	Add item to cart
------------------*/
  addToCartSuccessPopup: function(item) {
    var itemTitle = item.title,
        itemUrl = item.url,
        itemImg = EGA.platform.resizeImage(item.image, 'compact'),
        itemVariant = item.variant_title,
        itemPrice = EGA.platform.formatMoney(item.price, EGA.moneyFormat);
    var tagPopup = $('#add_cart_popup');

    tagPopup.find('.product_image a').attr('href', itemUrl);
    tagPopup.find('.product_image img').attr({'src': itemImg, 'alt': itemTitle});
    tagPopup.find('.product_title a').attr('href', itemUrl);
    tagPopup.find('.product_title a').text(itemTitle);
    tagPopup.find('.product_price ins').text(itemPrice);

    tagPopup.modal();
    tagPopup.on('shown.bs.modal', function() {
      setTimeout(function(e) {
        tagPopup.modal('hide');
      }, 2000)
    });
  },

  addToCartSuccess: function(data) {
    EGA.platform.getCart(this.updateCartAjax);
    this.addToCartSuccessPopup(data);
  },

  addToCart: function(formId, callback) {
    if(typeof callback !== 'function') {
      callback = this.addToCartSuccess.bind(this);
    }
    EGA.platform.addItemFromForm(formId, callback);
  },

  /**
* Tu.Nguyen 
* v.1.0 20160727
 * Remove item in cart ajax
 ------------------*/
  deleteItem: function(variant_id, callback) {
    if(typeof callback !== 'function') {
      callback = this.updateCartAjax;
    }
    EGA.platform.removeItem(variant_id, callback);
  },

  /*
 * Tu.Nguyen 
 * v.1.0 20160727
 * Swich Image when change variant.
 ------------------*/
  switchImage: function(newImg, productSlideThumb) {
    var imgSize = EGA.platform.Image.imageSize(productSlideThumb[0].src);
    var thumbImg = EGA.platform.Image.getSizedImageUrl(newImg, imgSize);

    $.each(productSlideThumb, function() {
      var thumbSlideSrc = $(this).attr('src');
      if(thumbSlideSrc.indexOf(thumbImg) > -1) {
        $(this).click();
        return;
      }
    })    
  },

  /*
 * Tu.Nguyen 
 * v.1.0 20161107
 * quickView()
 * Quick View.
 ------------------*/
  quickView: function() {
    $.each($(this.quickViewBtn), function() {
      $(this).on('click', function(e) {
        e.preventDefault();
        var purl = $(this).attr('href');
        // Get product quick_view
        $.ajax({
          url: purl + '?view=quickview',
          async: false,
          success: function (product) {
            $('#product_popup .modal-body').html(product);
          },
          complete: function() {

          }
        });

        $('#product_popup').modal();
      })
    })
  },
}

/*
* Tu.Nguyen
* v.1.0 20160728
* EGA function
*/
EGA.function = {
  lazyLoad: function() {
    var lazyLoadEl = $('[data-lazyload]');
    lazyLoadEl.each( function(){
      var element = $(this),
          elementImg = element.attr( 'data-lazyload' );
      element.attr({"width": "100%", "height": "100%" });
      element.appear(function () { 
        element.css({'background': 'none', 'content': 'normal' })
        .removeAttr('width height')
        .attr('src', elementImg);
      }, {accX: 0, accY: 120},'easeInCubic');
    });
  },

  tooltip: function() {
    $('[data-toggle="tooltip"]').tooltip({
      html: true
    })
  },

  /*
  * Tu.Nguyen
  * v.1.0 20160922
  * addTitleDropdown()
  * Add Title To Label Of Dropdown Menu
  */
  addTitleDropdown: function() {
    $('.dropdown-menu a').click(function(e) {
      e.preventDefault();
      if(!$(this).parent().hasClass('active')) {
        var titleText = $(this).text(),
            $dropdown	= $(this).parents('.dropdown');
        $dropdown.find('.dropdown-toggle span').text(titleText);
        $dropdown.find('.dropdown-menu li.active').removeClass('active');
        $(this).parent().addClass('active');
      }
    })
  },

  /*
  * Tu.Nguyen
  * v.1.0 20160922
  * goToTop()
  * Go To Top
  */
  goToTop: function(options) {
    var goTopEl = $('#gotoTop'),
        elementScrollSpeed = 700,
        elementScrollEasing = 'swing',
        elementOffset = 450;

    var goToTopShow = function() {
      if( $(window).scrollTop() > Number(elementOffset) ) {
        goTopEl.fadeIn();
      } 
      else {
        goTopEl.fadeOut();
      }
    };
    var goToTopScroll = function() {
      goTopEl.click(function() {
        $('body, html').stop(true).animate({
          'scrollTop': 0
        }, elementScrollSpeed, elementScrollEasing);
        return false;
      });
    };

    $(window).on('scroll', goToTopShow);
    goToTopScroll();
  },

  /*
* Tu.Nguyen
* v.1.0 20160803
*	product Zoom
*/


  /*
* Tu.Nguyen
* v.1.0 20160922
* updateCurrency()
* Update Currency When Change Dropdown Menu
*/
  updateCurrency: function() {
    $('.currency_picker .dropdown-menu a').on('click', function(e) {
      e.preventDefault();
      var value = $(this).attr('href');
      $('[name=currencies] option').prop('selected',false);
      $('[name=currencies] option[value="' + value + '"]').prop('selected', true);
      $('[name=currencies]').change();
    })
  },

  /*
* Tu.Nguyen
* v.1.0 20160925
* topSearchToggle()
* Toggle Top Search When Trigger
*/
  topSearchToggle: function() {
    $('#top_search_trigger').on('click', function(e) {
      e.preventDefault();
      var searchToggle = $('#primary-menu nav, #top_search');
      searchToggle.toggleClass('toggled')
    })
  },


  /*
* Tu.Nguyen
* v.1.0 20161107
* scrollToElement()
* Smooth Scroll To Element
*/
  scrollToElement: function(des, offset) {
    var target = $(des).offset().top - offset;
    //console.log(des)
    $('html, body').animate({'scrollTop': target}, 600, 'swing')

  }
}

EGA.header = {
  sticky: function(options) {
    var headerEl = (options && options.$header_el) ? options.$header_el : '#header',
        elementOffset = (options && options.element_offset != 'undefined') ? options.element_offset : $('#top-bar').height(),
        useSticky = ($(headerEl).attr('data-sticky')) ? $(headerEl).attr('data-sticky') : 'true';
    if(useSticky === 'true') {
      if($(window).scrollTop() > Number(elementOffset)) {
        $(headerEl).addClass('sticky_header');
      }
      else {
        $(headerEl).removeClass('sticky_header');
      }
    }
  }
}

/*
* Tu.Nguyen
* v.1.0 20160813
* EGA filter function
*/
/* Product Tag Filters - Good for any number of filters on any type of collection page.
       Give you product tag filter select element a class of coll-filter.
       Give your collection select a class of coll-picker.
       Brought to you by Caroline Schnapp. */
EGA.queryParams = {};

EGA.filter = {
  mapData: function(data) {
    //console.log(jQuery(data))
    var currentList = $("#shop"),
        newList = $(data).find("#shop");
    currentList.replaceWith(newList);
    $('.filter_group').replaceWith($(data).find('.filter_group'));

  },
  loadAjax: function(newUrl) {
    $.ajax({
      url: newUrl,
      type: 'get',
      beforeSend: function() {
      },
      success: function(data) {
        EGA.filter.mapData(data);
        EGA.init();
        EGA.initFilter();
      },
      error: function() {

      }
    })
  },
  createUrl: function(baseLink) {
    var newQuery = $.param(EGA.queryParams).replace(/%2B/g, '+');
    if (baseLink) {
      return (newQuery != '') ? baseLink + '&' + newQuery : baseLink;
    }
    return location.pathname + '?' + newQuery;

  },

  ajaxClick: function(baseLink) {
    delete EGA.queryParams.page;
    var newUrl = this.createUrl(baseLink);
    history.pushState({
      param: EGA.queryParams
    }, newUrl, newUrl);
    this.loadAjax(newUrl);
  },

  filterCheck: function() {
    $('.filter_group label').click(function() {
      var currentTags = [];
      if (EGA.queryParams.constraint) {
        currentTags = EGA.queryParams.constraint.split('+');
      }

      if (!$(this).prev().is(":checked")) {
        // remove other checked
        var otherTag = $(this).parents('.filter_group').find("input:checked");
        if (otherTag.length > 0) {
          var tagName = otherTag.val();
          if (tagName) {
            var tagPos = currentTags.indexOf(tagName);
            if (tagPos >= 0) {
              //remove tag
              currentTags.splice(tagPos, 1);
            }
          }
        }
      }

      var tagName = $(this).prev().val();
      if (tagName) {
        var tagPos = currentTags.indexOf(tagName);
        if (tagPos >= 0) {
          //tag already existed, remove tag
          currentTags.splice(tagPos, 1);
        } else {
          //tag not existed
          currentTags.push(tagName);
        }
      }
      if (currentTags.length) {
        EGA.queryParams.constraint = currentTags.join('+');
      } else {
        delete EGA.queryParams.constraint;
      }
      EGA.filter.ajaxClick();
    });
  },

  clearAllFilter: function() {
    $('.clear_filter_all').click(function(e) {
      e.preventDefault();
      delete EGA.queryParams.constraint;
      EGA.filter.ajaxClick();
    })
  },

  clearFilter: function() {
    $('.widget.filter').each(function() {
      var sidebarFilter = $(this);
      if(sidebarFilter.find('input:checked').length > 0) {
        sidebarFilter.find('.clear_filter').show().click(function(e) {
          e.preventDefault();
          var currentTags = [];
          if (EGA.queryParams.constraint) {
            currentTags = EGA.queryParams.constraint.split('+');
          }
          sidebarFilter.find("input:checked").each(function() {
            var selectedTag = $(this);
            var tagName = selectedTag.val();
            if (tagName) {
              var tagPos = currentTags.indexOf(tagName);
              if (tagPos >= 0) {
                //remove tag
                currentTags.splice(tagPos, 1);
              }
            }
          });
          if (currentTags.length) {
            EGA.queryParams.constraint = currentTags.join('+');
          } else {
            delete EGA.queryParams.constraint;
          }
          EGA.filter.ajaxClick();
        })
      }
    })
  },

  sortBy: function() {
    $('.sort_group a').click(function(e) {
      e.preventDefault();
      if(!$(this).parent().hasClass('active')) {
        var titleText = $(this).text(),
            dropdown	= $(this).parents('.dropdown');
        dropdown.find('.dropdown-toggle span').text(titleText);
        dropdown.find('.dropdown-menu li.active').removeClass('active');
        $(this).parent().addClass('active');
        EGA.queryParams.sort_by = $(this).attr('href');
        EGA.filter.ajaxClick();
      }
    })
  },

  viewMode: function(baseLink) {
    $('.view_mode a').click(function(e) {
      e.preventDefault();
      if (!$(this).hasClass("active")) {
        var itemLimit = $('.item_limit .active a').attr('href');
        EGA.queryParams.view = $(this).attr('href') + itemLimit;
        EGA.filter.ajaxClick(baseLink);
        $(".view_mode a.active").removeClass("active");
        $(this).addClass("active");
      }
    })
  },

  showItemLimit: function(baseLink) {
    $('.item_limit a').click(function(e) {
      e.preventDefault();      
      if(!$(this).parent().hasClass('active')) {
        var titleText = $(this).text(),
            $dropdown	= $(this).parents('.dropdown'),
            itemLimit = $(this).attr('href'),
            view = $(".view_mode a.active").attr('href');
        $dropdown.find('.dropdown-toggle span').text(titleText);
        $dropdown.find('.dropdown-menu li.active').removeClass('active');
        $(this).parent().addClass('active');
        EGA.queryParams.view = view + itemLimit;
        EGA.filter.ajaxClick(baseLink);
      }
    })
  },

  pagination: function(baseLink) {
    $(".collection_pagination a").click(function(e) {
      e.preventDefault();
      var page = $(this).attr("href").match(/page=\d+/g);
      if (page) {
        EGA.queryParams.page = parseInt(page[0].match(/\d+/g));
        if (EGA.queryParams.page) {
          var newurl = EGA.filter.createUrl(baseLink);
          history.pushState({
            param: EGA.queryParams
          }, newurl, newurl);
          EGA.filter.loadAjax(newurl);
          //go to top
          $('body,html').animate({
            scrollTop: 250
          }, 600);
        }
      }
    });
  }

}

/*
* Tu.Nguyen
* v.1.0 20160814
* EGA customer function
*/
EGA.customer = {
  // Recover Password
  recoverPasswordLink     : $('#RecoverPassword'),
  hideRecoverPasswordLink : $('#HideRecoverPasswordLink'),
  recoverPasswordForm     : $('#RecoverPasswordForm'),
  customerLoginForm       : $('#CustomerLoginForm'),
  passwordResetSuccess    : $('#ResetSuccess'),
  customerHeader		  : $('#login_header h1'),

  showRecoverPassword: function() {
    var _this = this;
    _this.recoverPasswordLink.on('click', function(e) {
      e.preventDefault();
      _this.recoverPasswordForm.show();
      _this.customerLoginForm.hide();
      _this.customerHeader.text("RESET YOUR PASSWORD");
	});
  },

  hideRecoverPassword: function() {
  	var _this = this;
    _this.hideRecoverPasswordLink.on('click', function(e) {
    	e.preventDefault();
        _this.recoverPasswordForm.hide();
        _this.customerLoginForm.show();
        _this.customerHeader.text("LOGIN");
    });
  }
}

/* Init Functions
-----------------------------------------------------------------*/
EGA.init = function() {
	EGA.product.quickView();
    EGA.function.lazyLoad();
}

EGA.initFilter = function() {
	EGA.filter.filterCheck();
    EGA.filter.clearFilter();
    EGA.filter.clearAllFilter();
    EGA.filter.viewMode();
    EGA.filter.pagination();
    EGA.filter.sortBy();
    EGA.filter.showItemLimit();
}
EGA.initSearch = function(baseLink) {
	EGA.filter.viewMode(baseLink);
    EGA.filter.pagination(baseLink);
    EGA.filter.showItemLimit(baseLink);
}