app.constant('mdx2Api', {
  "env5": "https://int.eyeblaster.com/MediaMind.InternalAPI.Web/CSBService.svc/",
  "env8": "https://platform.mediamind.com/MediaMind.InternalAPI.Web/CSBService.svc/",
  "env9": "https://dev4.eyeblaster.com/MediaMind.InternalAPI.Web/CSBService.svc/",
  "env10": "https://dev.eyeblaster.com/MediaMind.InternalAPI.Web/CSBService.svc/"
});

app.constant('previewApi', {
  "env5": "https://csbuat.dev.sizmdx.com/#/preview",
  "env8": "https://csbprod.dev.sizmdx.com/#/preview",
  "env9": "https://dev2.dev.sizmdx.com/#/preview",
  "env10": "https://csbpatch.dev.sizmdx.com/#/preview"
});

app.constant('serverErrorMapper', {
  "UpdateDeliveryGroupV2 - Request failed because of a failure in [DeliveryGroupOrch.Instance.UpdateAndSaveDeliveryGroup()] method. Exception data:You cannot remove this target audience; the resulting placement will have more than one non-targeted delivery group. , DeliveryGroupID:": "error_MM2_0",
  "UpdateDeliveryGroupV2 - Request failed because of a failure in [DeliveryGroupOrch.Instance.UpdateAndSaveDeliveryGroup()] method. Exception data:You cannot add a target audience to a non-targeted delivery group in a published placement. , DeliveryGroupID:": "error_MM2_1",
  "UpdateDeliveryGroupV2 - Request failed because of a failure in [DeliveryGroupOrch.Instance.UpdateAndSaveDeliveryGroup()] method. Exception data:The retargeting advertiser not match the campaign's advertiser. , DeliveryGroupID:": "error_MM2_2"
});

app.constant('traffickingConst', {
  strDefaultAudience: "Default Audience",
  strStrategy: "Strategy",
  strAssign: "Assign",
  strReplaceAd: "Replace Ad",
  strTrafficking: "trafficking",
  traffickingBroadcastAction: {
    onSelectedTargetAudience: "funnel.onSelectedTargetAudience"
  }
});

app.constant('restPaths', {
  mdx2: {
    advertisers: 'advertisers/',
    campaigns: 'campaigns/',
    campaign: 'campaigns/info/',
    strategies: 'strategies/',
    deliveryGroups: 'deliveryGroups/',
    preview: 'preview',
    admin: 'admin',
    pdfFile: 'pdfFile'
  },
  mdx3: {
    advertisers: 'csb/advertisers',
    campaigns: 'csb/campaigns',
    campaign: 'csb/campaigns',
    unAssignedCampaigns: 'csb/campaigns/unassign',
    strategies: 'csb/strategies',
    deliveryGroups: 'csb/deliveryGroups',
    preview: 'csb/preview',
    admin: 'csb/admin',
    pdfFile: 'csb/pdfFile'
  },

  targetAudiences: 'targetAudiences/',
  account: 'account',
  exportPdf: 'exportPdf/',
  targetAudiencePriorities: 'targetAudiencePriorities/',
  decisionDiagram: 'decisionDiagram',
  targetingData: 'targetingData',
  contextual: 'contextual',
  categories: 'categories',
  subCategories: 'subCategories',
  campaign: 'campaign',
  tags: 'tags'
});


app.constant('geoTypes', {
  country: { ruleEntityType: "countries", ruleEntityLabel: 'Country', dataEntityType: 'selectedCountries' },
  region: { ruleEntityType: "regions", ruleEntityLabel: 'State/Region', dataEntityType: 'selectedStates' },
  city: { ruleEntityType: "cities", ruleEntityLabel: 'City', dataEntityType: 'selectedCities' },
  isp: { ruleEntityType: "isps", ruleEntityLabel: 'ISP', dataEntityType: 'selectedISPs' },
  nielsen: { ruleEntityType: "nielsenDMAs", ruleEntityLabel: 'Nielsen', dataEntityType: 'selectedNielsen', geoType: 'NielsenDMA' },
  areaCode: { ruleEntityType: "areaCodes", ruleEntityLabel: 'Area Code', dataEntityType: 'selectedAreaCodes', geoType: 'AreaCode' },
  postalCode: { ruleEntityType: "zipCodes", ruleEntityLabel: 'Postal Code', dataEntityType: 'selectedPostalCodes', geoType: 'ZipCode' }
});


app.constant('geoTypeMap', {
  country: { ruleEntityType: "countries", ruleEntityLabel: ' (Country)', dataEntityType: 'selectedCountries' },
  region: { ruleEntityType: "regions", ruleEntityLabel: ' (State/Region)', dataEntityType: 'selectedStates' },
  city: { ruleEntityType: "cities", ruleEntityLabel: ' (City)', dataEntityType: 'selectedCities' },
  isp: { ruleEntityType: "isps", ruleEntityLabel: ' (ISP)', dataEntityType: 'selectedISPs' }
});

app.constant('mm2PreviewServers',{
  "env5": "http://10.24.4.152/Serving/?cn=ServerAdmin",
  "env8": "http://10.24.4.152/Serving/?cn=ServerAdmin",
  "env8-second": "http://10.24.4.152/Serving/?cn=ServerAdmin",
  "env9": "http://192.168.4.35/Serving/?cn=ServerAdmin",
  "env10": "http://192.168.5.18/Serving/?cn=ServerAdmin"
});
