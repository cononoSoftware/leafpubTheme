jQuery(document).ready(function () {
    jQuery.material.init();
});

window.addEventListener("load", function(){
    window.cookieconsent.initialise({
        "position": "top",
        "content": {
            "message": "Diese Webseite verwendet Cookies. Indem Sie diese Webseite nutzen erklären Sie sich mit dieser Verwendung einverstanden.",
            "dismiss": "Hinweis ausblenden!",
            "link": "Datenschutzerklärung",
            "href": "/datenschutz"
        }
    })
});