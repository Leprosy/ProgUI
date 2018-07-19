/**
 * ProgUI Table component JS
 * 
 * @TODO:
 *  - Remove col_id from cols data structure.
 *  - Update only the table body on the render method.
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
    function sort(tableID) {
        var table = $("#" + tableID);
        var sortFn = table[0]._PUITable.sort.function || _sort;
        console.log("PUITable: Sorting data.", table);
        sortFn(table[0]._PUITable.data, table[0]._PUITable.sort.col, table[0]._PUITable.sort.order);
        render(tableID);
    }

    /**
     * Set the loading status
     */
    function loading(tableID) {
        var table = $("#" + tableID + " div.pui-table-body");
        table.css("opacity", "0.5");
        console.log("Loading")
    }

    /**
     * Renders the HTML of the table
     */
    function render(tableID) {
        var table = $("#" + tableID);
        console.log("PUITable: Building table HTML structure", table);

        // Meta
        var _info = table[0]._PUITable;

        // Base elements for the table
        var tools = $('<div class="pui-tools"><input type="text" placeholder="Enter search text..." class="pui-search" /></div>');
        var header = $('<div class="pui-table-header"></div>');
        var headerRow = $('<div class="pui-table-row"></div>');
        var body = $('<div class="pui-table-body"></div>');
        var footer = $('<div class="pui-table-footer"></div>');

        // Setup tools
        // Search
        tools.find("input").on("change", function(ev) {
            console.log("PUITable: Searching data.", this.value, table);
            loading(tableID);
            _info.search.query = this.value;

            setTimeout(function() {
                render(tableID);
                console.log("PUITable: Search callback.", this.value, table);
                _info.onSearch(this.value, _info);
            }, 1)
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
                loading(tableID);

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

                setTimeout(function() {
                    sort(tableID);
                    console.log("PUITable: Sort callback.", _info.sort.col, _info.sort.order, _info);
                    _info.onSort(_info.sort.col, _info.sort.order, _info);
                }, 1)
            });

            headerRow.append(column);
        }

        header.append(headerRow);

        // Build body - apply search filters
        for (var i = 0; i < _info.data.length; ++i) {
            var included = false;
            var row = $('<div class="pui-table-row"></div>');

            for (var j = 0; j < _info.cols.length; ++j) {
                var key = _info.cols[j];
                var cellData = _info.data[i][key];
                var search = _info.search.query;

                // Global search filter
                if (search.length < 1) {
                    included = true;
                } else if (cellData.indexOf(search) >= 0) {
                    included = true;
                    cellData = cellData.replace(_info.search.query, '<span class="highlight">' + _info.search.query + "</span>");
                }

                row.append("<span>" + cellData + "</span>");
            }

            if (included) $(body).append(row);
        }

        table.html("");
        table.append(tools);
        table.append(header);
        table.append(body);
        table.append(footer);
        console.log("PUITable: Render ready", table);
    }


    /**
     * Main constructor, builds table data structure.
     */
    $.fn.PUITable = function(options) {
        this.each(function(index, elem) {
            console.log("PUITable: Initializing", this);

            // Default options for the table
            var id = this.id;
            var dict = {};
            dict.cols = [];
            dict.data = [];
            dict.search = { query: "", function: null }
            dict.sort = { col: "_index", order: "asc", function: null };
            dict.onSearch = function(query, table) {}
            dict.onSort = function(col, order, table) {}
            $.extend(dict, options);

            // Build columns & data structures
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
            var container = $('<div class="pui-table" id="' + id + '"></div>');
            container[0]._PUITable = dict;
            $(this).replaceWith(container);

            render(id);
        });
    };
}(jQuery));
