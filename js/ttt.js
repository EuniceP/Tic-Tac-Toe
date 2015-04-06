(function()  {
  angular
    .module('tttApp',[]);

    /**
     * [arrayObjectIndexOf returns index location of value found for the given property
     * @param  {[type]} array      [description]
     * @param  {[type]} property   [description]
     * @param  {[type]} searchTerm [description]
     * @return {[type]} integer    [array index]
     */
    function arrayObjectIndexOf(array, property, searchTerm) {
        for(var i = 0; i < array.length; i++) {
            if (array[i][property] === searchTerm) 
            return i;
        }
        return -1;
    }
console.log(document.documentElement.offsetWidth,document.documentElement.offsetHeight);
console.log(screen.width, screen.height);
    // document.getElementById("playerImg").style.WebkitAnimationName = "rotateImg"; // Code for Chrome, Safari, and Opera
    // document.getElementById("myDIV").style.animationName = "rotateImg";

} )();