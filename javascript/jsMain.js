//  Javascript function for navbar and responsive design 

function navFunction() {
    // var x = document.getElementsByTagName("nav");
    var x = document.getElementById("hamburger");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}
function menuClick() {
    document.getElementByClassName("subMenu").style.backgroundColor = "orange";
}
document.getElementById("menuButton").addEventListener("click", menuClick);