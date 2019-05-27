/**
 * ProgUI Tabs component JS
 *
 * @TODO: more than one tab element in the plugin
 */
(function($) {
    /**
     * Main constructor, builds tabs.
     */
    $.fn.ProgTabs = function(options) {
        var defaults = {
            activeTab: 0
        };

        options = $.extend(defaults, options);

        this.each(function(index, elem) {
            $(this).find('div').hide();
            $($(this).find('div')[options.activeTab]).show();
            $(this).find('li').click(function(a,b){
                $(this).parent().find("li").removeClass("active");
                $(this).addClass("active");

                var index = $(this).index();
                var divs = $(this).parents(".tabs").find("div");
                divs.hide();
                $(divs[index]).show();
            });

            $($(this).find('li')[options.activeTab]).addClass("active");
        });
    };
}(jQuery));
