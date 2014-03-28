var gvizPlus = {}
gvizPlus._construct = function() {

    function Category(name) {
        this.name = name;

        this.columns = [];
        this.rows = [];
    }

    function VAxis(lines) {
        this.lines = lines;
    }

    function DataSet(hAxis) {
        this.categories = [];
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
                this.categories[index].columns.push(lines[i]);
            }
            for(var i = 0; i < rows.length; i++) {
                this.categories[index].rows.push(rows[i]);
            }
        }

        this.addAxis = function(lines) {
            this.vAxes.push(new VAxis(lines));
        }

        this.getColumnId = function(line) {
            var columnId = 0;
            for(var i = 0; i < this.categories.length; i++) {
                var category = this.categories[i];
                var index = category.columns.indexOf(line);
                if(index != -1) {
                    columnId += index;
                    break;
                } else {
                    columnId += category.columns.length;
                }
            }

            return columnId;
        }
    }

    function Graph(id, title) {
        this.chart = new google.visualization.LineChart(document.getElementById(id));

        // Drawing properties
        this.title = title;
        this.width = 1000;
        this.height = 500;

        this.generateDataTable = function(dataSet) {
            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn(dataSet.hAxis);
            for (var i = 0; i < dataSet.categories.length; i++) {
                var category = dataSet.categories[i];
                var currentColumns = dataTable.getNumberOfColumns() - 1;

                for(var j = 0; j < category.columns.length; j++) {
                    dataTable.addColumn(category.columns[j]);
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
            googleAxisInfo.vAxis = {0: {textPosition:'none'}};
            googleAxisInfo.series = {};
            if (dataSet.vAxes.length > 0) {
                for (var i = 0; i < dataSet.vAxes.length; i++) {
                    var vAxis = dataSet.vAxes[i];
                    googleAxisInfo.vAxis[i + 1] = {textPosition:'none'};

                    for (var j = 0; j < vAxis.lines.length; j++) {
                        var line = vAxis.lines[j];
                        var columnId = dataSet.getColumnId(line); // Lines map to columns in the dataTable

                        googleAxisInfo.series[columnId] = {targetAxisIndex:i + 1};
                    }
                }
            }

            return googleAxisInfo;
        }

        this.draw = function(dataSet) {
            var dataTable = this.generateDataTable(dataSet);
            var googleAxisInfo = this.generateGoogleAxisInfo(dataSet);

            this.chart.draw(dataTable, {
              title : this.title,
              legend : 'none', // We'll draw a better legend
              interpolateNulls : false,
              width: this.width,
              height: this.height,
              hAxis: {title: dataSet.hAxis['label']},
              vAxes: googleAxisInfo.vAxis,
              series: googleAxisInfo.series
            });
        }
    }

    this.DataSet = DataSet
    this.Graph = Graph
}
gvizPlus._construct()