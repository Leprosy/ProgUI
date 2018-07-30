/**
 * ProgUI Alert component JS
 * 
 * @TODO:
 *
 */
(function($) {
    var alerts = 0;
    var margin = 10;
    var defaults = {
        className: "bg-base",
        title: "Alert message",
        content: "",
        onClick: function(ev) {},
        onClose: function(ev) {}
    };

    $.fn.ProgAlert = function(options) {
        alerts++;
        var opt = {};
        $.extend(opt, defaults, options);

        // Alert body
        var alert = $('<div class="prog-alert"></div>');
        alert.css({ display: 'none' });
        alert.append($('<strong>' + opt.title + '</strong><p>' + opt.content + '</p>'));
        alert.addClass(opt.className);
        alert.on('click', function(ev) {
            console.log("ProgAlert: Alert clicked.", ev);
            opt.onClick(ev, this);
        });

        // Position
        if (alerts > 1) {
            var height = $('.prog-alert').last().outerHeight() + margin;
            alert.css('bottom', height * (alerts - 1) + margin);
        } else {
            alert.css('bottom', margin);
        }

        // Alert close icon - attach handlers
        var close = $('<span class="alert-close">x</span>');
        close.css({position: 'absolute', top: '10px', right: '10px'});
        close.on("click", function(ev) {
            console.log("ProgAlert: Closing this alert.", ev);
            ev.stopPropagation()
            alerts--;

            $(this.parentElement).fadeOut(function() {
                var height = $(this).outerHeight() + margin;
                $(this).nextAll(".prog-alert").each(function(a,b,c) {
                    $(this).animate({ bottom: "-="  + height });
                })
                $(this).remove();
                opt.onClose(ev, this);
            });
        });

        alert.append(close);
        $(this).append(alert);
        alert.fadeIn();
    }

    $.fn.ProgAlertClose = function() {
        $(this).find(".prog-alert").fadeOut(function() {
            $(this).remove();
        });
    }

    $.fn.alertMsgCount = function() {
        alert("alerts:" + alerts);
    }
}(jQuery));
