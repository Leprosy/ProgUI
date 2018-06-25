(function($) {
    var alerts = 0;
    var margin = 10;
    var defaults = {
        category: "base",
        onClick: function(ev) {}
    };

    $.fn.alertMsg = function(options) {
        alerts++;
        var opt = {};
        $.extend(opt, defaults, options);

        // Alert body
        var alert = $('<div class="alert"></div>');
        alert.css({display: 'none'});
        alert.append($('<strong>' + opt.title + '</strong><p>' + opt.msg + '</p>'));
        alert.addClass(opt.category);
        alert.on('click', function(ev) {
            console.log("PUIAlert: Alert clicked.", ev);
            opt.onClick(ev, this);
        });

        if (alerts > 1) {
            var height = $('.alert').last().outerHeight() + margin;
            alert.css('bottom', height * (alerts - 1) + margin);
        } else {
            alert.css('bottom', margin);
        }

        // Alert close icon
        var close = $('<span class="alert-close">X</span>');
        close.css({position: 'absolute', top: '10px', right: '10px'});
        close.on("click", function(ev) {
            console.log("PUIAlert: Closing this alert.", ev);
            ev.stopPropagation()
            $(this.parentElement).fadeOut(function() { $(this).remove() });
            alerts--;
        });

        alert.append(close);
        $(this).append(alert);
        alert.fadeIn();
    }

    $.fn.alertMsgCount = function() {
        alert("alerts:" + alerts);
    }
}(jQuery));
