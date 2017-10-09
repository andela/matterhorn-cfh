(function ($) {
  $(function () {

    $('.parallax').parallax();

  }); // end of document ready
})(jQuery); // end of jQuery name space

$(document).ready(function () {
  $('.scrollspy').scrollSpy();
});

var regions = (regionId = '') => {
  var regionObject = {
    0 : 'Please choose your region',
    1 : 'Nigeria',
    2 : 'United States',
    3 : 'Kenya',
    4 : 'Others' 
  }
  if(regionId) return regionObject[regionId];

  return regionObject;
}

$(document).ready(function(){
  $('body').on('click', '.button-collapse', function(event){
    event.preventDefault();
    const $parent = $(this);
    $parent.sideNav({
      closeOnClick: true
    });
  })  
});
