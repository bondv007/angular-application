(function () {

  'use strict';
  /**
   * Created by matan.werbner on 3/12/15.
   */

  app.service('mmMediaTypeIconService', [function () {

    this.getIconClassFormMediaType = function(mediaType){

        switch(mediaType.toLowerCase()){
          case 'image' : return 'assets-icon-Image_icon';
          case 'audio' : return 'assets-icon-Sound_icon';
          case 'archive' : return 'assets-icon-Zip_icon';
          case 'video' : return 'assets-icon-Vidao_icon';
          case 'flash' : return 'assets-icon-Flash_icon';
          default:
            return 'assets-icon-Text_icon';
        }
    }

  }]);

})(angular);