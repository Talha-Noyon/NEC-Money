(function($, anim) {
  $(document).on('click', '.card', function(e) {
    if ($(this).children('.card-reveal').length) {
      var $card = $(e.target).closest('.card');
      if ($card.data('initialOverflow') === undefined) {
        $card.data(
          'initialOverflow',
          $card.css('overflow') === undefined ? '' : $card.css('overflow')
        );
      }
      let $cardReveal = $(this).find('.card-reveal');
      if (
        $(e.target).is($('.card-reveal .card-title')) ||
        $(e.target).is($('.card-reveal .card-title i'))
      ) {
        // Make Reveal animate down and display none
        anim({
          targets: $cardReveal[0],
          translateY: 0,
          duration: 225,
          easing: 'easeInOutQuad',
          complete: function(anim) {
            let el = anim.animatables[0].target;
            $(el).css({ display: 'none' });
            $card.css('overflow', $card.data('initialOverflow'));
          }
        });
      } else if ($(e.target).is($('.card .activator')) || $(e.target).is($('.card .activator i'))) {
        $card.css('overflow', 'hidden');
        $cardReveal.css({ display: 'block' });
        anim({
          targets: $cardReveal[0],
          translateY: '-100%',
          duration: 300,
          easing: 'easeInOutQuad'
        });
      }
    }
  });
})(cash, M.anime);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjYXJkcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oJCwgYW5pbSkge1xyXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuY2FyZCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgIGlmICgkKHRoaXMpLmNoaWxkcmVuKCcuY2FyZC1yZXZlYWwnKS5sZW5ndGgpIHtcclxuICAgICAgdmFyICRjYXJkID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLmNhcmQnKTtcclxuICAgICAgaWYgKCRjYXJkLmRhdGEoJ2luaXRpYWxPdmVyZmxvdycpID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAkY2FyZC5kYXRhKFxyXG4gICAgICAgICAgJ2luaXRpYWxPdmVyZmxvdycsXHJcbiAgICAgICAgICAkY2FyZC5jc3MoJ292ZXJmbG93JykgPT09IHVuZGVmaW5lZCA/ICcnIDogJGNhcmQuY3NzKCdvdmVyZmxvdycpXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBsZXQgJGNhcmRSZXZlYWwgPSAkKHRoaXMpLmZpbmQoJy5jYXJkLXJldmVhbCcpO1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgJChlLnRhcmdldCkuaXMoJCgnLmNhcmQtcmV2ZWFsIC5jYXJkLXRpdGxlJykpIHx8XHJcbiAgICAgICAgJChlLnRhcmdldCkuaXMoJCgnLmNhcmQtcmV2ZWFsIC5jYXJkLXRpdGxlIGknKSlcclxuICAgICAgKSB7XHJcbiAgICAgICAgLy8gTWFrZSBSZXZlYWwgYW5pbWF0ZSBkb3duIGFuZCBkaXNwbGF5IG5vbmVcclxuICAgICAgICBhbmltKHtcclxuICAgICAgICAgIHRhcmdldHM6ICRjYXJkUmV2ZWFsWzBdLFxyXG4gICAgICAgICAgdHJhbnNsYXRlWTogMCxcclxuICAgICAgICAgIGR1cmF0aW9uOiAyMjUsXHJcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlSW5PdXRRdWFkJyxcclxuICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbihhbmltKSB7XHJcbiAgICAgICAgICAgIGxldCBlbCA9IGFuaW0uYW5pbWF0YWJsZXNbMF0udGFyZ2V0O1xyXG4gICAgICAgICAgICAkKGVsKS5jc3MoeyBkaXNwbGF5OiAnbm9uZScgfSk7XHJcbiAgICAgICAgICAgICRjYXJkLmNzcygnb3ZlcmZsb3cnLCAkY2FyZC5kYXRhKCdpbml0aWFsT3ZlcmZsb3cnKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoJChlLnRhcmdldCkuaXMoJCgnLmNhcmQgLmFjdGl2YXRvcicpKSB8fCAkKGUudGFyZ2V0KS5pcygkKCcuY2FyZCAuYWN0aXZhdG9yIGknKSkpIHtcclxuICAgICAgICAkY2FyZC5jc3MoJ292ZXJmbG93JywgJ2hpZGRlbicpO1xyXG4gICAgICAgICRjYXJkUmV2ZWFsLmNzcyh7IGRpc3BsYXk6ICdibG9jaycgfSk7XHJcbiAgICAgICAgYW5pbSh7XHJcbiAgICAgICAgICB0YXJnZXRzOiAkY2FyZFJldmVhbFswXSxcclxuICAgICAgICAgIHRyYW5zbGF0ZVk6ICctMTAwJScsXHJcbiAgICAgICAgICBkdXJhdGlvbjogMzAwLFxyXG4gICAgICAgICAgZWFzaW5nOiAnZWFzZUluT3V0UXVhZCdcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG59KShjYXNoLCBNLmFuaW1lKTtcclxuIl0sImZpbGUiOiJjYXJkcy5qcyJ9
