// Generated by CoffeeScript 1.7.1
(function() {
  var Main,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.com = window.com || {};

  window.com.sizmek = window.com.sizmek || {};

  window.com.sizmek.controller = window.com.sizmek.controller || {};

  window.com.sizmek.event = window.com.sizmek.event || {};

  window.com.sizmek.model = window.com.sizmek.model || {};

  window.com.sizmek.view = window.com.sizmek.view || {};

  com.sizmek.event.Event = (function() {
    function Event() {}

    Event.MODEL_CHANGED = "modelChanged";

    Event.AD_TAG_CHANGED = "adTagChanged";

    Event.AD_REPORT_CHANGED = "adReportChanged";

    Event.AD_COMPANION_CHANGED = "adCompanionChanged";

    return Event;

  })();

  com.sizmek.controller.PlayerController = (function() {
    var Event;

    Event = com.sizmek.event.Event;

    function PlayerController(models, views) {
      var data;
      this.models = models;
      this.views = views;
      this._getView = __bind(this._getView, this);
      this._onAdCompanionChanged = __bind(this._onAdCompanionChanged, this);
      this._onAdReportChanged = __bind(this._onAdReportChanged, this);
      this._onAdTagChanged = __bind(this._onAdTagChanged, this);
      data = this.models.configModel.getData();
      this.view = this._getView(data["player-type"]);
      this.view.addEventListener(Event.AD_TAG_CHANGED, this._onAdTagChanged);
      this.view.addEventListener(Event.AD_REPORT_CHANGED, this._onAdReportChanged);
      this.view.addEventListener(Event.AD_COMPANION_CHANGED, this._onAdCompanionChanged);
      this.view.render(data);
    }

    PlayerController.prototype._onAdTagChanged = function(event) {
      var tag;
      tag = event.data.tag;
      return this.models.adTagModel.setData(tag);
    };

    PlayerController.prototype._onAdReportChanged = function(event) {
      var count, type;
      type = event.data.type;
      count = this.models.reportingModel.getData(type) + 1;
      return this.models.reportingModel.setData(type, count);
    };

    PlayerController.prototype._onAdCompanionChanged = function(event) {
      var raw;
      raw = event.data.raw;
      return this.models.companionModel.setData(raw);
    };

    PlayerController.prototype._getView = function(type) {
      switch (type) {
        case "html5":
          return this.views.html5PlayerView;
        case "as3":
          return this.views.as3PlayerView;
        default:
          return this.views.html5PlayerView;
      }
    };

    return PlayerController;

  })();

  com.sizmek.event.EventDispatcher = (function() {
    function EventDispatcher(listeners) {
      this.listeners = listeners != null ? listeners : [];
      this.dispatchEvent = __bind(this.dispatchEvent, this);
      this.removeEventListener = __bind(this.removeEventListener, this);
      this.addEventListener = __bind(this.addEventListener, this);
    }

    EventDispatcher.prototype.addEventListener = function(type, callback) {
      var listener;
      listener = {
        type: type,
        callback: callback
      };
      return this.listeners.push(listener);
    };

    EventDispatcher.prototype.removeEventListener = function(type, callback) {
      var i, listener, _i, _ref, _results;
      _results = [];
      for (i = _i = _ref = this.listeners.length - 1; _ref <= 0 ? _i < 0 : _i > 0; i = _ref <= 0 ? ++_i : --_i) {
        listener = this.listeners[i];
        if (listener.type === type && listener.callback === callback) {
          _results.push(this.listeners.splice(i, 1));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    EventDispatcher.prototype.dispatchEvent = function(type, data) {
      if (type != 'adReportChanged' && type != 'adTagChanged') {
          var scope = window.top.scopeToShare;
          var event = [];
          event.number = scope.monitorEvents.length + 1;
          event.action = data.key;
          event.part = '';
          event.command = '';
          event.args = data.value;
          //event.time = timeint;
          scope.$apply(function () {
              scope.monitorEvents.push(event);
          });
      }
      var event, listener, _i, _len, _ref, _results;
      if (data == null) {
        data = null;
      }
      event = {
        target: this,
        type: type,
        data: data
      };
      _ref = this.listeners;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        listener = _ref[_i];
        if (listener.type === type) {
          _results.push(listener.callback(event));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return EventDispatcher;

  })();

  com.sizmek.model.AdTagModel = (function(_super) {
    var Event, EventDispatcher;

    __extends(AdTagModel, _super);

    EventDispatcher = com.sizmek.event.EventDispatcher;

    Event = com.sizmek.event.Event;

    AdTagModel.prototype.data = null;

    function AdTagModel() {
      this.getData = __bind(this.getData, this);
      this.setData = __bind(this.setData, this);
      AdTagModel.__super__.constructor.call(this);
    }

    AdTagModel.prototype.setData = function(tag) {
      this.data = {
        tag: tag
      };
      return this.dispatchEvent(Event.MODEL_CHANGED);
    };

    AdTagModel.prototype.getData = function() {
      return this.data;
    };

    return AdTagModel;

  })(com.sizmek.event.EventDispatcher);

  com.sizmek.model.BaseModel = (function(_super) {
    var Event, EventDispatcher;

    __extends(BaseModel, _super);

    EventDispatcher = com.sizmek.event.EventDispatcher;

    Event = com.sizmek.event.Event;

    BaseModel.prototype.data = {};

    function BaseModel() {
      this._checkCookies = __bind(this._checkCookies, this);
      this._checkQueries = __bind(this._checkQueries, this);
      this.pullData = __bind(this.pullData, this);
      this.getData = __bind(this.getData, this);
      this.setData = __bind(this.setData, this);
      BaseModel.__super__.constructor.call(this);
      this.pullData();
    }

    BaseModel.prototype.setData = function(key, value) {
      this.data[key] = value;
      return this.dispatchEvent(Event.MODEL_CHANGED, {
        key: key,
        value: value
      });
    };

    BaseModel.prototype.getData = function(key) {
      if (key === void 0) {
        return this.data;
      } else {
        return this.data[key];
      }
    };

    BaseModel.prototype.pullData = function() {};

    BaseModel.prototype._checkQueries = function() {
      var key, value, _results;
      _results = [];
      for (key in this.data) {
        value = getQuery(key);
        if (value === "true") {
          value = true;
        }
        if (value === "false") {
          value = false;
        }
        _results.push(this.data[key] = value != null ? value : this.data[key]);
      }
      return _results;
    };

    BaseModel.prototype._checkCookies = function() {
      var key, value, _results;
      _results = [];
      for (key in this.data) {
        value = getCookie(key);
        if (value === "true") {
          value = true;
        }
        if (value === "false") {
          value = false;
        }
        _results.push(this.data[key] = value != null ? value : this.data[key]);
      }
      return _results;
    };

    return BaseModel;

  })(com.sizmek.event.EventDispatcher);

  com.sizmek.model.ConfigModel = (function(_super) {
    var BaseModel;

    __extends(ConfigModel, _super);

    BaseModel = com.sizmek.model.BaseModel;

    ConfigModel.prototype.data = {
      "preroll": "",
      "midroll": "",
      "postroll": "",
      "overlay": "",
      "player-type": "as3",
      "width": 640,
      "height": 360,
      "controls": "below",
      "auto-start": false,
      "script-access": "always",
      "wmode": "opaque",
      "scaling": "enabled"
    };

    function ConfigModel() {
      this.pullData = __bind(this.pullData, this);
      ConfigModel.__super__.constructor.call(this);
    }

    ConfigModel.prototype.pullData = function() {
      return this._checkQueries();
    };

    return ConfigModel;

  })(com.sizmek.model.BaseModel);

  com.sizmek.model.ReportingModel = (function(_super) {
    var BaseModel;

    __extends(ReportingModel, _super);

    BaseModel = com.sizmek.model.BaseModel;

    ReportingModel.prototype.data = {
      "impression": 0,
      "creativeView": 0,
      "start": 0,
      "firstQuartile": 0,
      "midpoint": 0,
      "thirdQuartile": 0,
      "complete": 0,
      "progress": 0,
      "mute": 0,
      "unmute": 0,
      "pause": 0,
      "resume": 0,
      "skip": 0,
      "close": 0,
      "fullscreen": 0,
      "clickTracking": 0,
      "interaction": 0,
      "expand": 0,
      "collapse": 0,
      "acceptInvitation": 0,
      "error": 0,
      "exitFullscreen": 0
    };

    function ReportingModel() {
      ReportingModel.__super__.constructor.call(this);
    }

    return ReportingModel;

  })(com.sizmek.model.BaseModel);

  com.sizmek.view.As3PlayerView = (function(_super) {
    var Event, EventDispatcher, conversions;

    __extends(As3PlayerView, _super);

    EventDispatcher = com.sizmek.event.EventDispatcher;

    Event = com.sizmek.event.Event;

    conversions = {
      "trackImpression": "impression",
      "trackCreativeView": "creativeView",
      "trackStartOfVideo": "start",
      "trackFirstQuartileOfVideo": "firstQuartile",
      "trackMidOfVideo": "midpoint",
      "trackThirdQuartileOfVideo": "thirdQuartile",
      "trackEndOfVideo": "complete",
      "trackError": "error",
      "trackMute": "mute",
      "trackUnMute": "unmute",
      "trackClose": "close",
      "trackSkip": "skip",
      "trackPause": "pause",
      "trackResume": "resume",
      "trackClickthru": "clickTracking",
      "trackExpand": "expand",
      "trackContract": "collapse",
      "trackEnterFullscreen": "fullscreen",
      "trackExitFullscreen": "exitFullscreen",
      "trackInteraction": "interaction",
      "trackAcceptInvitation": "acceptInvitation",
      "trackProgressCalled": "progress"
    };

    function As3PlayerView() {
      this._onCompanion = __bind(this._onCompanion, this);
      this._onTrack = __bind(this._onTrack, this);
      this._onAdData = __bind(this._onAdData, this);
      As3PlayerView.__super__.constructor.call(this);
      window.writeRawAdData = this._onAdData;
    }

    As3PlayerView.prototype.render = function(data) {
      var over, params, rand, start, url, vars;
      this.data = data;
      rand = "rnd=" + (Math.floor(Math.random() * 100000000));
      url = "../lib/eyewonder/player-as3.swf?" + rand;
      over = this.data["controls"] !== "below" ? "enabled" : "disabled";
      start = this.data["auto-start"] ? "enabled" : "disabled";
      vars = {
        "PREROLL_URL": escape(this.data["preroll"]),
        "MIDROLL_URL": escape(this.data["midroll"]),
        "POSTROLL_URL": escape(this.data["postroll"]),
        "OVERLAY_URL": escape(this.data["overlay"]),
        "SCALE": this.data["scaling"],
        "ALLOWSCRIPTACCESS": this.data["script-access"],
        "OVERLAYCB": over,
        "AUTOSTART": start,
        "ADMODE": "progressive",
        "UIF_PLUGIN": "../lib/uif/uif-4.2.5.swf?" + rand,
        "VIDEO_FILE": "../../assets/videos/Bunny.mp4",
        "CONFIG_URL": "../lib/uif/config.xml",
        "LOCALCONNECTIONNAME": ""
      };
      params = {
        "allowScriptAccess": this.data["script-access"],
        "wmode": this.data["wmode"],
        "allowFullscreen": "true",
        "bgcolor": "#000000"
      };
      return swfobject.embedSWF(url, "player-container", "100%", "100%", "9.0.0", "", vars, params);
    };

    As3PlayerView.prototype._onAdData = function(type, tag) {
      return this.dispatchEvent(Event.AD_TAG_CHANGED, {
        tag: tag
      });
    };

    As3PlayerView.prototype._onTrack = function(event) {
      var type;
      type = conversions[event.info.type];
      if (type != null) {
        return this.dispatchEvent(Event.AD_REPORT_CHANGED, {
          type: type
        });
      }
    };

    As3PlayerView.prototype._onCompanion = function(companionString) {
      return this.dispatchEvent(Event.AD_COMPANION_CHANGED, {
        raw: companionString
      });
    };

    return As3PlayerView;

  })(com.sizmek.event.EventDispatcher);

  com.sizmek.view.CompanionAdView = (function() {
    function CompanionAdView(data) {
      this.data = data;
      this._getHTMLResource = __bind(this._getHTMLResource, this);
      this._getIFrameResource = __bind(this._getIFrameResource, this);
      this._getScriptResource = __bind(this._getScriptResource, this);
      this._getImageResource = __bind(this._getImageResource, this);
      this._getFlashResource = __bind(this._getFlashResource, this);
      this._getStaticResource = __bind(this._getStaticResource, this);
      this._getAdResource = __bind(this._getAdResource, this);
      this.id = this.data._id;
      this.width = this.data._width;
      this.height = this.data._height;
      this.resource = this._getAdResource();
    }

    CompanionAdView.prototype._getAdResource = function() {
      if (this.data.StaticResource) {
        return this._getStaticResource();
      }
      if (this.data.ScriptResource) {
        return this._getScriptResource();
      }
      if (this.data.IFrameResource) {
        return this._getIFrameResource();
      }
      if (this.data.HTMLResource) {
        return this._getHTMLResource();
      }
    };

    CompanionAdView.prototype._getStaticResource = function() {
      var flash;
      flash = this.data.StaticResource._creativeType === "application/x-shockwave-flash";
      if (flash) {
        return this._getFlashResource();
      } else {
        return this._getImageResource();
      }
    };

    CompanionAdView.prototype._getFlashResource = function() {
      var key, object, param, params;
      object = document.createElement("object");
      object.id = "companion-" + this.data._id;
      object.type = "application/x-shockwave-flash";
      object.style = "visibility: visible;";
      object.data = this.data.StaticResource.__cdata;
      object.width = this.data._width;
      object.height = this.data._height;
      params = {
        "allowScriptAccess": "always",
        "allowFullscreen": "true",
        "wmode": "opaque",
        "bgcolor": "#000000",
        "flashvars": ""
      };
      for (key in params) {
        param = document.createElement("param");
        param.name = key;
        param.value = params[key];
        object.appendChild(param);
      }
      return object;
    };

    CompanionAdView.prototype._getImageResource = function() {
      var a, img;
      if (this.data.CompanionClickThrough) {
        a = document.createElement("a");
        a.id = "companion-" + this.data._id;
        a.href = this.data.CompanionClickThrough.__cdata;
        a.target = "_blank";
        img = document.createElement("img");
        img.src = this.data.StaticResource.__cdata;
        a.appendChild(img);
        return a;
      }
      img = document.createElement("img");
      img.id = "companion-" + this.data._id;
      img.src = this.data.StaticResource.__cdata;
      return img;
    };

    CompanionAdView.prototype._getScriptResource = function() {};

    CompanionAdView.prototype._getIFrameResource = function() {};

    CompanionAdView.prototype._getHTMLResource = function() {
      var node, noscript, script, source;
      node = document.createElement("span");
      node.innerHTML = this.data.HTMLResource.__cdata;
      node.id = "companion-" + this.data._id;
      script = node.getElementsByTagName("script")[0];
      if (!script) {
        return node;
      }
      source = script.src;
      script = document.createElement("script");
      script.src = source;
      noscript = node.getElementsByTagName("noscript")[0];
      node.appendChild(script);
      if (noscript) {
        node.appendChild(noscript);
      }
      return node;
    };

    return CompanionAdView;

  })();

  com.sizmek.model.CompanionModel = (function(_super) {
    var CompanionAdView, Event, EventDispatcher;

    __extends(CompanionModel, _super);

    EventDispatcher = com.sizmek.event.EventDispatcher;

    Event = com.sizmek.event.Event;

    CompanionAdView = com.sizmek.view.CompanionAdView;

    CompanionModel.prototype.data = null;

    function CompanionModel() {
      this._getCompanionAds = __bind(this._getCompanionAds, this);
      this.getData = __bind(this.getData, this);
      this.setData = __bind(this.setData, this);
      CompanionModel.__super__.constructor.call(this);
      this.xmlParser = new X2JS();
    }

    CompanionModel.prototype.setData = function(raw) {
      this.data = {};
      this.data.xml = {};
      this.data.xml.raw = raw;
      this.data.xml.parsed = this.xmlParser.xml_str2json(raw);
      this.data.ads = this._getCompanionAds(this.data.xml.parsed.CompanionAds.Companion);
      return this.dispatchEvent(Event.MODEL_CHANGED);
    };

    CompanionModel.prototype.getData = function() {
      return this.data;
    };

    CompanionModel.prototype._getCompanionAds = function(list) {
      var ads, item, _i, _len;
      ads = [];
      if (list.length == null) {
        list = [list];
      }
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        item = list[_i];
        ads.push(new CompanionAdView(item));
      }
      return ads;
    };

    return CompanionModel;

  })(com.sizmek.event.EventDispatcher);

  com.sizmek.model.ModelCollection = (function() {
    var AdTagModel, CompanionModel, ConfigModel, ReportingModel;

    ConfigModel = com.sizmek.model.ConfigModel;

    AdTagModel = com.sizmek.model.AdTagModel;

    ReportingModel = com.sizmek.model.ReportingModel;

    CompanionModel = com.sizmek.model.CompanionModel;

    function ModelCollection() {
      this.configModel = new ConfigModel();
      this.adTagModel = new AdTagModel();
      this.reportingModel = new ReportingModel();
      this.companionModel = new CompanionModel();
    }

    return ModelCollection;

  })();

  com.sizmek.view.Html5PlayerView = (function(_super) {
    var Event, EventDispatcher;

    __extends(Html5PlayerView, _super);

    EventDispatcher = com.sizmek.event.EventDispatcher;

    Event = com.sizmek.event.Event;

    Html5PlayerView.prototype.ad = null;

    Html5PlayerView.prototype.sources = ["../assets/videos/Bunny.mp4", "../assets/videos/Bunny.mov", "../assets/videos/Bunny.webm", "../assets/videos/Bunny.3gp", "../assets/videos/Bunny.ogv"];

    function Html5PlayerView() {
      this._onCompanion = __bind(this._onCompanion, this);
      this._onFinish = __bind(this._onFinish, this);
      this._onTrack = __bind(this._onTrack, this);
      this._onAdData = __bind(this._onAdData, this);
      this._parseData = __bind(this._parseData, this);
      this._onScriptLoaded = __bind(this._onScriptLoaded, this);
      this._loadScript = __bind(this._loadScript, this);
      this._createControlsNode = __bind(this._createControlsNode, this);
      this._createSources = __bind(this._createSources, this);
      this._createVideoNode = __bind(this._createVideoNode, this);
      this.render = __bind(this.render, this);
      Html5PlayerView.__super__.constructor.call(this);
    }

    Html5PlayerView.prototype.render = function(data) {
      this.data = data;
      this.config = this._parseData();
      this._createVideoNode();
      this._createSources();
      this._createControlsNode();
      return this._loadScript();
    };

    Html5PlayerView.prototype._createVideoNode = function() {
      this.videoNode = document.createElement("video");
      this.videoNode.id = "player";
      this.videoNode.width = this.config.width;
      this.videoNode.height = this.config.height;
      this.videoNode.setAttribute("controls", "");
      this.videoNode.setAttribute("poster", "../assets/images/video-poster.jpg");
      return document.body.appendChild(this.videoNode);
    };

    Html5PlayerView.prototype._createSources = function() {
      var node, source, _i, _len, _ref, _results;
      _ref = this.sources;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        source = _ref[_i];
        node = document.createElement("source");
        node.src = source;
        _results.push(this.videoNode.appendChild(node));
      }
      return _results;
    };

    Html5PlayerView.prototype._createControlsNode = function() {
      this.controlsNode = document.createElement("div");
      return this.controlsNode.id = "player_control";
    };

    Html5PlayerView.prototype._loadScript = function() {
      var head;
      this.script = document.createElement("script");
      this.script.src = "../lib/maik/instreamapi-2.1.2.min.js";
      this.script.onload = this._onScriptLoaded;
      head = document.getElementsByTagName("head")[0];
      return head.appendChild(this.script);
    };

    Html5PlayerView.prototype._onScriptLoaded = function() {
      this.ad = $ad("player", this.config);
      return this.ad.onAdLoadCompleteCallback(this._onAdData);
    };

    Html5PlayerView.prototype._parseData = function() {
      var obj;
      obj = {
        width: this.data["width"],
        height: this.data["height"],
        preroll: this.data["preroll"],
        midroll: this.data["midroll"],
        postroll: this.data["postroll"],
        overlay: this.data["overlay"],
        overlayDelay: 2,
        overlayDuration: 30,
        minDurationForMidrolls: 20,
        adCountdownText: "Your ad remains [time]",
        adCountdownPosition: "top",
        onCompanion: this._onCompanion,
        onFinish: this._onFinish,
        onTrack: this._onTrack,
        vpaidSingleVideoSlotMode: false
      };
      return obj;
    };

    Html5PlayerView.prototype._onAdData = function(event) {
      var tag;
      tag = event.info.asString;
      return this.dispatchEvent(Event.AD_TAG_CHANGED, {
        tag: tag
      });
    };

    Html5PlayerView.prototype._onTrack = function(adEvent, adType) {
      return this.dispatchEvent(Event.AD_REPORT_CHANGED, {
        type: adEvent
      });
    };

    Html5PlayerView.prototype._onFinish = function() {};

    Html5PlayerView.prototype._onCompanion = function(companionObject, companionString) {
      return this.dispatchEvent(Event.AD_COMPANION_CHANGED, {
        raw: companionString
      });
    };

    return Html5PlayerView;

  })(com.sizmek.event.EventDispatcher);

  com.sizmek.view.ViewCollection = (function() {
    var As3PlayerView, Html5PlayerView;

    Html5PlayerView = com.sizmek.view.Html5PlayerView;

    As3PlayerView = com.sizmek.view.As3PlayerView;

    function ViewCollection() {
      this.html5PlayerView = new Html5PlayerView();
      this.as3PlayerView = new As3PlayerView();
    }

    return ViewCollection;

  })();

  com.sizmek.InstreamPlayer = (function() {
    var ModelCollection, PlayerController, ViewCollection;

    ModelCollection = com.sizmek.model.ModelCollection;

    ViewCollection = com.sizmek.view.ViewCollection;

    PlayerController = com.sizmek.controller.PlayerController;

    function InstreamPlayer() {
      this.models = new ModelCollection();
      this.views = new ViewCollection();
      this.controller = new PlayerController(this.models, this.views);
    }

    return InstreamPlayer;

  })();

  Main = (function() {
    var InstreamPlayer;

    InstreamPlayer = com.sizmek.InstreamPlayer;

    function Main() {
      this._onWindowLoaded = __bind(this._onWindowLoaded, this);
      window.onload = this._onWindowLoaded;
    }

    Main.prototype._onWindowLoaded = function() {
      return window.instreamPlayer = new InstreamPlayer();
    };

    return Main;

  })();

  new Main();

}).call(this);