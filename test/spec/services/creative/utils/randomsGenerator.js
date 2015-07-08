/**
 * Created by roi.levy on 10/12/14.
 */
'use strict';
function randomGenerator(){
  var randoms = {};

  randoms.randFileSize = function(){
    return 111;
  };

  randoms.randInteger = function(min, range){
    min = min || 1;
    return Math.floor((Math.random() * range) + min);
  }


  return randoms;
}