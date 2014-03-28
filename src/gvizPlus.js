var gvizPlus = {}
gvizPlus._construct = function() {

    var colors = ['blue', 'red', 'green', 'purple', 'orange'];
    var colorIndex = 0;

    function VAxis(id) {
        this.id = id;
    }

    function Line(column) {
        this.column = column;
        this.visible = true;
    }

    function Category(name) {
        this.name = name;

        this.lines = [];
        this.rows = [];
    }

    function DataSet(hAxis) {
        this.categories = [];
        this.allLines = new Object();
        this.hAxis = hAxis;
        this.vAxes = [];

        this.getOrCreateCategoryIndex = function(name) {
            var index = -1;
            for(var i = 0; i < this.categories.length; i++) {
                if(this.categories[i].name === name) {
                    index = i;
                    break;
                }
            }

            if(index == -1) {
                index = this.categories.length;
                this.categories.push(new Category(name));
            }
            return index;
        }

        this.addCategory = function(category, lines, rows) {
            var index = this.getOrCreateCategoryIndex(category);
            for(var i = 0; i < lines.length; i++) {
                var lineObj = new Line(lines[i]);
                lineObj.color = colors[colorIndex];
                colorIndex += 1;
                this.allLines[lines[i].label] = lineObj;
                this.categories[index].lines.push(lineObj);
            }
            for(var i = 0; i < rows.length; i++) {
                this.categories[index].rows.push(rows[i]);
            }
        }

        this.addAxis = function(lines) {
            var vAxis = new VAxis(this.vAxes.length);
            for(var i = 0; i < lines.length; i++) {
                this.allLines[lines[i].label].vAxis = vAxis;
            }
            this.vAxes.push(vAxis);
        }

        this.getColumnId = function(line, includeHidden) {
            var columnId = 0;
            for(var i = 0; i < this.categories.length; i++) {
                var category = this.categories[i];
                for(var k = 0; k < category.lines.length; k++) {
                    var currLine = category.lines[k];
                    if (currLine === line) {
                        return columnId;
                    } else if(includeHidden || currLine.visible){
                        columnId += 1;
                    }
                }
            }

            return -1;
        }
    }

    function Graph(id, title) {
        // Drawing properties
        this.div = document.getElementById(id);
        this.title = title;
        this.width = 1000;
        this.height = 500;

        this.generateDataTable = function(dataSet) {
            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn(dataSet.hAxis);
            for (var i = 0; i < dataSet.categories.length; i++) {
                var category = dataSet.categories[i];
                var currentColumns = dataTable.getNumberOfColumns() - 1;

                for(var j = 0; j < category.lines.length; j++) {
                    dataTable.addColumn(category.lines[j].column);
                }

                for(var j = 0; j < category.rows.length; j++) {
                    var row = category.rows[j];
                    if(i == 0) {
                        // We will take everything as-is from the first dataset
                        dataTable.addRow(row);
                    } else {
                        // For the rest, we'll add empty values until it's our spot
                        var newRow = [row[0]];

                        for(var k = 0; k < currentColumns; k++) {
                            newRow.push(null);
                        }

                        for(var k = 1; k < row.length; k++) {
                            newRow.push(row[k]);
                        }
                        dataTable.addRow(newRow);
                    }
                }
            }

            return dataTable;
        }

        this.generateGoogleAxisInfo = function(dataSet) {
            var googleAxisInfo = new Object();
            googleAxisInfo.vAxis = {0:{textPosition:'none'}};
            googleAxisInfo.series = {};
            if (dataSet.vAxes.length > 0) {
                for (var i = 0; i < dataSet.vAxes.length; i++) {
                    var vAxis = dataSet.vAxes[i];
                    googleAxisInfo.vAxis[vAxis.id + 1] = {textPosition:'none'};
                }
            }

            for (key in dataSet.allLines) {
                var line = dataSet.allLines[key];

                if (line.visible) {
                    var columnId = dataSet.getColumnId(line, false); // Lines map to columns in the dataTable
                    var vAxisId = 0;
                    if (line.vAxis) {
                        vAxisId = line.vAxis.id + 1;
                    }
                    googleAxisInfo.series[columnId] = {targetAxisIndex:vAxisId, color:line.color};
                }
            }

            return googleAxisInfo;
        }

        function addText(toElem, text) {
            var textNode = document.createTextNode(text);
            toElem.appendChild(textNode);
            return textNode
        }

        function addElement(toElem, type, name) {
            var newElem = document.createElement(type);
            newElem.setAttribute('name', name);
            toElem.appendChild(newElem);
            return newElem;
        }

        this.draw = function(dataSet) {
            this.dataSet = dataSet;
            var dataTable = this.generateDataTable(dataSet);
            this.googleHAxis = {title: dataSet.hAxis['label']};
            this.googleDataView = new google.visualization.DataView(dataTable);

            addText(this.div, this.title);

            var googleDiv = addElement(this.div, 'div', id + '_google');
            var legendDiv = addElement(this.div, 'div', id + '_legend');
            legendDiv.setAttribute('style', 'position: absolute;top: 50px');
            addText(legendDiv, 'Legend');

            for (var i = 0; i < dataSet.categories.length; i++) {
                var category = dataSet.categories[i];
                var categoryDiv = addElement(legendDiv, 'div', 'category_' + category.name);
                addText(categoryDiv, category.name);

                for(var j = 0; j < category.lines.length; j++) {
                    var line = category.lines[j];
                    var lineDiv = addElement(categoryDiv, 'div', 'line_' + line.column.label);
                    lineDiv.setAttribute('style', 'background-color: ' + line.color + ';color:white');
                    addText(lineDiv, line.column.label);

                    lineDiv.style.cursor = 'pointer';
                    lineDiv.onclick = function(gvizPlus, line) {
                        return function() {
                            var columnId = gvizPlus.dataSet.getColumnId(line, true) + 1;
                            if (line.visible) {
                                line.visible = false;
                                gvizPlus.googleDataView.hideColumns([columnId]);
                            } else {
                                line.visible = true;
                                var currColumns = gvizPlus.googleDataView.getViewColumns();
                                currColumns.push(columnId);
                                currColumns.sort();
                                gvizPlus.googleDataView.setColumns(currColumns);
                            }
                            gvizPlus.googleDraw();
                        }
                    }(this, line);
                }
            }

            this.googleChart = new google.visualization.LineChart(googleDiv);
            this.googleDraw();
        }

        this.googleDraw = function() {
            var googleAxisInfo = this.generateGoogleAxisInfo(this.dataSet);
            this.googleChart.draw(this.googleDataView, {
              title : null,
              legend : 'none', // We'll draw a better legend
              interpolateNulls : false,
              width: this.width,
              height: this.height,
              hAxis: this.googleHAxis,
              vAxes: googleAxisInfo.vAxis,
              series: googleAxisInfo.series
            });
        }
    }

    this.DataSet = DataSet
    this.Graph = Graph
}
gvizPlus._construct()