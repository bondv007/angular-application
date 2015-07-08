/**
 * Created by eran.nachum on 3/16/14.
 */
app.service('mmMessages', ['toaster', function (toaster) {
  return {
    addError: function(title, body, isHtml) {
      toaster.pop("error", title, body, 3000, isHtml ? "trustedHtml" : "text");
    },
    addSuccess: function(title, body, isHtml) {
      toaster.pop("success", title, body, 3000, isHtml ? "trustedHtml" : "text");
    },
    addWarning: function(title, body, isHtml) {
      toaster.pop("warning", title, body, 3000, isHtml ? "trustedHtml" : "text");
    }
  }
}]);