jQuery(document).ready(($) => {
  const checkGdpr = $(".rform-checkbox-gdpr .checkbox-gdpr");

  disabledBtn();

  checkGdpr.on("change", (e) => {
    // e.preventDefault();
    disabledBtn();
  });

  function disabledBtn() {
    const btn = checkGdpr.closest("form").find(".rform-button-submit");

    if (checkGdpr.is(":checked")) {
      btn.prop("disabled", false);
    } else {
      btn.prop("disabled", true);
    }
  }
});
