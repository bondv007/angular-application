/**
 * Created by roi.levy on 10/2/14.
 */
'use strict';
app.service('adValidationFactory', ['adValidator', 'html5RichMediaValidator', 'standardBannerValidator', 'singleExpandableBannerValidator',
  function (adValidator, html5RichMediaValidator, standardBannerValidator, singleExpandableBannerValidator) {

    return {

      getValidator: function (adFormat) {

        var validators = {
          STANDARD_BANNER_AD: standardBannerValidator,
          ENHANCED_STANDARD_BANNER_AD: adValidator,
          RICH_MEDIA_BANNER_AD: adValidator,
          EXPANDABLE_BANNER_AD: adValidator,
          PUSHDOWN_BANNER_AD: adValidator,
          TRACKING_PIXEL_AD: adValidator,
          INSTREAM_AD: adValidator,
          INSTREAM_INTERACTIVE_AD: adValidator,
          HTML5_RICH_MEDIA_BANNER_AD: html5RichMediaValidator,
          SINGLE_EXPANDABLE_BANNER_AD: singleExpandableBannerValidator
        }

        return validators[adFormat];
      }
    }

  }]);