(function($){
  $(function(){
    
    $('.parallax').parallax();
    
  }); // end of document ready
})(jQuery); // end of jQuery name space

$(document).ready(function(){
  $('.scrollspy').scrollSpy();
});

$(document).ready(function(){
  $('body').on('click', '.button-collapse', function(event){
    event.preventDefault();
    const $parent = $(this);
    $parent.sideNav({
      closeOnClick: true
    });
  })
  
});    