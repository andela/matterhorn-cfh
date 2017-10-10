// window.bootstrap = function() {
//     angular.bootstrap(document, ['mean']);
// };

// window.init = function() {
//     window.bootstrap();
// };
if (window.location.hash == "#_=_") window.location.hash = "#!";
// $(document).ready(function() {
//     //Fixing facebook bug with redirect


//     //Then init the app
//     window.init();
// });
function toggle_visibility(id)
{
    let e = document.getElementById(id);
    if (e.style.display == 'block' || e.style.display=='')
    {
        e.style.display = 'none';
        btn = document.getElementById("minimize-btn");
        btn.innerHTML = 'Î';
    }
    else
    {
        e.style.display = 'block';
        btn = document.getElementById("minimize-btn");
        btn.innerHTML = '-';
    }
}

function hide_chat(id)
{
  let e = document.getElementById(id);
  e.style.display = "none";
}

$(document).ready(function(){
  $('ul.tabs').tabs();
});
