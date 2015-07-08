/**
 * Created by Asaf David on 3/5/15.
 */

angular.module('mm.common.external', ['pascalprecht.translate']);
angular.module('mm.common.constants', []);
angular.module('mm.common.filters', []);
angular.module('mm.common.directives', ['mm.common.constants', 'mm.common.filters', 'mm.common.external']);
angular.module('mm.common', ['mm.common.directives', 'mm.common.filters']);
