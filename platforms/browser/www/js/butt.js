// Wait for PhoneGap to load
document.addEventListener("deviceready", init, false);

// PhoneGap is ready
function init()
{
    var myButton = document.getElementById("btn1");
    myButton.addEventListener("click", clicked, false);
}
function clicked()
{
    alert("You clicked a button.");
}