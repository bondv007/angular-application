'use strict';
app.factory('mmUtils', ['$cacheFactory', 'mmSession', 'cacheMap', '$timeout', 'infraEnums',
    function($cacheFactory, mmSession, cacheMap, $timeout, infraEnums) {
        return {
            clientIdGenerator: {
                next: function() {
                    function _p8(s) {
                        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
                        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
                    }
                    return _p8(false) + _p8(true) + _p8(true) + _p8(false);
                },
                populateArray: function(arr) {
                    for (var i = 0; i < arr.length; i++) {
                        if (!arr[i].clientRefId) {
                            arr[i].clientRefId = this.next();
                        }
                    }
                    return arr;
                },
                populateEntity: function(entity) {
                    if (!entity.clientRefId) {
                        entity.clientRefId = this.next();
                    }
                    return entity;
                }
            },
            elementIdGenerator: {
                /*
                 * ctrlType - control type. e.g: dropdown, checkbox, checklist, radiobutton...
                 */
                getId: function(ctrlType, name, mmId) {
                    function _p8(s) {
                        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
                        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
                    }

                    var splittedName = '';

                    if (!name && !mmId) {
                        console.error("Missing id(s) on current page's control(s) - " + ctrlType + " - " + name);
                        //console.error('Current page contain control without required attrs (mmCaption/mmDescription, mmId), fix must be added');
                        return splittedName; //"invalid_Id_" + _p8(false) + _p8(true) + _p8(true) + _p8(false);
                    }
                    if (mmId) {
                        splittedName = mmId.split(' ').join('');
                        return splittedName;
                    } else if (name) {
                        splittedName = name.split(' ');
                    }
                    for (var i = 0; i < splittedName.length; i++) {
                        if (i != 0) {
                            splittedName[i] = splittedName[i][0].toUpperCase() + splittedName[i].slice(1, splittedName[i].length).toLowerCase();
                        } else {
                            splittedName[i] = splittedName[i].toLowerCase();
                        }
                    }

                    var generatedId = '';
                    if (!_.isEmpty(splittedName)) {
                        generatedId = splittedName.join('');
                        if (splittedName.indexOf(infraEnums.controlTypes[ctrlType]) == -1) {
                            generatedId += infraEnums.controlTypes[ctrlType];
                        }
                    } else {
                        generatedId = infraEnums.controlTypes[ctrlType];
                    }
                    return generatedId;
                }
            },
            cacheManager: {
                getCacheObject: function(name) {
                    var cache = $cacheFactory.get(name);
                    if (cache === undefined) {
                        cache = $cacheFactory(name);
                    }
                    return cache;
                },
                clearCache: function() {
                    if ($cacheFactory.get('http')) $cacheFactory.get('http').removeAll();
                },
                clearResourceFromCache: function(url, element, operation) {

                    var initialResource = this.getResource(url, element, operation);

                    var resourcesToClear = cacheMap[initialResource];
                    if (!resourcesToClear) {
                        resourcesToClear = [initialResource];
                    }
                    for (var i = 0; i < resourcesToClear.length; i++) {
                        this.removeResource(resourcesToClear[i]);
                    }
                },
                removeResource: function(resource) {
                    console.log('removeResource: ' + resource);
                    var cacheConfig = mmSession.get('cacheConfig', null);
                    var currentCache = this.getCacheObject('http');
                    if (cacheConfig && cacheConfig[resource]) {
                        if (currentCache) {
                            cacheConfig[resource].forEach(function(url) {
                                currentCache.remove(url);
                            });
                            cacheConfig[resource] = [];
                        }
                    }
                },
                cacheRequest: function(what, url, httpConfig, element, operation) {
                    var resource = this.getResource(url, element, operation);

                    var cacheConfig = mmSession.get('cacheConfig', null);
                    if (cacheConfig === null) {
                        cacheConfig = [];
                    }
                    if (!cacheConfig[resource]) {
                        cacheConfig[resource] = [];
                    }
                    var fullUrl = this.generateUrl(url, httpConfig);
                    if (cacheConfig[resource].indexOf(fullUrl) == -1) {
                        cacheConfig[resource].push(fullUrl);
                    }
                    mmSession.set('cacheConfig', cacheConfig, mmSession.storage.disk);
                },
                getResource: function(url, element, operation) {
                    var resource;
                    var id = null;
                    if (element) {
                        var entity = (Array.isArray(element.entities)) ? element.entities[0] : element;
                        id = entity.id || null;
                    }
                    var urlParts = url.split('/');
                    var urlPartsCounter = urlParts.length;

                    if (operation.toString().toLowerCase() === 'get' || id !== null && urlParts[urlPartsCounter - 1].toString().toLowerCase() === id.toString().toLowerCase()) {
                        resource = (urlParts[urlPartsCounter - 2] === 'global') ? urlParts[urlPartsCounter - 3] : urlParts[urlPartsCounter - 2];
                    } else {
                        resource = (urlParts[urlPartsCounter - 1] === 'global') ? urlParts[urlPartsCounter - 2] : urlParts[urlPartsCounter - 1];
                    }
                    return resource;
                },
                generateUrl: function(url, params) {
                    // * Comment copied from Restangular * //
                    // From here on and until the end of generateUrl,
                    // the code has been kindly borrowed from angular.js
                    // The reason for such code bloating is coherence:
                    //   If the user were to use this for cache management, the
                    //   serialization of parameters would need to be identical
                    //   to the one done by angular for cache keys to match.
                    function sortedKeys(obj) {
                        var keys = [];
                        for (var key in obj) {
                            if (obj.hasOwnProperty(key)) {
                                keys.push(key);
                            }
                        }
                        return keys.sort();
                    }

                    function forEachSorted(obj, iterator, context) {
                        var keys = sortedKeys(obj);
                        for (var i = 0; i < keys.length; i++) {
                            iterator.call(context, obj[keys[i]], keys[i]);
                        }
                        return keys;
                    }

                    function encodeUriQuery(val, pctEncodeSpaces) {
                        return encodeURIComponent(val).
                        replace(/%40/gi, '@').
                        replace(/%3A/gi, ':').
                        replace(/%24/g, '$').
                        replace(/%2C/gi, ',').
                        replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
                    }

                    if (!params) return url;
                    var parts = [];
                    forEachSorted(params, function(value, key) {
                        if (value == null || value == undefined) return;
                        if (!angular.isArray(value)) value = [value];

                        value.forEach(function(v) {
                            if (angular.isObject(v)) {
                                v = angular.toJson(v);
                            }
                            parts.push(encodeUriQuery(key) + '=' +
                                encodeUriQuery(v));
                        });
                    });
                    return (parts.length == 0) ? url : url + ((url.indexOf('?') === -1) ? '?' : '&') + parts.join('&');
                }
            },
            utilities: {
                scheduleFunc: function(fn, interval) {
                    function callFnOnInterval(fn, interval) {
                        var promise = $timeout(fn, 1000 * interval);
                        return promise.then(function() {
                            callFnOnInterval(fn, interval);
                        });
                    };

                    callFnOnInterval(fn, interval);
                },
                replaceParams: function(string, replacements) {
                    return string.replace(/\{(\d+)\}/g, function() {
                        return replacements[arguments[1]];
                    });
                },
                GetElementOffset: function(element) {
                    var boundingClientRect = element[0].getBoundingClientRect();
                    return {
                        width: boundingClientRect.width || element.prop('offsetWidth'),
                        height: boundingClientRect.height || element.prop('offsetHeight'),
                        top: boundingClientRect.top + (window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop),
                        left: boundingClientRect.left + (window.pageXOffset || document.body.scrollLeft || document.documentElement.scrollLeft)
                    };
                },
                IsImageUrl: function(url){
                    if(!url)
                        return false;
                    url = url.toLowerCase();
                    return (endsWith(url,".jpeg") || endsWith(url,".png") ||endsWith(url,".gif") ||endsWith(url,".jpg"));

                     function endsWith(str,suffix) {
                        return str.indexOf(suffix, str.length - suffix.length) !== -1;
                    };
                }
            },
            session: {
                getLoggedInUser: function() {
                    return mmSession.get('user', null);
                },
                getLoggedInUserPermissions: function() {
                    return mmSession.get('permissions', null);
                }
            }
        };
    }
]);
