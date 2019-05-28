/**
 * ProgUI Table component JS
 *
 * @TODO:
 *  - Remove col_id from cols data structure.
 *  - Update only the table body on the render method.
 *  - Pagination: total calculation at creation?
 */
(function($) {
    /**
     *  Default sorting algorithm, a simple quickSort, User can plug in a custom
     *  sort function if desired.
     */
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
        console.log("ProgTable: Using default sorting algorithm.");
        return quickSort(array, 0, array.length, key, order);
    }


    /**
     * Sorts the table
     */
    function sort(tableID) {
        var table = $("#" + tableID);
        var sortFn = table[0]._ProgTable.sort.function || _sort;
        console.log("ProgTable: Sorting data.", table);
        sortFn(table[0]._ProgTable.data, table[0]._ProgTable.sort.col, table[0]._ProgTable.sort.order);
        render(tableID);
    }

    /**
     * Set the loading status
     */
    function loading(tableID) {
        var table = $("#" + tableID + " div.body");
        table.css("opacity", "0.5");
        console.log("Loading");
    }

    /**
     * Renders the HTML of the table
     */
    function render(tableID) {
        var table = $("#" + tableID);
        console.log("ProgTable: Building table HTML structure", table);

        // Meta
        var _info = table[0]._ProgTable;

        // Base elements for the table
        var toolHtml = '<div class="tools"><input type="text" placeholder="Enter search text..." class="search" />';
        if (_info.pagination.size > 0) {
            toolHtml += '<a class="prev">&lt;-Prev</a> | Page ' + (_info.pagination.page + 1) +
                        ' of ' + _info.pagination.totalPages + ' | <a class="next">Next-></a>';
        }
        toolHtml += '</div>';

        var tools = $(toolHtml);
        var header = $('<div class="header"></div>');
        var headerRow = $('<div class="row"></div>');
        var container = $('<div class="wrap"></div>');
        var body = $('<div class="body"></div>');
        var footer = $('<div class="footer"></div>');

        // Setup tools
        // Search
        tools.find("input").on("change", function(ev) {
            console.log("ProgTable: Searching data.", this.value, table);
            loading(tableID);
            _info.search.query = this.value;

            setTimeout(function() {
                render(tableID);
                console.log("ProgTable: Search callback.", _info.search.query, table);
                _info.onSearch(_info.search.query, _info);
            }, 1);
        }).val(_info.search.query);

        // Previous page
        tools.find("a.prev").on("click", function(ev) {
            if (_info.pagination.page == 0) {
                return;
            }

            console.log("ProgTable: Previous page", table);
            loading(tableID);
            _info.pagination.page--;

            setTimeout(function() {
                render(tableID);
                console.log("ProgTable: Page callback.", _info.pagination.page, table);
                // TODO: Implement this
            }, 1);
        });

        // Next page
        tools.find("a.next").on("click", function(ev) {
            if (_info.pagination.page == _info.pagination.totalPages - 1) {
                return;
            }

            console.log("ProgTable: Next page", table);
            loading(tableID);
            _info.pagination.page++;

            setTimeout(function() {
                render(tableID);
                console.log("ProgTable: Page callback.", _info.pagination.page, table);
                // TODO: Implement this
            }, 1);
        });

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
                    console.log("ProgTable: Sort callback.", _info.sort.col, _info.sort.order, _info);
                    _info.onSort(_info.sort.col, _info.sort.order, _info);
                }, 1);
            });

            headerRow.append(column);
        }

        header.append(headerRow);

        // Build body - apply search filters & templates, check pagination
        var ini = 0, end = _info.data.length;

        if (_info.pagination.size > 0) {
            ini = _info.pagination.size * _info.pagination.page;
            end = _info.pagination.size * (_info.pagination.page + 1);
            if (end > _info.data.length) end = _info.data.length;
        }

        for (var i = ini; i < end; ++i) {
            var included = false;
            var row = $('<div class="row"></div>');

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

                // Column template
                if (typeof _info.colTemplate[key] == "function") {
                    cellData = _info.colTemplate[key](i, cellData);
                }

                row.append("<span>" + cellData + "</span>");
            }

            if (included) $(body).append(row);
        }

        // Apply layout settings
        if (isNumber(_info.layout.height)) {
            container.css("height", _info.layout.height);
        }

        // Attach to DOM
        table.html("");
        table.append(tools);
        table.append(header);
        table.append(container);
        table.append(footer);
        container.append(body);
        console.log("ProgTable: Render ready", table);
    }


    /**
     * Main constructor, builds table data structure.
     */
    $.fn.ProgTable = function(options) {
        this.each(function(index, elem) {
            console.log("ProgTable: Initializing", this);

            // Default options for the table
            var id = this.id;
            var dict = {};
            dict.cols = [];
            dict.data = [];
            dict.layout = { height: undefined };
            dict.search = { query: "", function: null };
            dict.pagination = { page: 0, size: 0 };
            dict.sort = { col: "_index", order: "asc", function: null };
            dict.onSearch = function(query, table) {};
            dict.onSort = function(col, order, table) {};
            $.extend(true, dict, options);

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

            dict.pagination.totalPages = Math.ceil(dict.data.length / dict.pagination.size);
            console.log("ProgTable: Created table data structure.", dict);
            var container = $('<div class="prog-table" id="' + id + '"></div>');
            container[0]._ProgTable = dict;
            $(this).replaceWith(container);

            render(id);
        });
    };
}(jQuery));
