/**
 * Set all the labels to localized strings
 */
 function addLocalizedLabels() {
    document.querySelectorAll("[data-message]")
        .forEach(element => {
            element.textContent = browser.i18n.getMessage(element.dataset.message);
        });
}

addLocalizedLabels();