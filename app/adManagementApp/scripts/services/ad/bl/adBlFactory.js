/**
 * Created by roi.levy on 10/6/14.
 */
'use strict';
app.service('adBlFactory', ['baseAdBl', 'standardBannerBl', 'richMediaBannerBl', 'enhancedStandardBl', 'expandableBannerBl', 'html5RichMediaBannerBl', 'html5ExpandableBannerBl', 'pushDownBannerBl', 'inStreamAdBl', 'singleExpandableBannerBl',
  function (baseAdBl, standardBannerBl, richMediaBannerBl, enhancedStandardBl, expandableBannerBl, html5RichMediaBannerBl, html5ExpandableBannerBl, pushDownBannerBl, inStreamAdBl, singleExpandableBannerBl) {

    return {

      getAdBl: function (adFormat) {

        var adBls = {
          STANDARD_BANNER_AD: standardBannerBl,
          ENHANCED_STANDARD_BANNER_AD: enhancedStandardBl,
          EXPANDABLE_BANNER_AD: expandableBannerBl,
          RICH_MEDIA_BANNER_AD: richMediaBannerBl,
          TRACKING_PIXEL_AD: baseAdBl,
          INSTREAM_AD: inStreamAdBl,
          INSTREAM_INTERACTIVE_AD: inStreamAdBl,
          INSTREAM_ENHANCED_AD: inStreamAdBl,
          PUSHDOWN_BANNER_AD: pushDownBannerBl,
          HTML5_RICH_MEDIA_BANNER_AD: html5RichMediaBannerBl,
          HTML5_EXPANDABLE_BANNER_AD: html5ExpandableBannerBl,
          HTML5_SINGLE_EXPANDABLE_BANNER_AD: html5ExpandableBannerBl,
          SINGLE_EXPANDABLE_BANNER_AD: singleExpandableBannerBl
        }
        return adBls[adFormat];
      }
    }

  }]);