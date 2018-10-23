(function($){
	$(".form-group-floating .form-control").on('focus',function(){
		$(this).closest("label").addClass("active");
		$(this).siblings( "label" ).addClass( "active");
		console.log($(this));
		console.log($(this).closest('label'));
	});
})(jQuery);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigkKXtcclxuXHQkKFwiLmZvcm0tZ3JvdXAtZmxvYXRpbmcgLmZvcm0tY29udHJvbFwiKS5vbignZm9jdXMnLGZ1bmN0aW9uKCl7XHJcblx0XHQkKHRoaXMpLmNsb3Nlc3QoXCJsYWJlbFwiKS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuXHRcdCQodGhpcykuc2libGluZ3MoIFwibGFiZWxcIiApLmFkZENsYXNzKCBcImFjdGl2ZVwiKTtcclxuXHRcdGNvbnNvbGUubG9nKCQodGhpcykpO1xyXG5cdFx0Y29uc29sZS5sb2coJCh0aGlzKS5jbG9zZXN0KCdsYWJlbCcpKTtcclxuXHR9KTtcclxufSkoalF1ZXJ5KTtcclxuIl0sImZpbGUiOiJtYWluLmpzIn0=
