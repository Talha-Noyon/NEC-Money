/*(function($){
	$(".form-group-floating .form-control").on('focus',function(){
		$(this).siblings( "label" ).addClass( "active");
		
	});
	$(".form-group-floating .form-control").on('blur',function(){
		$(this).siblings( "label" ).removeClass( "active");
		
	});
})(jQuery);*/
(function($){
	$(".custom-form-stacked .form-group #user").on('focus',function(){
		$(this).siblings( "label" ).addClass( "animation");
		$(".custom-form-stacked #form-group-user").addClass("is-focused-rose");
		
	});
	$(".custom-form-stacked .form-group #pass").on('focus',function(){
		$(this).siblings( "label" ).addClass( "animation");
		$(".custom-form-stacked #form-group-pass").addClass("is-focused-rose");
		
	});
	$(".custom-form-stacked .form-group #user").on('blur',function(){
		if ($(this).val().length == 0 ) {
    		$(this).siblings( "label" ).removeClass( "animation");
		}
		setTimeout(function(){
			$(".custom-form-stacked #form-group-user").removeClass("is-focused-rose");
		},1000);
		
		
	});

	$(".custom-form-stacked .form-group #danger").on('focus',function(){
		$(this).siblings( "label" ).addClass( "animation");
		$(".custom-form-stacked #form-group-danger").addClass("is-focused-danger");
		
	});
	$(".custom-form-stacked .form-group #danger").on('blur',function(){
		if ($(this).val().length == 0 ) {
    		$(this).siblings( "label" ).removeClass( "animation");
		}
		setTimeout(function(){
			$(".custom-form-stacked #form-group-danger").removeClass("is-focused-danger");
		},1000);
		
		
	});
	$(".custom-form-stacked .form-group #success").on('focus',function(){
		$(this).siblings( "label" ).addClass( "animation");
		$(".custom-form-stacked #form-group-success").addClass("is-focused-success");
		
	});
	$(".custom-form-stacked .form-group #success").on('blur',function(){
		if ($(this).val().length == 0 ) {
    		$(this).siblings( "label" ).removeClass( "animation");
		}
		setTimeout(function(){
			$(".custom-form-stacked #form-group-success").removeClass("is-focused-success");
		},1000);
		
		
	});
	$(".custom-form-stacked .form-group #pass").on('blur',function(){
		if ($(this).val().length == 0 ) {
			$(this).siblings( "label" ).removeClass( "animation");
		}
		setTimeout(function(){
			$(".custom-form-stacked #form-group-pass").removeClass("is-focused-rose");
		},1000);
		
		
	});


	$(".custom-form-horizon #help").on('focus',function(){
		setTimeout(function(){
			$(".custom-form-horizon .bmd-help").css({"visibility":"visible" });
		},600);
	});
	$(".custom-form-horizon #help").on('blur',function(){
		$(".custom-form-horizon .bmd-help").removeAttr('style');
			
	});

// Checkbox Styling
	var setupCheckboxes = function() {
    $('input[type=checkbox]').each(function() {
        var $this = $(this);
        $this.addClass('checkbox');
        $('<span class="checkbox"></span>').insertAfter($this);
        if ($this.is(':checked')) {
            $this.next('span.checkbox').addClass('on');
        };
        $this.fadeTo(0,0);
        $this.change(function(){
            $this.next('span.checkbox').toggleClass('on');
		        });
		    });
		};
		setupCheckboxes();

// Radio Buttons Styling
	var setupRadiobuttons = function() {
    $('input[type=radio]').each(function() {
        var $this = $(this);
        $this.addClass('circle');
        $('<span class="circle"></span>').insertAfter($this);
        if ($this.is(':checked')) {
            $this.next('span.circle').addClass('on');
        };
        $this.fadeTo(0,0);
        $this.change(function(){
            $this.next('span.circle').toggleClass('on');
		        });
		    });
		};
		setupRadiobuttons();

//Bootstrap Notifyfunction showNotification(from, align){
		showNotification = function (from, align){

			$.notify({
		      title: '<strong>Notification</strong>',
		      icon: 'add_alert',
		      message: "Welcome to <b>Material Dashboard</b> - a beautiful freebie for every web developer."
		    },{
		      type: 'danger',
		      animate: {
				enter: 'fadeInUp animated',
		        exit: 'fadeOutRight animated'
		      },
		      placement: {
		        from: from,
		        align: align
		      },
		      offset: 20,
		      spacing: 10,
		      z_index: 1031,
		    });
		}
		
//Tooltip

 $('[data-toggle="tooltip"]').tooltip();
    rotateCard = function(btn){
        var $card = $(btn).closest('.card-flip');
        console.log($card);
        if($card.hasClass('hover')){
            $card.removeClass('hover');
        } else {
            $card.addClass('hover');
        }
    }

    $(".card-flip").on('click',function(){

        if($(this).hasClass('hover')){
            $(this).removeClass('hover');
        } else {
            $(this).addClass('hover');
        }
    });

    $("#owl-demo").owlCarousel({

        navigation : true, // Show next and prev buttons
        slideSpeed : 300,
        paginationSpeed : 400,
        singleItem:true

        // "singleItem:true" is a shortcut for:
        // items : 1,
        // itemsDesktop : false,
        // itemsDesktopSmall : false,
        // itemsTablet: false,
        // itemsMobile : false

    });
})(jQuery);
