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


} )();