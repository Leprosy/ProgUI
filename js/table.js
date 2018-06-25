/**
 * ProgUI Table component JS
 * 
 */
(function($) {
    /**
     *  Default sorting algorithm, a simple quickSort, User can plug in a custom
     *  sort function if desired. */
    function isNumber(a) {
        return parseFloat(a) == parseFloat(a);
    }

    function partition(array, left, right, key, order) {
        var cmp = array[right - 1],
            minEnd = left,
            maxEnd;
        for (maxEnd = left; maxEnd < right - 1; maxEnd += 1) {
            var a = array[maxEnd][key];
            var b = cmp[key];
            var type = (!isNumber(a) || !isNumber(b)) ? 'string' : 'number';
            var condition = order == "asc" ?
                    (type == "string" ? a.localeCompare(b) <= 0 : parseFloat(a) <= parseFloat(b)) :
                    (type == "string" ? b.localeCompare(a) <= 0 : parseFloat(a) >= parseFloat(b));

            if (condition) {
                swap(array, maxEnd, minEnd);
                minEnd += 1;
            }
        }
        swap(array, minEnd, right - 1);
        return minEnd;
    }

    function swap(array, i, j) {
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
        return array;
    }

    function quickSort(array, left, right, key, order) {
        if (left < right) {
            var p = partition(array, left, right, key, order);
            quickSort(array, left, p, key, order);
            quickSort(array, p + 1, right, key, order);
        }
        return array;
    }

    function _sort(array, key, order) {
        console.log("PUITable: Using default sorting algorithm.");
        return quickSort(array, 0, array.length, key, order);
    }

    /**
     * Sorts the table
     */
    function sort(table) {
        var sortFn = table._PUITable.sort.function || _sort;
        console.log("PUITable: Sorting data.", table, table._PUITable);
        sortFn(table._PUITable.data, table._PUITable.sort.col, table._PUITable.sort.order);
        render(table);
    }

    /**
     * Set the loading status
     */
    function loading(table) {
        $(table).first().next().css('opacity', '0.5');
    }

    /**
     * Renders the HTML of the table
     */
    function render(table) {
        console.log("PUITable: Building table HTML structure", table, table._PUITable);
        // Meta
        var _info = table._PUITable;

        // Base elements for the table
        var container = $('<div class="pui-table"><h2>Table</h2></div>');
        var tools = $('<div class="pui-tools"><input type="text" placeholder="Enter search text..." class="pui-search" /></div>');
        var header = $('<div class="pui-table-header"></div>');
        var headerRow = $('<div class="pui-table-row"></div>');
        var body = $('<div class="pui-table-body"></div>');
        var footer = $('<div class="pui-table-footer"></div>');

        // Setup tools
        // Filter
        tools.find("input").on("change", function(ev) {
            console.log("searching", table, table._PUITable, this.value);
            loading(table);

            _info.search.query = this.value;
            render(table);
        }).val(_info.search.query);

        // Build columns
        for (var i = 0; i < _info.cols.length; ++i) {
            var colName = _info.cols[i];
            var column = $("<span>" + colName + "</span>");

            if (colName == _info.sort.col) { // this preserves sorting state between renders
                column.addClass(_info.sort.order);
            }

            // Sort events
            column.click(function() {
                loading(table);

                var $this = $(this);
                _info.sort.col = this.innerText;

                if (!$this.hasClass("asc") && !$this.hasClass("desc")) {
                    $this.addClass("asc");
                    _info.sort.order = "asc";
                } else if ($this.hasClass("asc")) {
                    $this.removeClass("asc");
                    $this.addClass("desc");
                    _info.sort.order = "desc";
                } else {
                    $this.removeClass("desc");
                    _info.sort.col = "_index";
                    _info.sort.order = "asc";
                }

                sort(table);
            });

            headerRow.append(column);
        }

        header.append(headerRow);

        // Build body
        for (var i = 0; i < table._PUITable.data.length; ++i) {
            var row = $('<div class="pui-table-row"></div>');

            for (var j = 0; j < table._PUITable.cols.length; ++j) {
                var key = table._PUITable.cols[j];
                row.append("<span>" + table._PUITable.data[i][key] + "</span>");
            }

            $(body).append(row);
        }

        container.append(tools);
        container.append(header);
        container.append(body);
        container.append(footer);
        $(table).first().next().remove();
        $(table).hide().after(container);
        console.log("PUITable: Render ready", table, table._PUITable);
    }

    /**
     * Main constructor, builds table data structure.
     */
    $.fn.PUITable = function(options) {
        this.each(function(index, elem) {
            console.log("PUITable: Initializing", this);

            var dict = {};
            dict.cols = [];
            dict.data = [];
            dict.search = { query: "", function: null }
            dict.sort = {col: "_index", order: "asc", function: null};

            $(this).find("th").each(function(){
                dict.cols.push(this.innerText);
            });

            $(this).find("tr").each(function(i) {
                if (i > 0) {
                    var tds = $(this).find('td');
                    var rowData = {_index: i -1};

                    for (var j = 0; j < dict.cols.length; ++j) {
                        var key = dict.cols[j];
                        rowData[key] = tds[j].innerText;
                    }

                    dict.data.push(rowData);
                }
            });

            console.log("PUITable: Created table data structure.", dict);
            this._PUITable = dict;
            render(this);
        });
    };
}(jQuery));
