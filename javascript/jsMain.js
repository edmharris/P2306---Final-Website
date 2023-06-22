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