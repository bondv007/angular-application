(function() {

    /**
     * Created by matan.werbner on 3/30/15.
     */

    var name = 'mmFlash';
    app.directive(name, [function() {
        return {
            link: function($scope, element, attrs) {
                $scope.$watch(function() {
                    return [attrs.width, attrs.height,attrs.src];
                }, function() {
                    var flashHtml = "<OBJECT ID='AssetObj' \
                           CODEBASE='http://active.macromedia.com/flash2/cabs/swflash.cab#version=7,0,0,0' \
                           CLASSID='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' \
                          WIDTH='" + attrs.width + "' \
                          HEIGHT='" + attrs.height + "' VIEWASTEXT> \
                            <PARAM NAME='movie' VALUE='" + attrs.src + "?ebFSCmdHandler=AssetObj_DoFSCommand'> \
                            <PARAM NAME='WMode' VALUE='Transparent'> \
                            <PARAM NAME='Play' VALUE='true'><PARAM NAME='Menu' VALUE='0'> \
                            <PARAM NAME='allowScriptAccess' VALUE='always'> \
                            <EMBED ID='ebEmbededFlash' wmode='transparent' NAME='AssetObj' SRC='" + attrs.src +
                        "?ebFSCmdHandler=AssetObj_DoFSCommand' WIDTH='" + attrs.width + "' HEIGHT='" + attrs.height + "' PLAY='true'" +
                        "QUALITY='high' TYPE='application/x-shockwave-flash' PLUGINSPAGE='http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash' allowScriptAccess='always'></OBJECT >";

                    element.html(flashHtml);

                }, true);
            }
        }
    }]);

})(angular);
