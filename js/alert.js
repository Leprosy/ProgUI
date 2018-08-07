/**
 * ProgUI Alert component JS
 * 
 * @TODO:
 * - Common closing method for closeall - closeone - remove button.
 * - Timed alerts
 */
(function($) {
    var alerts = 0;
    var margin = 10;
    var defaults = {
        className: "bg-base",
        title: "Alert message",
        content: "",
        duration: 0,
        onClick: function(ev) {},
        onClose: function(ev) {}
    };

    $.ProgAlert = {};

    $.ProgAlert.show = function(options) {
        alerts++;
        var opt = {};
        $.extend(opt, defaults, options);

        // Alert body
        var alert = $('<div class="prog-alert" id="' + (alerts - 1) + '"></div>');
        alert.css({ display: 'none' });
        alert.append($('<strong>' + opt.title + '</strong><p>' + opt.content + '</p>'));
        alert.addClass(opt.className);
        alert.on('click', function(ev) {
            console.log("ProgAlert: Alert clicked.", ev);
            opt.onClick(ev, this);
        });

        // Position
        var height = $('.prog-alert').last().outerHeight() + margin || 0;
        alert.css("bottom", margin + ((alerts - 1) * height));

        // Alert close icon - attach handlers
        var close = $('<span class="alert-close">x</span>');
        close.css({position: 'absolute', top: '10px', right: '10px'});
        close.on("click", function(ev) { $.ProgAlert.close(alerts - 1); });

            /*$(this.parentElement).fadeOut(function() {
                var height = $(this).outerHeight() + margin;
                $(this).nextAll(".prog-alert").each(function(a,b,c) {
                    $(this).animate({ bottom: "-="  + height });
                })
                $(this).remove();
                console.log("ProgAlert: Alert closed. Running callback.")
                opt.onClose(ev, this);
            });
        });*/

        alert.append(close);
        $("body").append(alert);
        alert.fadeIn();
    };

    $.ProgAlert.close = function(id) {
        console.log("ProgAlert: Closing alert", id);

        $(".prog-alert#" + id).fadeOut(function() {
            var height = $(this).outerHeight() + margin;
            $(this).nextAll(".prog-alert").each(function(a,b,c) {
                $(this).animate({ bottom: "-="  + height });
            });

            this.remove();
            alert--;
        })
    }

    $.ProgAlert.closeAll = function(callback) {
        console.log("ProgAlert: Will close all alerts")
        var collection = $("body .prog-alert");

        if (collection.length == 0) {
            console.log("ProgAlert: Alerts closed. Running callback.")
            callback();
            return;
        }

        collection.fadeOut(function() {
            $(this).remove();
            alerts--;

            if (alerts == 0) {
                console.log("ProgAlert: Alerts closed. Running callback.")
                callback();
            }
        });
    };
}(jQuery));
