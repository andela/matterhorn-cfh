(function($){
  $(function(){
    
    $('.parallax').parallax();
    
  }); // end of document ready
})(jQuery); // end of jQuery name space

$(document).ready(function(){
  $('.scrollspy').scrollSpy();
});

$(document).ready(function(){
  $('body').on('click', '.button-collapse', function(){
    $(this).sideNav({
      closeOnClick: true,
      onOpen: function(el) {
        var navLinks = $('#nav-mobile').children().clone(true);
        $(el).html(navLinks);
      }
    });
  })
  
});    