/*
 /*
 console.log(enums.verticals.getId("Retail")); // 17
 console.log(enums.verticals.getName(20));    // Tech_Internet


 objects must be in the form of:
 {id: , name: }
 */
app.constant('enums',
  {
    priorityPolicy: {
      server: "Server",
      manual: "Manual"
    },
    csbFunnelDecisionIconMap: {
      "GeoTargeting": "geo-targeting",
      "Geo Targeting": "geo-targeting",
      "Retargeting": "retargeting",
      "Static Retargeting": "retargeting",
      "Audience Manager": "audience-manager",
      "3rdPartyTargeting": "audience-manager",
      "ContextualTargeting": "contextual-targeting",
      "Contextual Targeting": "contextual-targeting",
      "Site Keywords": "site-keywords",
      "SiteKeywordTargeting": "site-keywords"
    },
    defaultServeOptions: [
      {name: "Image", id: true},
      {name: "Ad", id: false}
    ],
    mvFlatOrDropDownView: [
      {name: "List View", id: true},
      {name: "Flat View", id: false}
    ],
    frequencyCappingLevelOptions: [
      {name: "Each Placement Separately", id: true},
      {name: "Entire Delivery Group(Across Placements)", id: false}
    ],
    "verticals": [
      {"name": "Apparel", "id": "Apparel"},
      {"name": "Auto", "id": "Auto"},
      {"name": "B2B", "id": "B2B"},
      {"name": "Career", "id": "Career"},
      {"name": "Consumer Packaged Goods", "id": "Consumer_Packaged_Goods"},
      {"name": "Corporate", "id": "Corporate"},
      {"name": "Electronics", "id": "Electronics"},
      {"name": "Entertainment", "id": "Entertainments"},
      {"name": "Financial", "id": "Financial"},
      {"name": "Gaming", "id": "Gaming"},
      {"name": "Government / Utilities", "id": "Government_Utilities"},
      {"name": "Health / Beauty", "id": "Health_Beauty"},
      {"name": "Medical", "id": "Medical"},
      {"name": "News / Media", "id": "News_Media"},
      {"name": "Restaurant", "id": "Restaurant"},
      {"name": "Retail", "id": "Retail"},
      {"name": "Services", "id": "Services"},
      {"name": "Sports", "id": "Sports"},
      {"name": "Tech / Internet", "id": "Tech_Internet"},
      {"name": "Telecom", "id": "Telecom"},
      {"name": "Travel", "id": "Travel"}
    ],
    "accountTypes": [
      {name: "Campaign Manager", id: "campaignManager"},
      {name: "Creative Manager", id: "creativeManager"},
      {name: "Paying Account", id: "payingAccount"}
    ],
    "userType": [
      {name: "Default", id: "Default"},
      {name: "Platform", id: "Platform"},
      {name: "System", id: "System"}
    ],
    "relationType": [
      {name: "Account", id: "Account"},
      {name: "SomethingElse", id: "SomethingElse"}
    ],
    "type": [
      {"name": "account", "id": "Account"},
      {"name": "advertiser", "id": "Advertiser"},
      {"name": "advertiserAccount", "id": "AdvertiserAccount"},
      {"name": "brand", "id": "Brand"},
      {"name": "campaign", "id": "Campaign"},
      {"name": "site", "id": "Site"},
      {"name": "siteRelations", "id": "SiteRelations"},
      {"name": "user", "id": "User"}
    ],
    customInteractionAssetTypes: [
      { "id": "1", "name": "Clickthrough"},
      { "id": "2", "name": "User Action"},
      { "id": "3", "name": "Automatic Event"},
      { "id": "4", "name": "Timer"}
    ],
    "clickthroughURLsTypes": [
      {id: "Clickthrough", name: "Clickthrough"},
      {id: "MainClickthrough", name: "Default Clickthrough"}
    ],
    "rotationSettingType": [
      {id: 'EvenDistribution', type: 'EvenDistribution', name: 'Even Distribution'},
      {id: 'Weighted', type: 'Weighted', name: 'Weighted'},
      {id: 'TimeBased', type: 'TimeBased', name: 'Time Based'}
    ],
    "rotationTypeMapper": {
      "EvenDistribution": "Even Distribution",
      "Weighted": "Weighted",
      "Sequence": "Sequence",
      "StateBased": "State Based",
      "AdvancedSequence": "Advanced Sequence",
      "TimeBased": "Time Based",
      "AutomaticOptimization": "Automatic Optimization"
    },
    assignmentStrategy: [
      {id: "AddToRotation", name: "Add to rotation"},
      {id: "ScheduledSwap", name: "Add as a scheduled swap"}
    ],
    urlTypes: [
      {id: 'ImpressionTracking', name: 'Impression Tracking'},
      {id: 'ClickTracking', name: 'Click Tracking'},
      {id: 'OnAdDownload', name: 'On Ad Download'},
      {id: 'OnAdPlay', name: 'On Ad Play'},
      {id: 'PreLoad', name: 'Pre-load'}
    ],
    urlSourceTypes: [
      {id: 'Campaign', name: 'Campaign'},
      {id: 'Placement', name: 'Placement'},
      {id: 'Ad', name: 'Ad'}
    ],
    packageCostModels: [
      {id: "CPM", name: "CPM" },
      {id: "CPC", name: "CPC" },
      {id: "CPA", name: "CPA" },
      {id: "TIME_BASED_SPONSORSHIP", name: "Time based" },
      {id: "ZERO_COST", name: "Zero Cost"},
      {id: "FLAT_FEE", name: "Flat Fee" },
      {id: "EXTERNAL_MEDIA_BUY", name: "External Media Buy" }
    ],
    hardStop: [
      {id: "KEEP_SERVING_AS_USUAL", name: "Keep serving as usual"},
      {id: "BOTH_IMPRESSIONS_AND_END_DATE", name: "When both impression goal and end date are met" },
      {id: "IMPRESSIONS_OR_END_DATE", name: "When either the impressions goal OR the end date is met" },
      {id: "ON_END_DATE", name: "When end date is met" },
      {id: "ON_VOLUME_GOAL", name: "When impressions goal is met" }
    ],
    packageCostActionTypes: [
      {id: "CLICKS", name: "Clicks"},
      {id: "ALL_USER_INTERACTIONS", name: "All user interactions" },
      {id: "SELECT_CUSTOM_INTERACTION", name: "Custom interactions" },
      {id: "ALL_CONVERSIONS", name: "All conversions" },
      {id: "ALL_POST_CLICK_CONVERSIONS", name: "All post-click conversions" },
      {id: "SELECT_ACTIVITY", name: "Select activity" },
      {id: "VIDEO_START", name: "Video start" },
      {id: "VIDEO_FULLY_PLAYED", name: "Video fully played" },
      {id: "VIDEO_PLAYED_25", name: "Video played 25%" },
      {id: "VIDEO_PLAYED_50", name: "Video played 50%" },
      {id: "VIDEO_PLAYED_75", name: "Video played 75%" },
      {id: "IMPRESSIONS_WITH_INTERACTIONS", name: "Impressions with interactions" },
      {id: "IMPRESSIONS_WITH_DWELL", name: "Impressions with dwell" }
    ],
    placementTypes: [
      {id: 'IN_BANNER', placementType: 'IN_BANNER', name: 'In Banner',serverPlacementType:"InBannerPlacement"},
      {id: 'TRACKING_ONLY', placementType: 'TRACKING_ONLY', name: 'Tracking',serverPlacementType:"TrackingOnlyPlacement"},
      {id: 'OUT_OF_BANNER', placementType: 'OUT_OF_BANNER', name: 'Out of Banner',serverPlacementType:""},
      {id: 'IN_STREAM_VIDEO', placementType: 'IN_STREAM_VIDEO', name: 'In-Stream Video',serverPlacementType:"InStreamVideoPlacement"}//,
//            {placementType: 'IN_STREAM_VIDEO_TRACKING', name: 'In-Stream Video Tracking',serverPlacementType:""}
    ],
    mapOfMM2PlacementTypeToMMNextType: {
      "RICH_BANNER": "IN_BANNER",
      "BANNER": "IN_BANNER",
      "IN_GAME": "IN_BANNER",
      "MOBILE_AD": "IN_BANNER",
      "IN_BANNER": "IN_BANNER",
      "TRACKING_ONLY": "TRACKING_ONLY",
      "OUT_OF_BANNER": "OUT_OF_BANNER",
      "YAHOO_FLOATING": "OUT_OF_BANNER",
      "MSN_FLOATING": "OUT_OF_BANNER",
      "IN_STREAM_VIDEO": "IN_STREAM_VIDEO",
      "INSTREAM_VIDEO": "IN_STREAM_VIDEO",
      "VIDEO_CLIP": "IN_STREAM_VIDEO",
      "IN_STREAM_VIDEO_TRACKING": "IN_STREAM_VIDEO_TRACKING"
    },
    mapOfAdFormatToPlacementType: {
      "Enhanced Standard Banner": "IN_BANNER",
      "Expandable Banner": "IN_BANNER",
      "Expandable Strip": "IN_BANNER",
      "Light Video Banner": "IN_BANNER",
      "Partner 4th Party Ad": "IN_BANNER",
      "Polite Banner": "IN_BANNER",
      "Popup Banner": "IN_BANNER",
      "PushDown Banner": "IN_BANNER",
      "Single Expandable": "IN_BANNER",
      "Standard Expandable": "IN_BANNER",
      "Standard Banner": "IN_BANNER",
      "HTML5 Polite Banner": "IN_BANNER",
      "HTML5 Single Expandable": "IN_BANNER",
      "HTML5 Expandable Banner": "IN_BANNER",
      "HTML5 Standard Banner": "IN_BANNER",
      "HTML5 Rich Media Banner": "IN_BANNER",
      "Single Expandable Banner":"IN_BANNER",
      "Floating Ad": "OUT_OF_BANNER",
      "Floating Ad With Reminder": "OUT_OF_BANNER",
      "Wallpaper Ad": "OUT_OF_BANNER",
      "Standard Floating Ad": "OUT_OF_BANNER",
      "Pushdown Banner":"OUT_OF_BANNER",
      "HTML5 Single Expandable Banner":"OUT_OF_BANNER",
      "Mobile Standard Banner": "MOBILE",
      "Mobile Click-to-Action Banner": "MOBILE",
      "Mobile Expandable Banner": "MOBILE",
      "Mobile Flash Banner": "MOBILE",
      "In-Stream Video": "IN_STREAM_VIDEO",
      "In-Stream Video – Proprietary": "IN_STREAM_VIDEO_PROPRIETARY",
      "In-Stream Video - Enhanced":"IN_STREAM_VIDEO",
      "In-Stream Video - Interactive":"IN_STREAM_VIDEO",
      "Rich Media Banner": "IN_BANNER",
      "Tracking Pixel": "TRACKING_ONLY"
    },
    trackingTabType: [
      {id: "IMG", name: "IMG"},
      {id: "Script", name: "Script"}
    ],
    trackingType: [
      {id: "ImpressionsAndClicks", name: "Impressions & Click"},
      {id: "Clicks", name: "Click"}
    ],
    placementStatuses: [
      {id: 'New', name: 'New'},
      {id: 'ENABLED', name: 'Enabled'},
      {id: 'IN_PLANNING', name: 'In Planning'},
      {id: 'PUBLISHED', name: 'Published'},
      {id: 'LOCKED', name: 'Locked'}
    ],
    placementTagTypes: [
      { id: 'AUTO_DETECT', name: 'Auto Detect'},
      { id: 'CREATE_IFRAME', name: 'Create IFrame'},
      { id: 'SCRIPT', name: 'Script'},
      { id: 'IFRAME', name: 'IFrame'}
    ],
    placementInAppTypes: [
      { id: 'None', name: 'None'},
      { id: 'ORMMA', name: 'ORMMA'},
      { id: 'AdMarvel', name: 'AdMarvel'},
      { id: 'DFP', name: 'DFP'},
      { id: 'MRAID', name: 'MRAID'},
      { id: 'MOCEAN', name: 'MOCEAN'},
      { id: 'Custom', name: 'Custom'}
    ],
    gridControlType: [
      { "id": "TextBox", "name": "TextBox"},
      { "id": "SelectList", "name": "SelectList"},
      { "id": "SearchableList", "name": "SearchableList"},
      { "id": "Label", "name": "Label"},
      { "id": "AssetIcon", "name": "AssetIcon"},
      { "id": "Checkbox", "name": "Checkbox"},
      { "id": "RadioButton", "name": "RadioButton"},
      { "id": "Date", "name": "Date"},
      { "id": "Image", "name": "Image"},
      { "id": "ImageNoHover", "name": "ImageNoHover"},
      { "id": "SingleCheckbox", "name": "SingleCheckbox"},
      { "id": "Action", "name": "Action"},
      { "id": "Tooltip", "name": "Tooltip"},
      { "id": "Imageicon", "name": "Imageicon"},
      { "id": "Required", "name": "Required"},
      { "id": "Link", "name": "Link"}
    ],
    actionFieldType: [
      { "id": "Text", "name": "Text"},
      { "id": "Icon", "name": "Icon"},
      { "id": "Image", "name": "Image"},
      { "id": "Button", "name": "Button"},
      { "id": "BckgrndImage", "name": "BckgrndImage"},
      { "id": "Link", "name": "Link"}
    ],
    defaultPanelFrequencies: [
      { "id": "ONCE_A_DAY", "name": "Day"},
      { "id": "ONCE_IN_CAMPAIGN", "name": "Campaign"},
      { "id": "ONCE_IN_SESSION", "name": "Session"},
      { "id": "ONCE_A_WEEK", "name": "Week"}
    ],
    panelFrequencies: [
      { "id": "UNLIMITED", "name": "Unlimited"},
      { "id": "AUTO_EXPAND", "name": "Auto Expand"}
    ],
    externalIdEntityType: [
      {  "id": "Account", "name": "Account"},
      {  "id": "Advertiser", "name": "Advertiser"},
      {  "id": "Brand", "name": "Brand"}
    ],
    siteContactsRole: [
      {  "id": "Trafficker/Ad Ops", "value": "Trafficker/Ad Ops"},
      {  "id": "Sales", "value": "Sales"},
      {  "id": "Engineering", "value": "Engineering"},
      {  "id": "Other", "value": "Other"}
    ],
    layoutType: [
      { id: "small", name: "small"},
      { id: "medium", name: "medium"},
      { id: "large", name: "large"},
      { id: "custom", name: "custom"}
    ],
    permissionGenres: [
      { id: "Operation", name: "Operation"},
      { id: "EntityView", name: "Entity View"},
      { id: "EntityEdit", name: "Entity Edit"},
      { id: "PageView", name: "Page View"},
      { id: "PageEdit", name: "Page Edit"}
    ],
    roleType: [
      { id: "Admin", name: "Admin"},
      { id: "Advertiser", name: "Advertiser"},
      { id: "Agency", name: "Agency"},
      { id: "Site", name: "Site"},
      { id: "Creative", name: "Creative"},
      { id: "Any", name: "Any"}
    ],
    defaultTagTypes: [
      {"id": "Script", "name": "Script"},
      {"id": "IFrame", "name": "iFrame"},
      {"id": "AutoDetect", "name": "Auto Detect"},
      {"id": "CreateIFrame", "name": "Create iFrame"}
    ],
    adFormats: [
      { id: "ENHANCED_STANDARD_BANNER_AD", "name": "Enhanced Standard Banner", "type": "EnhancedStandardBannerAd"},
      { id: "EXPANDABLE_BANNER_AD", "name": "Expandable Banner", "type": "ExpandableBannerAd"},
      { id: "FLOATING_AD", "name": "Floating Ad"},
      { id: "HTML5_RICH_MEDIA_BANNER_AD", "name": "HTML5 Rich Media Banner", "type": "HTML5RichMediaBannerAd"},
      { id: "HTML5_EXPANDABLE_BANNER_AD", "name": "HTML5 Expandable Banner", "type": "HTML5ExpandableBannerAd"},
      { id: "HTML5_SINGLE_EXPANDABLE_BANNER_AD", "name": "HTML5 Single Expandable Banner", "type": "HTML5SingleExpandableBannerAd"},
      { id: "INSTREAM_AD", "name": "In-Stream Video", "type": "InStreamAd"},
      { id: "INSTREAM_INTERACTIVE_AD", "name": "In-Stream Video - Interactive", "type": "InStreamAd"},
      { id: "INSTREAM_ENHANCED_AD", "name": "In-Stream Video - Enhanced", "type": "InStreamAd"},
      { id: "PUSHDOWN_BANNER_AD", "name": "Pushdown Banner", "type": "PushdownBannerAd"},
      { id: "RICH_MEDIA_BANNER_AD", "name": "Rich Media Banner", "type": "RichMediaBannerAd"},
      { id: "SINGLE_EXPANDABLE_BANNER_AD", "name": "Single Expandable Banner", "type": "singleExpandableBannerAd"},
      { id: "STANDARD_BANNER_AD", "name": "Standard Banner", "type": "StandardBannerAd"},
      { id: "TRACKING_PIXEL_AD", "name": "Tracking Pixel"}
    ],
    traffickingAdFormat: [
      {"id": "Enhanced Standard Banner", "name": "Enhanced Standard Banner"},
      {"id": "Expandable Banner", "name": "Expandable Banner"},
      {"id": "Expandable Strip", "name": "Expandable Strip"},
      {"id": "Light Video Banner", "name": "Light Video Banner"},
      {"id": "Partner 4th Party Ad", "name": "Partner 4th Party Ad"},
      {"id": "Polite Banner", "name": "Polite Banner"},
      {"id": "Popup Banner", "name": "Popup Banner"},
      {"id": "PushDown Banner", "name": "PushDown Banner"},
      {"id": "Single Expandable", "name": "Single Expandable"},
      {"id": "Standard Expandable", "name": "Standard Expandable"},
      {"id": "Standard Banner", "name": "Standard Banner"},
      {"id": "HTML5 Polite Banner", "name": "HTML5 Polite Banner"},
      {"id": "HTML5 Single Expandable", "name": "HTML5 Single Expandable"},
      {"id": "HTML5 Expandable Banner", "name": "HTML5 Expandable Banner"},
      {"id": "HTML5 Standard Banner", "name": "HTML5 Standard Banner"},
      {"id": "HTML5 AdFire Banner", "name": "HTML5 AdFire Banner"},
      {"id": "Floating Ad", "name": "Floating Ad"},
      {"id": "Floating Ad With Reminder", "name": "Floating Ad With Reminder"},
      {"id": "Wallpaper Ad", "name": "Wallpaper Ad"},
      {"id": "Standard Floating Ad", "name": "Standard Floating Ad"},
      {"id": "Mobile Click-to-Action Banner", "name": "Mobile Click-to-Action Banner"},
      {"id": "Mobile Expandable Banner", "name": "Mobile Expandable Banner"},
      {"id": "Mobile Flash Banner", "name": "Mobile Flash Banner"},
      {"id": "In-Stream Video", "name": "In-Stream Video"},
      {"id": "In-Stream Video – Proprietary", "name": "In-Stream Video – Proprietary"},
      {"id": "Window Ad", name: "Window Ad"},
      {"id": "Commercial Break (5.0)", name: "Commercial Break (5.0)"},
      {"id": "Expandable Banner (5.1)", name: "Expandable Banner (5.1)"},
      {"id": "Commercial Break", name: "Commercial Break"},
      {"id": "VideoClip Ad", name: "VideoClip Ad"},
      {"id": "Yahoo floating ad", name: "Yahoo floating ad"},
      {"id": "Tracking Pixel", name: "Tracking Pixel"},
      {"id": "MSN floating ad", name: "MSN floating ad"},
      {"id": "In Game", name: "In Game"},
      {"id": "Floating Expandable", name: "Floating Expandable"},
      {"id": "In-Stream Tracking", name: "In-Stream Tracking"},
      {"id": "Mobile Standard Banner (Image only)", name: "Mobile Standard Banner (Image only)"},
      {"id": "Mobile Standard Banner (Image + Text)", name: "Mobile Standard Banner (Image + Text)"},
      {"id": "Mobile Text Banner", name: "Mobile Text Banner"},
      {"id": "Advanced Tracking Pixel", name: "Advanced Tracking Pixel"},
      {"id": "Mobile Tracking Only", name: "Mobile Tracking Only"},
      {"id": "Mobile Standard Banner", name: "Mobile Standard Banner"},
      { id: "TRACKING_PIXEL_AD", "name": "Tracking Pixel"},
      { id: "ENHANCED_STANDARD_BANNER_AD", "name": "Enhanced Standard Banner"},
      { id: "EXPANDABLE_BANNER_AD", "name": "Expandable Banner"},
      { id: "FLOATING_AD", "name": "Floating Ad"},
      { id: "HTML5_RICH_MEDIA_BANNER_AD", "name": "HTML5 Rich Media Banner"},
      { id: "INSTREAM_AD", "name": "In-Stream Video"},
      { id: "INSTREAM_INTERACTIVE_AD", "name": "In-Stream Video - Interactive"},
      { id: "INSTREAM_ENHANCED_AD", "name": "In-Stream Video - Enhanced"},
      { id: "PUSHDOWN_BANNER_AD", "name": "Pushdown Banner"},
      { id: "RICH_MEDIA_BANNER_AD", "name": "Rich Media Banner"},
      { id: "STANDARD_BANNER_AD", "name": "Standard Banner"}
    ],
    adClientVersions: [
      {"id": "EnableStandardBannerClientV2", "name": "Enable Standard Banner Client V2"},
      {"id": "EnablePoliteBannerClientV2", "name": "Enable Polite Banner Client V2"},
      {"id": "EnableExpandableBannerClientV2", "name": "Enable Expandable Banner Client V2"},
      {"id": "EnableSingleExpandableBannerClientV2", "name": "Enable Single Expandable Banner Client V2"},
      {"id": "EnablePushDownBannerClientV2", "name": "Enable Push Down Banner Client V2"}
    ],
    adStatuses: [
      { id : "NEW", "name": "New"},
      { id : "ASSIGNED", "name": "Assigned"},
      { id : "ATTACHED", "name": "Attached"},
      { id : "PUBLISHED", "name": "Published"},
      { id : "IDLE", "name": "Idle"},
      { id : "LIVE", "name": "Live"}
    ],
    targetWindowTypes: [
      { id: "NEW", value: "New Window", name: "New Window"},
      { id: "TOP", value: "Top", name: "Top"},
      { id: "CURRENT", value: "Current Frame", name: "Current Frame"}
    ],
    targetAudienceTypes: [
      { id: "GEO", name: "GEO"},
      { id: "RETARGETING", name: "Retargeting"},
      { id: "SITE_KEYWORDS", name: "Site Keywords"},
      { id: "CONTEXTUAL_TARGETING", name: "Contextual targeting"}
    ],
    videoStartMethods: [
      {id: 'USER_START', "name": "User Start"},
      {id: 'AUTO_START', "name": "Auto Start"}
    ],
    hides: [
      { id: 'IFRAMES', name: "Iframes"},
      { id: 'DROPDOWN_LISTS', name: "Dropdown lists"},
      { id: 'JAVA_APPLETS', name: "Java Applets"},
      { id: 'FLASH_ELEMENTS', name: "Flash Elements"}
    ],
    downloadModes: [
      { "id": 'POLITE', "name": "Polite"},
      { "id": 'INSTANT', "name": "Instant"}//,
      //{ "id" : 'INSTANT_WITHOUT_PRELOAD', "name": "Preload Image"} only for preload defined
    ],
    retractions: [
      { "id": "NEVER", "value": "Never", "name": "Never"},
      { "id": "MOUSE_OFF_AD", "value": "Mouse off Ad", "name": "Mouse off Ad"},
      { "id": "MOUSE_OFF_PANEL", "value": "Mouse off Panel", "name": "Mouse off Panel"}
    ],
    positionTypes: [
      { "id": "BANNER_RELATIVE", value: "Banner Relative(px)", name: "Banner Relative(px)"},
      { "id": "PAGE_RELATIVE_PERCENTAGE", value: "Page Relative(%)", name: "Page Relative(%)"},
      { "id": "PAGE_RELATIVE_PIXELS", value: "Page Relative(px)", name: "Page Relative(px)"}
    ],
    adURLSourceTypes: [
      {id: 'CAMPAIGN', name: 'Campaign'},
      {id: 'PLACEMENT', name: 'Placement'},
      {id: 'AD', name: 'Ad'}
    ],
    trueFalseListdataArray: [
      {Id: 0, text: ""}//,
      //{ Id: false, text: "False"}
    ],
    scripts: [],
    thirdpartyURLsTypes: [
      {id: 'IMPRESSION_TRACKING', value: 'Tracking', name: 'Tracking'},
      {id: 'CLICK_TRACKING', value: 'Click Tracking', name: 'Click Tracking'},
      {id: 'ON_AD_DOWNLOAD', value: 'On ad Download', name: 'On ad Download'},
      {id: 'ON_AD_PLAY', value: 'On ad Play', name: 'On ad Play'},
      {id: 'PRELOAD', value: 'Preload', name: 'Preload'},
      {id: 'DEFAULT_IMAGE_IMPRESSION_TRACKING', value: 'Default Image  Impression Tracking', name: 'Default Image  Impression Tracking'},
      {id: 'DEFAULT_IMAGE_CLICK_TRACKING', value: 'Default Image Click Tracking', name: 'Default Image Click Tracking'}
    ],
    inStreamThirdPartyURLTypes: [
      {id: 'IMPRESSION_TRACKING', value: 'Tracking', name: 'Tracking'},
      {id: 'CLICK_TRACKING', value: 'Click Tracking', name: 'Click Tracking'},
      {id: 'AD_VIDEO_START', value: 'Ad Video Start', name: 'Ad Video Start'},
      {id: 'AD_VIDEO_FIRST_QUARTILE', value: 'Ad Video First Quartile', name: 'Ad Video First Quartile'},
      {id: 'AD_VIDEO_MIDPOINT', value: 'Ad Video Midpoint', name: 'Ad Video Midpoint'},
      {id: 'AD_VIDEO_THIRD_QUARTILE', value: 'Ad Video Third Quartile', name: 'Ad Video Third Quartile'},
      {id: 'AD_VIDEO_COMPLETE', value: 'Ad Video Complete', name: 'Ad Video Complete'},
      {id: 'IN_STREAM_SURVEY', value: 'In-Stream Survey', name: 'In-Stream Survey'},
      {id: 'SURVEY_URL', value: 'Survey URL', name: 'Survey URL'},
      {id: 'IN_STREAM_EXECUTE_JAVA_SCRIPT' , value: 'In-Stream Execute JavaScript', name: 'In-Stream Execute JavaScript'}
    ],
    adChoicesLocations: [
      { id: "TOP_RIGHT", "name": "Top Right"},
      { id: "TOP_LEFT", "name": "Top Left"},
      { id: "BOTTOM_RIGHT", "name": "Bottom Right"},
      { id: "BOTTOM_LEFT", "name": "Bottom Left"}
    ],
    inStreamDeliveryTypes: [
      { id: "PROGRESSIVE", "name": "Progressive"},
      { id: "STREAMING", "name": "Streaming"}
    ],
    assetTypes: [
      { id: "defaultImage", name: "Default Image" },
      { id: "banner", name: "Banner" },
      { id: "preloadBanner", name: "Preload Banner" },
      { id: "html5", name: "Workspace Folder" },
      { id: "additionalAsset", name: "Additional Asset" }
    ],
    customInteractionTypes: [
      { id: "AdUserActionInteraction", name: "UserAction Interaction" },
      { id: "AdTimerInteraction", name: "Timer Interaction" },
      { id: "AdAutomaticEventInteraction", name: "Automatic Events" },
      { id: "AdClickthroughInteraction", name: "Clickthrough Interaction" }
    ],
    fflagsTeams: [
      {id: "1", name: "Platform"},
      {id: "2", name: "Serving"},
      {id: "3", name: "Analytics"},
      {id: "4", name: "Tag-Management"}
    ],
    fflagsDefaultRuleOptions: [
      {id: true, name: "enabled"},
      {id: false, name: "disabled"}
    ],
    fflagsContextOptions: [
      {id: "RequestContext", name: "RequestContext"}
    ],
    fflagsStatusOptions: [
      {id: true, name: "Enabled for (=)"},
      {id: false, name: "Disabled for (≠)"}
    ],
    fflagsRequestContextKeyOptions: [
      {id: "user_id", name: "user_id"},
      {id: "account_id", name: "account_id"}
    ],
    permissionTypes: [
      {id: "PlatformPermission", name: "Platform Permission"},
      {id: "PermissionToGrantPermission", name: "Permission To Grant Permission"}
    ],
    adminZones: [
      { id: "SystemAdministrator", name: "System Administrators" },
      { id: "RND", name: "R&D" },
      { id: "ClientServices", name: "Client Services" },
      { id: "AccountAdministrator", name: "Account Administrator" },
      { id: "Billing", name: "Billing" }
    ],
    roleTypes: [
      { id: "Any", name: "Any" },
      { id: "MasterAdvertiser", name: "Master Advertiser"},
      { id: "AdministratorOrOwn", name: "Administrator Or Own" },
      { id: "MediaAgency", name: "Media Agency" },
      { id: "CreativeAgency", name: "Creative Agency" },
      { id: "SiteOrPublisher", name: "Site Or Publisher" },
      { id: "PrimaryCreativeAgency", name: "Primary Creative Agency"}
    ],
    permissionCategories: [
      { id: "administration", name: "Administration" },
      { id: "campaign_management", name: "Campaign Management" },
      { id: "creative_management", name: "Creative Management" }
    ],
    //Developers using (lower case & no spaces)
    defaultContactsTypes: [
      {id: "SIZMEK", name: "sizmekContacts"},
      {id: "MEDIA", name: "campaignManagerContacts"},
      {id: "CREATIVE", name: "creativeManagerContacts"},
      {id: "SITE", name: "siteContacts"}
    ],
    //UI using
    contactsTypes: [
      {id: "SIZMEK", name: "Sizmek"},
      {id: "MEDIA", name: "Media Agency"},
      {id: "CREATIVE", name: "Creative Agency"},
      {id: "SITE", name: "Site"}
    ],
    mediaAgencyCampaignRoles: [
      {id: "MediaPlanner", name: "Media Planner"},
      {id: "Trafficker", name: "Trafficker"},
      {id: "BillingContact", name: "Billing Contact"},
      {id: "SearchContact", name: "Search Contact"}
    ],
    sizmekCampaignRoles: [
      {id: "ClientServicesManager", name: "Client Services Manager"},
      {id: "CreativeServicesSpecialist", name: "Creative Services Specialist"},
      {id: "SalesManager", name: "Sales Manager"}
    ],
    creativeAgencyCampaignRoles: [
      {id: "Producer", name: "Producer"},
      {id: "Designer", name: "Designer"},
      {id: "Trafficker", name: "Trafficker"}
    ],
    timeBasedDateSetting: [
      {id: "inheritDatesFromPlacement", name: "According to each placement start and end dates"},
      {id: "custom", name: ''}
    ],
    timeBaseTimeZoneOptions: [
      {id: "fromUser", name: "Serve according to end user's time zone"},
      {id: "custom", name: "Specific time zone"}
    ],
    mobileDevices: [
      {id: "NOT_REQUIRED", name: "Not Required"},
      {id: "TABLET", name: "Tablet"},
      {id: "PHONE", name: "Phone"},
      {id: "TABLET_AND_PHONE", name: "Tablet & Phone"}
    ],
    dateFormats: [
      {id: "DD_MM_YYYY", name: "DD/MM/YYYY"},
      {id: "MM_DD_YYYY", name: "MM/DD/YYYY"}
    ],
    thirdPartyAdTags: [
      {id: "impressionTracking", name: "Impression Tracking"},
      {id: "clickTracking", name: "Click Tracking"},
      {id: "onAdPlay(js)", name: "On Ad Play (JS)"},
      {id: "onAdPlay(html)", name: "On Ad Play (HTML)"},
      {id: "onAdDownload(js)", name: "On Ad Download (JS)"},
      {id: "onAdDownload(html)", name: "On Ad Download (HTML)"}
    ],
    regulationProgram: [
      {id: "IAB_EU", name: "IAB - YourOnlineChoices.com"},
      {id: "NAI_DAA_US", name: "NAI/DAA US - AboutAds.info"}
    ],
    GMTOffset: [
      {id: "GMT_Minus_12", name: "[GMT -12] Eniwetok, Kwajalein"},
      {id: "GMT_Minus_11", name: "[GMT -11] Midway Island, Samoa"},
      {id: "GMT_Minus_10", name: "[GMT -10] Hawaii Standard Time"},
      {id: "GMT_Minus_09", name: "[GMT -9] Alaska Standard Time"},
      {id: "GMT_Minus_08", name: "[GMT -8] Pacific Standard Time"},
      {id: "GMT_Minus_07", name: "[GMT -7] Mountain Standard Time"},
      {id: "GMT_Minus_06", name: "[GMT -6] Central Standard Time"},
      {id: "GMT_Minus_05", name: "[GMT -5] Eastern Standard Time"},
      {id: "GMT_Minus_04", name: "[GMT -4] Atlantic Standard Time (Canada)"},
      {id: "GMT_Minus_03", name: "[GMT -3] Brasilia, Buenos Aires, Georgetown"},
      {id: "GMT_Minus_02", name: "[GMT -2] Mid Atlantic"},
      {id: "GMT_Minus_01", name: "[GMT -1] Azores, Cape Verde Island"},
      {id: "GMT", name: "[GMT] Greenwich Mean Time"},
      {id: "GMT_Plus_01", name: "[GMT +1] Amsterdam, Berlin, Madrid, Paris"},
      {id: "GMT_Plus_02", name: "[GMT +2] Athens, Cairo, Jerusalem"},
      {id: "GMT_Plus_03", name: "[UTC +3] Moscow, Nairobi"},
      {id: "GMT_Plus_04", name: "[UTC +4] Abu Dhabi, Muscat"},
      {id: "GMT_Plus_05", name: "[UTC +5] Islamabad, Karachi"},
      {id: "GMT_Plus_06", name: "[UTC +6] Almaty, Dhaka"},
      {id: "GMT_Plus_07", name: "[UTC +7] Bangkok, Hanoi, Jakarta"},
      {id: "GMT_Plus_08", name: "[UTC +8] Beijing, Hong Kong, Perth"},
      {id: "GMT_Plus_09", name: "[UTC +9] Osaka, Sapporo, Tokyo"},
      {id: "GMT_Plus_10", name: "[UTC +10] Brisbane, Guam, Sydney, Vladivostok"},
      {id: "GMT_Plus_11", name: "[UTC +11] Magadan, Solomon Island"},
      {id: "GMT_Plus_12", name: "[UTC +12] Auckland, Fiji, Marshall Island"}
    ],
    fileSource: [
      {"name": "Auto", "id": "Auto"},
      {"name": "Manual", "id": "Manual"},
      {"name": "Source", "id": "Source"}
    ],
    ioSites: [
      {id: "payingAccount", name: "IoPayingAccount"},
      {id: "site", name: "Site"},
      {id: "siteOnlyPaysForRichMedia", name: "SiteForRich"}
  ],
    markets: [
      {id: "ZIK0ZJ", name: "Europe"},
      {id: "ZIK0ZI", name: "Africa"},
      {id: "ZIK0ZH", name: "Pacific"},
      {id: "ZIK0ZG", name: "Asia"},
      {id: "ZIK0ZF", name: "Middle East"},
      {id: "ZIK0ZE", name: "Other"},
      {id: "ZIK0ZD", name: "Latin America"},
      {id: "ZIK0ZC", name: "Canada"},
      {id: "ZIK0ZB", name: "US Central"},
      {id: "ZIK0ZA", name: "US East"},
      {id: "ZIK0YZ", name: "US Southwest"},
      {id: "ZIK0YX", name: "US Southcentral"}
    ],
    offices: [
      {id: "SouthAfrica", name: "South Africa"},
      {id: "Austria", name: "Austria"},
      {id: "Belgium", name: "Belgium"},
      {id: "Denmark", name: "Denmark"},
      {id: "France", name: "France"},
      {id: "Germany", name: "Germany"},
      {id: "Ireland", name: "Ireland"},
      {id: "Italy", name: "Italy"},
      {id: "Netherlands", name: "Netherlands"},
      {id: "Portugal", name: "Portugal"},
      {id: "Spain", name: "Spain"},
      {id: "Sweden", name: "Sweden"},
      {id: "Switzerland", name: "Switzerland"},
      {id: "UK", name: "UK"},
      {id: "Dubai", name: "Dubai"},
      {id: "Israel", name: "Israel"},
      {id: "HongKong", name: "Hong Kong"},
      {id: "NewZealand", name: "New Zealand"},
      {id: "Taiwan", name: "Taiwan"},
      {id: "Japan", name: "Japan"},
      {id: "Brazil", name: "Brazil"},
      {id: "Illinois", name: "Illinois"},
      {id: "Michigan", name: "Michigan"},
      {id: "Minnesota", name: "Minnesota"},
      {id: "Ohio", name: "Ohio"},
      {id: "GeorgiaUS", name: "Georgia US"},
      {id: "Massachusetts", name: "Massachusetts"},
      {id: "WashingtonDC", name: "Washington DC"},
      {id: "NewYork", name: "NewYork"},
      {id: "SouthCalifornia", name: "South California"},
      {id: "Washington", name: "Washington"},
      {id: "Other", name: "Other"},
      {id: "Singapore", name: "Singapore"},
      {id: "Philippines", name: "Philippines"},
      {id: "Texas", name: "Texas"},
      {id: "Malaysia", name: "Malaysia"},
      {id: "Thailand", name: "Thailand"},
      {id: "Vietnam", name: "Vietnam"},
      {id: "Australia", name: "Australia"},
      {id: "China", name: "China"},
      {id: "Indonesia", name: "Indonesia"},
      {id: "Korea", name: "Korea"},
      {id: "India", name: "India"},
      {id: "Poland", name: "Poland"},
      {id: "Ontario", name: "Ontario"},
      {id: "BritishColumbia", name: "British Columbia"},
      {id: "Greece", name: "Greece"},
      {id: "Romania", name: "Romania"},
      {id: "Pakistan", name: "Pakistan"},
      {id: "Turkey", name: "Turkey"},
      {id: "Argentina", name: "Argentina"},
      {id: "Mexico", name: "Mexico"},
      {id: "Luxemburg", name: "Luxemburg"},
      {id: "Finland", name: "Finland"},
      {id: "Norway", name: "Norway"},
      {id: "Russia", name: "Russia"},
      {id: "Hungary", name: "Hungary"},
      {id: "Bulgaria", name: "Bulgaria"},
      {id: "Cyprus", name: "Cyprus"},
      {id: "Moldavia", name: "Moldavia"},
      {id: "Egypt", name: "Egypt"},
      {id: "Quebec", name: "Quebec"},
      {id: "Arkansas", name: "Arkansas"},
      {id: "Indiana", name: "Indiana"},
      {id: "Iowa", name: "Iowa"},
      {id: "Kansas", name: "Kansas"},
      {id: "Kentucky", name: "Kentucky"},
      {id: "Louisiana", name: "Louisiana"},
      {id: "Mississippi", name: "Mississippi"},
      {id: "Missouri", name: "Missouri"},
      {id: "Nebraska", name: "Nebraska"},
      {id: "NorthDakota", name: "North Dakota"},
      {id: "Oklahoma", name: "Oklahoma"},
      {id: "SouthDakota", name: "South Dakota"},
      {id: "Tennessee", name: "Tennessee"},
      {id: "Wisconsin", name: "Wisconsin"},
      {id: "Alabama", name: "Alabama"},
      {id: "Connecticut", name: "Connecticut"},
      {id: "Delaware", name: "Delaware"},
      {id: "FloridaLATAM", name: "Florida LATAM"},
      {id: "Maine", name: "Maine"},
      {id: "Maryland", name: "Maryland"},
      {id: "NewHampshire", name: "New Hampshire"},
      {id: "NewJersey", name: "New Jersey"},
      {id: "NorthCarolina", name: "North Carolina"},
      {id: "Pennsylvania", name: "Pennsylvania"},
      {id: "RhodeIsland", name: "Rhode Island"},
      {id: "SouthCarolina", name: "South Carolina"},
      {id: "Vermont", name: "Vermont"},
      {id: "Virginia", name: "Virginia"},
      {id: "WestVirginia", name: "West Virginia"},
      {id: "Alaska", name: "Alaska"},
      {id: "Idaho", name: "Idaho"},
      {id: "Montana", name: "Montana"},
      {id: "Oregon", name: "Oregon"},
      {id: "Wyoming", name: "Wyoming"},
      {id: "Arizona", name: "Arizona"},
      {id: "Colorado", name: "Colorado"},
      {id: "Hawaii", name: "Hawaii"},
      {id: "Nevada", name: "Nevada"},
      {id: "NewMexico", name: "New Mexico"},
      {id: "Utah", name: "Utah"},
      {id: "Colombia", name: "Colombia"},
      {id: "NorthCalifornia", name: "North California"},
      {id: "PuertoRico", name: "Puerto Rico"},
      {id: "Peru", name: "Peru"},
      {id: "Ecuador", name: "Venezuela"},
      {id: "Guatemala", name: "Guatemala"},
      {id: "Honduras", name: "Honduras"},
      {id: "Nicaragua", name: "Nicaragua"},
      {id: "CostaRica", name: "CostaRica"},
      {id: "Panama", name: "Panama"},
      {id: "Chile", name: "Chile"},
      {id: "Bolivia", name: "Bolivia"},
      {id: "Paraguay", name: "Paraguay"},
      {id: "Uruguay", name: "Uruguay"},
      {id: "DominicanRepublic", name: "Dominican Republic"},
      {id: "Nigeria", name: "Nigeria"},
      {id: "ElSalvador", name: "El Salvador"},
      {id: "Estonia", name: "Estonia"},
      {id: "Alberta", name: "Alberta"},
      {id: "NovaScotia", name: "Nova Scotia"},
      {id: "Saskatchewan", name: "Saskatchewan"},
      {id: "Belarus", name: "Belarus"},
      {id: "Ukraine", name: "Ukraine"},
      {id: "Georgia", name: "Georgia"},
      {id: "Armenia", name: "Armenia"},
      {id: "Azerbaijan", name: "Azerbaijan"},
      {id: "Kazakhstan", name: "Kazakhstan"},
      {id: "Uzbekistan", name: "Uzbekistan"},
      {id: "Turkmenistan", name: "Turkmenistan"},
      {id: "Kyrgyzstan", name: "Kyrgyzstan"},
      {id: "Tajikistan", name: "Tajikistan"},
      {id: "Latvia", name: "Latvia"},
      {id: "Lithuania", name: "Lithuania"},
      {id: "Croatia", name: "Croatia"},
      {id: "Slovakia", name: "Slovakia"},
      {id: "Serbia", name: "Serbia"},
      {id: "BosniaHerzegovina", name: "Bosnia Herzegovina"},
      {id: "Macedonia", name: "Macedonia"},
      {id: "Montenegro", name: "Montenegro"},
      {id: "Slovenia", name: "Slovenia"},
      {id: "CzechRepublic", name: "Czech Republic"},
      {id: "Gibraltar", name: "Gibraltar"},
      {id: "Haiti", name: "Haiti"},
      {id: "FloridaNAM", name: "Florida NAM"},
      {id: "Malta", name: "Malta"},
      {id: "Belize", name: "Belize"},
      {id: "StKittsAndNevis", name: "St Kitts And Nevis"}
    ],
    countries: [
      {id: "AU", name: "Australia"},
      {id: "US", name: "USA"},
      {id: "IL", name: "Israel"},
      {id: "JP", name: "Japan"},
      {id: "HK", name: "Hong Kong"}
    ],
    currencies: [
      {id: "USD", name: "US Dollar($)"},
      {id: "AUD", name: "Australian Dollar(A$)"},
      {id: "GBP", name: "GBP(£)"},
      {id: "EUR", name: "Euro(€)"},
      {id: "ILS", name: "New Israeli Shekel(ILS)"},
      {id: "JPY", name: "Yen(¥)"},
      {id: "DKK", name: "Danish Korona(kr)"},
      {id: "BRL", name: "Brazilian Real(R$)"},
      {id: "NZD", name: "New Zealand Dollars($)"},
      {id: "CAD", name: "Canadian Dollar(C$)"},
      {id: "SGD", name: "Singapore Dollars(S$)"},
      {id: "INR", name: "Indian Rupee(Rs)"},
      {id: "PKR", name: "Pakistani Rupee(PKR)"},
      {id: "PLN", name: "Polish Zloty(zl)"},
      {id: "CHF", name: "Swiss Franc(CHF)"},
      {id: "SEK", name: "Swedish Krona(kr)"},
      {id: "NOK", name: "Norwegian Krone(kr)"},
      {id: "ZAR", name: "South African Rand(R)"},
      {id: "THB", name: "Baht(THB)"},
      {id: "KRW", name: "South Korean Won(KRW)"},
      {id: "TWD", name: "New Taiwan Dollar(NT$)"},
      {id: "TRY", name: "Turkish Lira(TL)"},
      {id: "CLP", name: "Chilean Peso(CLP$)"},
      {id: "VND", name: "Vietnamese Dong(VND)"},
      {id: "RUB", name: "Ruble(RUB)"},
      {id: "IDR", name: "Indonesian Rupiah(IDR)"},
      {id: "RSD", name: "Serbian Dinar(RSD)"}
    ],
    traffickingMode: [
      {id: "AdvancedMode", name: "Advanced Mode"},
      {id: "SimpleMode", name: "Simple Mode"}
    ],
    viewabilityMode: [
      {id: "NO_COLLECTION", name: "No Collection"},
      {id: "COLLECT_BASIC_VIEWABILITY_DATA", name: "Basic"},
      {id: "COLLECT_ENHANCED_VIEWABILITY_DATA", name: "Enhanced"}
    ],
    httpTypes: [
      {id: "HTTPS", name: "HTTPS"},
      {id: "HTTP", name: "HTTP"}
    ],
    cacheBustingTokenTypes: [
			{id: "RandomNumber", name: "Random Number"},
			{id: "Accipiter", name: "Accipiter"},
			{id: "AdTech", name: "AdTech"},
			{id: "Awarez", name: "Awarez"},
			{id: "CustomToken", name: "Custom Token"},
			{id: "Dart", name: "Dart"},
			{id: "FALK", name: "FALK"},
      {id: "OASRealMedia", name: "OAS Real Media"},
      {id: "Proprietary", name: "Proprietary"},
      {id: "VCMedia", name: "VCMedia"}
    ],
    inAppSDKs: [
      {id: "None", name: "None"},
      {id: "ORMMA", name: "ORMMA"},
      {id: "AdMarvel", name: "AdMarvel"},
      {id: "DFP", name: "DFP"},
      {id: "MRAID", name: "MRAID"},
      {id: "MOCEAN", name: "MOCEAN"},
      {id: "Custom", name: "Custom"}
    ],
    alertMessagesType: [
      {id: "success", name: "Success"},
      {id: "error", name: "Error"},
      {id: "info", name: "Info"},
      {id: "warning", name: "Warning"}
    ]
  }).run(['enums', function (enums) {
    _.each(_.keys(enums), function (e) {
      for (var i = 0; i < enums[e].length; i++) {
        if (enums[e].id === undefined) {
          enums[e].id = {};
          enums[e].name = {};
        }
        enums[e].name[enums[e][i].name] = i;
        enums[e].id[enums[e][i].id] = i;
      }
      var _id = enums[e].id;
      var _name = enums[e].name;
      var _that = enums[e];
      enums[e].getId = function (name) {
        var obj = _that[_name[name]];
        if (obj === undefined || obj.id == null) {

          return name;
        }
        return obj.id
      };
      enums[e].getName = function (id) {
        var obj = _that[_id[id]];
        if (obj === undefined || obj.name == null) {

          return id;
        }
        return obj.name;
      };
      enums[e].getObject = function (id) {
        var obj = _that[_id[id]];
        if (obj === undefined || obj.name == null) {

          return id;
        }
        return obj;
      };
    });
  }]);
