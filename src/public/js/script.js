'use-strict';

$(document).ready(function () {
    console.log("Ready");

    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function () {
        console.log("click");
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");

    });

    window.submitCheckBox = (obj) => {
        let jObj = $(obj);
        console.log(obj.checked);
        alertify.confirm("Esta seguro de habilitar la seguridad?",
            function () {
                //console.log(jObj.data('type'));
                $.post(
                    '/changeSecurity', {
                    type: jObj.data('type'),
                    value: obj.checked,
                    id: jObj.data('id'),
                    temp: jObj.data('temp')
                },
                    (result, status) => {
                        //console.log(status);
                    }).done((data) => {
                        console.log(data);
                        if (data.status === true) {
                            alertify.success('Se ha realizado el cambio...');
                        } else {
                            alertify.error('A ocurrido un error, intentar mas tarde...');
                        }
                    }).fail((jqxhr, settings, ex) => {
                        alertify.error('A ocurrido un error, intentar mas tarde...');
                    });
                obj.checked = obj.checked;
            },
            function () {
                obj.checked = !obj.checked;

            });
    }


});