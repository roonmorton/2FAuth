'use-strict';

$(document).ready(function () {
    console.log("click");

    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function () {
        console.log("click");
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");

    });

    $('#cbox-email').change(
        e => {
            var cbox = $(this);
            if(cbox.prop('checked')){
                // Chequeada
            }
            $(this).prop( "checked", false );
            console.log("click check");
            console.log(cbox.prop('checked'));
            //cbox.prop('checked', true);
            /* $('#idCheckbox').prop('checked', true);
            $('#idCheckbox').prop('checked', false); */
        });
});