(function($) {
  // Function to update labels of text fields
  M.updateTextFields = function() {
    let input_selector =
      'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], input[type=date], input[type=time], textarea';
    $(input_selector).each(function(element, index) {
      let $this = $(this);
      if (
        element.value.length > 0 ||
        $(element).is(':focus') ||
        element.autofocus ||
        $this.attr('placeholder') !== null
      ) {
        $this.siblings('label').addClass('active');
      } else if (element.validity) {
        $this.siblings('label').toggleClass('active', element.validity.badInput === true);
      } else {
        $this.siblings('label').removeClass('active');
      }
    });
  };

  M.validate_field = function(object) {
    let hasLength = object.attr('data-length') !== null;
    let lenAttr = parseInt(object.attr('data-length'));
    let len = object[0].value.length;

    if (len === 0 && object[0].validity.badInput === false && !object.is(':required')) {
      if (object.hasClass('validate')) {
        object.removeClass('valid');
        object.removeClass('invalid');
      }
    } else {
      if (object.hasClass('validate')) {
        // Check for character counter attributes
        if (
          (object.is(':valid') && hasLength && len <= lenAttr) ||
          (object.is(':valid') && !hasLength)
        ) {
          object.removeClass('invalid');
          object.addClass('valid');
        } else {
          object.removeClass('valid');
          object.addClass('invalid');
        }
      }
    }
  };

  M.textareaAutoResize = function($textarea) {
    // Wrap if native element
    if ($textarea instanceof Element) {
      $textarea = $($textarea);
    }

    if (!$textarea.length) {
      console.error('No textarea element found');
      return;
    }

    // Textarea Auto Resize
    let hiddenDiv = $('.hiddendiv').first();
    if (!hiddenDiv.length) {
      hiddenDiv = $('<div class="hiddendiv common"></div>');
      $('body').append(hiddenDiv);
    }

    // Set font properties of hiddenDiv
    let fontFamily = $textarea.css('font-family');
    let fontSize = $textarea.css('font-size');
    let lineHeight = $textarea.css('line-height');

    // Firefox can't handle padding shorthand.
    let paddingTop = $textarea.css('padding-top');
    let paddingRight = $textarea.css('padding-right');
    let paddingBottom = $textarea.css('padding-bottom');
    let paddingLeft = $textarea.css('padding-left');

    if (fontSize) {
      hiddenDiv.css('font-size', fontSize);
    }
    if (fontFamily) {
      hiddenDiv.css('font-family', fontFamily);
    }
    if (lineHeight) {
      hiddenDiv.css('line-height', lineHeight);
    }
    if (paddingTop) {
      hiddenDiv.css('padding-top', paddingTop);
    }
    if (paddingRight) {
      hiddenDiv.css('padding-right', paddingRight);
    }
    if (paddingBottom) {
      hiddenDiv.css('padding-bottom', paddingBottom);
    }
    if (paddingLeft) {
      hiddenDiv.css('padding-left', paddingLeft);
    }

    // Set original-height, if none
    if (!$textarea.data('original-height')) {
      $textarea.data('original-height', $textarea.height());
    }

    if ($textarea.attr('wrap') === 'off') {
      hiddenDiv.css('overflow-wrap', 'normal').css('white-space', 'pre');
    }

    hiddenDiv.text($textarea[0].value + '\n');
    let content = hiddenDiv.html().replace(/\n/g, '<br>');
    hiddenDiv.html(content);

    // When textarea is hidden, width goes crazy.
    // Approximate with half of window size

    if ($textarea[0].offsetWidth > 0 && $textarea[0].offsetHeight > 0) {
      hiddenDiv.css('width', $textarea.width() + 'px');
    } else {
      hiddenDiv.css('width', window.innerWidth / 2 + 'px');
    }

    /**
     * Resize if the new height is greater than the
     * original height of the textarea
     */
    if ($textarea.data('original-height') <= hiddenDiv.innerHeight()) {
      $textarea.css('height', hiddenDiv.innerHeight() + 'px');
    } else if ($textarea[0].value.length < $textarea.data('previous-length')) {
      /**
       * In case the new height is less than original height, it
       * means the textarea has less text than before
       * So we set the height to the original one
       */
      $textarea.css('height', $textarea.data('original-height') + 'px');
    }
    $textarea.data('previous-length', $textarea[0].value.length);
  };

  $(document).ready(function() {
    // Text based inputs
    let input_selector =
      'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], input[type=date], input[type=time], textarea';

    // Add active if form auto complete
    $(document).on('change', input_selector, function() {
      if (this.value.length !== 0 || $(this).attr('placeholder') !== null) {
        $(this)
          .siblings('label')
          .addClass('active');
      }
      M.validate_field($(this));
    });

    // Add active if input element has been pre-populated on document ready
    $(document).ready(function() {
      M.updateTextFields();
    });

    // HTML DOM FORM RESET handling
    $(document).on('reset', function(e) {
      let formReset = $(e.target);
      if (formReset.is('form')) {
        formReset
          .find(input_selector)
          .removeClass('valid')
          .removeClass('invalid');
        formReset.find(input_selector).each(function(e) {
          if (this.value.length) {
            $(this)
              .siblings('label')
              .removeClass('active');
          }
        });

        // Reset select (after native reset)
        setTimeout(function() {
          formReset.find('select').each(function() {
            // check if initialized
            if (this.M_FormSelect) {
              $(this).trigger('change');
            }
          });
        }, 0);
      }
    });

    /**
     * Add active when element has focus
     * @param {Event} e
     */
    document.addEventListener(
      'focus',
      function(e) {
        if ($(e.target).is(input_selector)) {
          $(e.target)
            .siblings('label, .prefix')
            .addClass('active');
        }
      },
      true
    );

    /**
     * Remove active when element is blurred
     * @param {Event} e
     */
    document.addEventListener(
      'blur',
      function(e) {
        let $inputElement = $(e.target);
        if ($inputElement.is(input_selector)) {
          let selector = '.prefix';

          if (
            $inputElement[0].value.length === 0 &&
            $inputElement[0].validity.badInput !== true &&
            $inputElement.attr('placeholder') === null
          ) {
            selector += ', label';
          }
          $inputElement.siblings(selector).removeClass('active');
          M.validate_field($inputElement);
        }
      },
      true
    );

    // Radio and Checkbox focus class
    let radio_checkbox = 'input[type=radio], input[type=checkbox]';
    $(document).on('keyup', radio_checkbox, function(e) {
      // TAB, check if tabbing to radio or checkbox.
      if (e.which === M.keys.TAB) {
        $(this).addClass('tabbed');
        let $this = $(this);
        $this.one('blur', function(e) {
          $(this).removeClass('tabbed');
        });
        return;
      }
    });

    let text_area_selector = '.materialize-textarea';
    $(text_area_selector).each(function() {
      let $textarea = $(this);
      /**
       * Resize textarea on document load after storing
       * the original height and the original length
       */
      $textarea.data('original-height', $textarea.height());
      $textarea.data('previous-length', this.value.length);
      M.textareaAutoResize($textarea);
    });

    $(document).on('keyup', text_area_selector, function() {
      M.textareaAutoResize($(this));
    });
    $(document).on('keydown', text_area_selector, function() {
      M.textareaAutoResize($(this));
    });

    // File Input Path
    $(document).on('change', '.file-field input[type="file"]', function() {
      let file_field = $(this).closest('.file-field');
      let path_input = file_field.find('input.file-path');
      let files = $(this)[0].files;
      let file_names = [];
      for (let i = 0; i < files.length; i++) {
        file_names.push(files[i].name);
      }
      path_input[0].value = file_names.join(', ');
      path_input.trigger('change');
    });
  }); // End of $(document).ready
})(cash);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJmb3Jtcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oJCkge1xyXG4gIC8vIEZ1bmN0aW9uIHRvIHVwZGF0ZSBsYWJlbHMgb2YgdGV4dCBmaWVsZHNcclxuICBNLnVwZGF0ZVRleHRGaWVsZHMgPSBmdW5jdGlvbigpIHtcclxuICAgIGxldCBpbnB1dF9zZWxlY3RvciA9XHJcbiAgICAgICdpbnB1dFt0eXBlPXRleHRdLCBpbnB1dFt0eXBlPXBhc3N3b3JkXSwgaW5wdXRbdHlwZT1lbWFpbF0sIGlucHV0W3R5cGU9dXJsXSwgaW5wdXRbdHlwZT10ZWxdLCBpbnB1dFt0eXBlPW51bWJlcl0sIGlucHV0W3R5cGU9c2VhcmNoXSwgaW5wdXRbdHlwZT1kYXRlXSwgaW5wdXRbdHlwZT10aW1lXSwgdGV4dGFyZWEnO1xyXG4gICAgJChpbnB1dF9zZWxlY3RvcikuZWFjaChmdW5jdGlvbihlbGVtZW50LCBpbmRleCkge1xyXG4gICAgICBsZXQgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgZWxlbWVudC52YWx1ZS5sZW5ndGggPiAwIHx8XHJcbiAgICAgICAgJChlbGVtZW50KS5pcygnOmZvY3VzJykgfHxcclxuICAgICAgICBlbGVtZW50LmF1dG9mb2N1cyB8fFxyXG4gICAgICAgICR0aGlzLmF0dHIoJ3BsYWNlaG9sZGVyJykgIT09IG51bGxcclxuICAgICAgKSB7XHJcbiAgICAgICAgJHRoaXMuc2libGluZ3MoJ2xhYmVsJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICB9IGVsc2UgaWYgKGVsZW1lbnQudmFsaWRpdHkpIHtcclxuICAgICAgICAkdGhpcy5zaWJsaW5ncygnbGFiZWwnKS50b2dnbGVDbGFzcygnYWN0aXZlJywgZWxlbWVudC52YWxpZGl0eS5iYWRJbnB1dCA9PT0gdHJ1ZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJHRoaXMuc2libGluZ3MoJ2xhYmVsJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICBNLnZhbGlkYXRlX2ZpZWxkID0gZnVuY3Rpb24ob2JqZWN0KSB7XHJcbiAgICBsZXQgaGFzTGVuZ3RoID0gb2JqZWN0LmF0dHIoJ2RhdGEtbGVuZ3RoJykgIT09IG51bGw7XHJcbiAgICBsZXQgbGVuQXR0ciA9IHBhcnNlSW50KG9iamVjdC5hdHRyKCdkYXRhLWxlbmd0aCcpKTtcclxuICAgIGxldCBsZW4gPSBvYmplY3RbMF0udmFsdWUubGVuZ3RoO1xyXG5cclxuICAgIGlmIChsZW4gPT09IDAgJiYgb2JqZWN0WzBdLnZhbGlkaXR5LmJhZElucHV0ID09PSBmYWxzZSAmJiAhb2JqZWN0LmlzKCc6cmVxdWlyZWQnKSkge1xyXG4gICAgICBpZiAob2JqZWN0Lmhhc0NsYXNzKCd2YWxpZGF0ZScpKSB7XHJcbiAgICAgICAgb2JqZWN0LnJlbW92ZUNsYXNzKCd2YWxpZCcpO1xyXG4gICAgICAgIG9iamVjdC5yZW1vdmVDbGFzcygnaW52YWxpZCcpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAob2JqZWN0Lmhhc0NsYXNzKCd2YWxpZGF0ZScpKSB7XHJcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGNoYXJhY3RlciBjb3VudGVyIGF0dHJpYnV0ZXNcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAob2JqZWN0LmlzKCc6dmFsaWQnKSAmJiBoYXNMZW5ndGggJiYgbGVuIDw9IGxlbkF0dHIpIHx8XHJcbiAgICAgICAgICAob2JqZWN0LmlzKCc6dmFsaWQnKSAmJiAhaGFzTGVuZ3RoKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgb2JqZWN0LnJlbW92ZUNsYXNzKCdpbnZhbGlkJyk7XHJcbiAgICAgICAgICBvYmplY3QuYWRkQ2xhc3MoJ3ZhbGlkJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG9iamVjdC5yZW1vdmVDbGFzcygndmFsaWQnKTtcclxuICAgICAgICAgIG9iamVjdC5hZGRDbGFzcygnaW52YWxpZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIE0udGV4dGFyZWFBdXRvUmVzaXplID0gZnVuY3Rpb24oJHRleHRhcmVhKSB7XHJcbiAgICAvLyBXcmFwIGlmIG5hdGl2ZSBlbGVtZW50XHJcbiAgICBpZiAoJHRleHRhcmVhIGluc3RhbmNlb2YgRWxlbWVudCkge1xyXG4gICAgICAkdGV4dGFyZWEgPSAkKCR0ZXh0YXJlYSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCEkdGV4dGFyZWEubGVuZ3RoKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIHRleHRhcmVhIGVsZW1lbnQgZm91bmQnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRleHRhcmVhIEF1dG8gUmVzaXplXHJcbiAgICBsZXQgaGlkZGVuRGl2ID0gJCgnLmhpZGRlbmRpdicpLmZpcnN0KCk7XHJcbiAgICBpZiAoIWhpZGRlbkRpdi5sZW5ndGgpIHtcclxuICAgICAgaGlkZGVuRGl2ID0gJCgnPGRpdiBjbGFzcz1cImhpZGRlbmRpdiBjb21tb25cIj48L2Rpdj4nKTtcclxuICAgICAgJCgnYm9keScpLmFwcGVuZChoaWRkZW5EaXYpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNldCBmb250IHByb3BlcnRpZXMgb2YgaGlkZGVuRGl2XHJcbiAgICBsZXQgZm9udEZhbWlseSA9ICR0ZXh0YXJlYS5jc3MoJ2ZvbnQtZmFtaWx5Jyk7XHJcbiAgICBsZXQgZm9udFNpemUgPSAkdGV4dGFyZWEuY3NzKCdmb250LXNpemUnKTtcclxuICAgIGxldCBsaW5lSGVpZ2h0ID0gJHRleHRhcmVhLmNzcygnbGluZS1oZWlnaHQnKTtcclxuXHJcbiAgICAvLyBGaXJlZm94IGNhbid0IGhhbmRsZSBwYWRkaW5nIHNob3J0aGFuZC5cclxuICAgIGxldCBwYWRkaW5nVG9wID0gJHRleHRhcmVhLmNzcygncGFkZGluZy10b3AnKTtcclxuICAgIGxldCBwYWRkaW5nUmlnaHQgPSAkdGV4dGFyZWEuY3NzKCdwYWRkaW5nLXJpZ2h0Jyk7XHJcbiAgICBsZXQgcGFkZGluZ0JvdHRvbSA9ICR0ZXh0YXJlYS5jc3MoJ3BhZGRpbmctYm90dG9tJyk7XHJcbiAgICBsZXQgcGFkZGluZ0xlZnQgPSAkdGV4dGFyZWEuY3NzKCdwYWRkaW5nLWxlZnQnKTtcclxuXHJcbiAgICBpZiAoZm9udFNpemUpIHtcclxuICAgICAgaGlkZGVuRGl2LmNzcygnZm9udC1zaXplJywgZm9udFNpemUpO1xyXG4gICAgfVxyXG4gICAgaWYgKGZvbnRGYW1pbHkpIHtcclxuICAgICAgaGlkZGVuRGl2LmNzcygnZm9udC1mYW1pbHknLCBmb250RmFtaWx5KTtcclxuICAgIH1cclxuICAgIGlmIChsaW5lSGVpZ2h0KSB7XHJcbiAgICAgIGhpZGRlbkRpdi5jc3MoJ2xpbmUtaGVpZ2h0JywgbGluZUhlaWdodCk7XHJcbiAgICB9XHJcbiAgICBpZiAocGFkZGluZ1RvcCkge1xyXG4gICAgICBoaWRkZW5EaXYuY3NzKCdwYWRkaW5nLXRvcCcsIHBhZGRpbmdUb3ApO1xyXG4gICAgfVxyXG4gICAgaWYgKHBhZGRpbmdSaWdodCkge1xyXG4gICAgICBoaWRkZW5EaXYuY3NzKCdwYWRkaW5nLXJpZ2h0JywgcGFkZGluZ1JpZ2h0KTtcclxuICAgIH1cclxuICAgIGlmIChwYWRkaW5nQm90dG9tKSB7XHJcbiAgICAgIGhpZGRlbkRpdi5jc3MoJ3BhZGRpbmctYm90dG9tJywgcGFkZGluZ0JvdHRvbSk7XHJcbiAgICB9XHJcbiAgICBpZiAocGFkZGluZ0xlZnQpIHtcclxuICAgICAgaGlkZGVuRGl2LmNzcygncGFkZGluZy1sZWZ0JywgcGFkZGluZ0xlZnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNldCBvcmlnaW5hbC1oZWlnaHQsIGlmIG5vbmVcclxuICAgIGlmICghJHRleHRhcmVhLmRhdGEoJ29yaWdpbmFsLWhlaWdodCcpKSB7XHJcbiAgICAgICR0ZXh0YXJlYS5kYXRhKCdvcmlnaW5hbC1oZWlnaHQnLCAkdGV4dGFyZWEuaGVpZ2h0KCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICgkdGV4dGFyZWEuYXR0cignd3JhcCcpID09PSAnb2ZmJykge1xyXG4gICAgICBoaWRkZW5EaXYuY3NzKCdvdmVyZmxvdy13cmFwJywgJ25vcm1hbCcpLmNzcygnd2hpdGUtc3BhY2UnLCAncHJlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZGVuRGl2LnRleHQoJHRleHRhcmVhWzBdLnZhbHVlICsgJ1xcbicpO1xyXG4gICAgbGV0IGNvbnRlbnQgPSBoaWRkZW5EaXYuaHRtbCgpLnJlcGxhY2UoL1xcbi9nLCAnPGJyPicpO1xyXG4gICAgaGlkZGVuRGl2Lmh0bWwoY29udGVudCk7XHJcblxyXG4gICAgLy8gV2hlbiB0ZXh0YXJlYSBpcyBoaWRkZW4sIHdpZHRoIGdvZXMgY3JhenkuXHJcbiAgICAvLyBBcHByb3hpbWF0ZSB3aXRoIGhhbGYgb2Ygd2luZG93IHNpemVcclxuXHJcbiAgICBpZiAoJHRleHRhcmVhWzBdLm9mZnNldFdpZHRoID4gMCAmJiAkdGV4dGFyZWFbMF0ub2Zmc2V0SGVpZ2h0ID4gMCkge1xyXG4gICAgICBoaWRkZW5EaXYuY3NzKCd3aWR0aCcsICR0ZXh0YXJlYS53aWR0aCgpICsgJ3B4Jyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBoaWRkZW5EaXYuY3NzKCd3aWR0aCcsIHdpbmRvdy5pbm5lcldpZHRoIC8gMiArICdweCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVzaXplIGlmIHRoZSBuZXcgaGVpZ2h0IGlzIGdyZWF0ZXIgdGhhbiB0aGVcclxuICAgICAqIG9yaWdpbmFsIGhlaWdodCBvZiB0aGUgdGV4dGFyZWFcclxuICAgICAqL1xyXG4gICAgaWYgKCR0ZXh0YXJlYS5kYXRhKCdvcmlnaW5hbC1oZWlnaHQnKSA8PSBoaWRkZW5EaXYuaW5uZXJIZWlnaHQoKSkge1xyXG4gICAgICAkdGV4dGFyZWEuY3NzKCdoZWlnaHQnLCBoaWRkZW5EaXYuaW5uZXJIZWlnaHQoKSArICdweCcpO1xyXG4gICAgfSBlbHNlIGlmICgkdGV4dGFyZWFbMF0udmFsdWUubGVuZ3RoIDwgJHRleHRhcmVhLmRhdGEoJ3ByZXZpb3VzLWxlbmd0aCcpKSB7XHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBJbiBjYXNlIHRoZSBuZXcgaGVpZ2h0IGlzIGxlc3MgdGhhbiBvcmlnaW5hbCBoZWlnaHQsIGl0XHJcbiAgICAgICAqIG1lYW5zIHRoZSB0ZXh0YXJlYSBoYXMgbGVzcyB0ZXh0IHRoYW4gYmVmb3JlXHJcbiAgICAgICAqIFNvIHdlIHNldCB0aGUgaGVpZ2h0IHRvIHRoZSBvcmlnaW5hbCBvbmVcclxuICAgICAgICovXHJcbiAgICAgICR0ZXh0YXJlYS5jc3MoJ2hlaWdodCcsICR0ZXh0YXJlYS5kYXRhKCdvcmlnaW5hbC1oZWlnaHQnKSArICdweCcpO1xyXG4gICAgfVxyXG4gICAgJHRleHRhcmVhLmRhdGEoJ3ByZXZpb3VzLWxlbmd0aCcsICR0ZXh0YXJlYVswXS52YWx1ZS5sZW5ndGgpO1xyXG4gIH07XHJcblxyXG4gICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gVGV4dCBiYXNlZCBpbnB1dHNcclxuICAgIGxldCBpbnB1dF9zZWxlY3RvciA9XHJcbiAgICAgICdpbnB1dFt0eXBlPXRleHRdLCBpbnB1dFt0eXBlPXBhc3N3b3JkXSwgaW5wdXRbdHlwZT1lbWFpbF0sIGlucHV0W3R5cGU9dXJsXSwgaW5wdXRbdHlwZT10ZWxdLCBpbnB1dFt0eXBlPW51bWJlcl0sIGlucHV0W3R5cGU9c2VhcmNoXSwgaW5wdXRbdHlwZT1kYXRlXSwgaW5wdXRbdHlwZT10aW1lXSwgdGV4dGFyZWEnO1xyXG5cclxuICAgIC8vIEFkZCBhY3RpdmUgaWYgZm9ybSBhdXRvIGNvbXBsZXRlXHJcbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgaW5wdXRfc2VsZWN0b3IsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAodGhpcy52YWx1ZS5sZW5ndGggIT09IDAgfHwgJCh0aGlzKS5hdHRyKCdwbGFjZWhvbGRlcicpICE9PSBudWxsKSB7XHJcbiAgICAgICAgJCh0aGlzKVxyXG4gICAgICAgICAgLnNpYmxpbmdzKCdsYWJlbCcpXHJcbiAgICAgICAgICAuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICB9XHJcbiAgICAgIE0udmFsaWRhdGVfZmllbGQoJCh0aGlzKSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBZGQgYWN0aXZlIGlmIGlucHV0IGVsZW1lbnQgaGFzIGJlZW4gcHJlLXBvcHVsYXRlZCBvbiBkb2N1bWVudCByZWFkeVxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgIE0udXBkYXRlVGV4dEZpZWxkcygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSFRNTCBET00gRk9STSBSRVNFVCBoYW5kbGluZ1xyXG4gICAgJChkb2N1bWVudCkub24oJ3Jlc2V0JywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBsZXQgZm9ybVJlc2V0ID0gJChlLnRhcmdldCk7XHJcbiAgICAgIGlmIChmb3JtUmVzZXQuaXMoJ2Zvcm0nKSkge1xyXG4gICAgICAgIGZvcm1SZXNldFxyXG4gICAgICAgICAgLmZpbmQoaW5wdXRfc2VsZWN0b3IpXHJcbiAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3ZhbGlkJylcclxuICAgICAgICAgIC5yZW1vdmVDbGFzcygnaW52YWxpZCcpO1xyXG4gICAgICAgIGZvcm1SZXNldC5maW5kKGlucHV0X3NlbGVjdG9yKS5lYWNoKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgIGlmICh0aGlzLnZhbHVlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAkKHRoaXMpXHJcbiAgICAgICAgICAgICAgLnNpYmxpbmdzKCdsYWJlbCcpXHJcbiAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQgc2VsZWN0IChhZnRlciBuYXRpdmUgcmVzZXQpXHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGZvcm1SZXNldC5maW5kKCdzZWxlY3QnKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBjaGVjayBpZiBpbml0aWFsaXplZFxyXG4gICAgICAgICAgICBpZiAodGhpcy5NX0Zvcm1TZWxlY3QpIHtcclxuICAgICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9LCAwKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYWN0aXZlIHdoZW4gZWxlbWVudCBoYXMgZm9jdXNcclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgJ2ZvY3VzJyxcclxuICAgICAgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGlmICgkKGUudGFyZ2V0KS5pcyhpbnB1dF9zZWxlY3RvcikpIHtcclxuICAgICAgICAgICQoZS50YXJnZXQpXHJcbiAgICAgICAgICAgIC5zaWJsaW5ncygnbGFiZWwsIC5wcmVmaXgnKVxyXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgdHJ1ZVxyXG4gICAgKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBhY3RpdmUgd2hlbiBlbGVtZW50IGlzIGJsdXJyZWRcclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcclxuICAgICAqL1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgJ2JsdXInLFxyXG4gICAgICBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgbGV0ICRpbnB1dEVsZW1lbnQgPSAkKGUudGFyZ2V0KTtcclxuICAgICAgICBpZiAoJGlucHV0RWxlbWVudC5pcyhpbnB1dF9zZWxlY3RvcikpIHtcclxuICAgICAgICAgIGxldCBzZWxlY3RvciA9ICcucHJlZml4JztcclxuXHJcbiAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICRpbnB1dEVsZW1lbnRbMF0udmFsdWUubGVuZ3RoID09PSAwICYmXHJcbiAgICAgICAgICAgICRpbnB1dEVsZW1lbnRbMF0udmFsaWRpdHkuYmFkSW5wdXQgIT09IHRydWUgJiZcclxuICAgICAgICAgICAgJGlucHV0RWxlbWVudC5hdHRyKCdwbGFjZWhvbGRlcicpID09PSBudWxsXHJcbiAgICAgICAgICApIHtcclxuICAgICAgICAgICAgc2VsZWN0b3IgKz0gJywgbGFiZWwnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgJGlucHV0RWxlbWVudC5zaWJsaW5ncyhzZWxlY3RvcikucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgTS52YWxpZGF0ZV9maWVsZCgkaW5wdXRFbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHRydWVcclxuICAgICk7XHJcblxyXG4gICAgLy8gUmFkaW8gYW5kIENoZWNrYm94IGZvY3VzIGNsYXNzXHJcbiAgICBsZXQgcmFkaW9fY2hlY2tib3ggPSAnaW5wdXRbdHlwZT1yYWRpb10sIGlucHV0W3R5cGU9Y2hlY2tib3hdJztcclxuICAgICQoZG9jdW1lbnQpLm9uKCdrZXl1cCcsIHJhZGlvX2NoZWNrYm94LCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIC8vIFRBQiwgY2hlY2sgaWYgdGFiYmluZyB0byByYWRpbyBvciBjaGVja2JveC5cclxuICAgICAgaWYgKGUud2hpY2ggPT09IE0ua2V5cy5UQUIpIHtcclxuICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCd0YWJiZWQnKTtcclxuICAgICAgICBsZXQgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICAgICR0aGlzLm9uZSgnYmx1cicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3RhYmJlZCcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgbGV0IHRleHRfYXJlYV9zZWxlY3RvciA9ICcubWF0ZXJpYWxpemUtdGV4dGFyZWEnO1xyXG4gICAgJCh0ZXh0X2FyZWFfc2VsZWN0b3IpLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgIGxldCAkdGV4dGFyZWEgPSAkKHRoaXMpO1xyXG4gICAgICAvKipcclxuICAgICAgICogUmVzaXplIHRleHRhcmVhIG9uIGRvY3VtZW50IGxvYWQgYWZ0ZXIgc3RvcmluZ1xyXG4gICAgICAgKiB0aGUgb3JpZ2luYWwgaGVpZ2h0IGFuZCB0aGUgb3JpZ2luYWwgbGVuZ3RoXHJcbiAgICAgICAqL1xyXG4gICAgICAkdGV4dGFyZWEuZGF0YSgnb3JpZ2luYWwtaGVpZ2h0JywgJHRleHRhcmVhLmhlaWdodCgpKTtcclxuICAgICAgJHRleHRhcmVhLmRhdGEoJ3ByZXZpb3VzLWxlbmd0aCcsIHRoaXMudmFsdWUubGVuZ3RoKTtcclxuICAgICAgTS50ZXh0YXJlYUF1dG9SZXNpemUoJHRleHRhcmVhKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLm9uKCdrZXl1cCcsIHRleHRfYXJlYV9zZWxlY3RvciwgZnVuY3Rpb24oKSB7XHJcbiAgICAgIE0udGV4dGFyZWFBdXRvUmVzaXplKCQodGhpcykpO1xyXG4gICAgfSk7XHJcbiAgICAkKGRvY3VtZW50KS5vbigna2V5ZG93bicsIHRleHRfYXJlYV9zZWxlY3RvciwgZnVuY3Rpb24oKSB7XHJcbiAgICAgIE0udGV4dGFyZWFBdXRvUmVzaXplKCQodGhpcykpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gRmlsZSBJbnB1dCBQYXRoXHJcbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5maWxlLWZpZWxkIGlucHV0W3R5cGU9XCJmaWxlXCJdJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGxldCBmaWxlX2ZpZWxkID0gJCh0aGlzKS5jbG9zZXN0KCcuZmlsZS1maWVsZCcpO1xyXG4gICAgICBsZXQgcGF0aF9pbnB1dCA9IGZpbGVfZmllbGQuZmluZCgnaW5wdXQuZmlsZS1wYXRoJyk7XHJcbiAgICAgIGxldCBmaWxlcyA9ICQodGhpcylbMF0uZmlsZXM7XHJcbiAgICAgIGxldCBmaWxlX25hbWVzID0gW107XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBmaWxlX25hbWVzLnB1c2goZmlsZXNbaV0ubmFtZSk7XHJcbiAgICAgIH1cclxuICAgICAgcGF0aF9pbnB1dFswXS52YWx1ZSA9IGZpbGVfbmFtZXMuam9pbignLCAnKTtcclxuICAgICAgcGF0aF9pbnB1dC50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgIH0pO1xyXG4gIH0pOyAvLyBFbmQgb2YgJChkb2N1bWVudCkucmVhZHlcclxufSkoY2FzaCk7XHJcbiJdLCJmaWxlIjoiZm9ybXMuanMifQ==
