// This function renames the navigation buttons based on screen size
var resize = function() {
    if($('body').width() < 800) {
        $('#home').html('Home');
        $('#del1').html('Del 1<br>WWIS');
        $('#del2').html('Del 2<br>App');
        $('#del2info').html('Del 2<br>Method');
        $('#team').html('Team');
    }
    else {
        $('#home').html('Streamlining GIS Processes<br>for Cambium Inc.');
        $('#del1').html('Deliverable 1<br>Water Well Information System');
        $('#del2').html('Deliverable 2<br>Aerial Image Application');
        $('#del2info').html('Deliverable 2<br>Methodology');
        $('#team').html('Meet the<br>Team');
    }
}
$(document).ready(resize);
$(window).on('resize',resize);

// this set is for the del1 slideshow as per https://www.w3schools.com/w3css/w3css_slideshow.asp
var slideIndex = 1;
showDivs(slideIndex);

function plusDivs(n) {
  showDivs(slideIndex += n);
}

function showDivs(n) {
  var i;
  var x = document.getElementsByClassName("slideshow");
  if (n > x.length) {slideIndex = 1}
  if (n < 1) {slideIndex = x.length} ;
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  x[slideIndex-1].style.display = "block";
}