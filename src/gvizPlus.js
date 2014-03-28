var gvizPlus = {}
gvizPlus._construct = function() {

    function Category(name) {
        this.name = name;

        this.columns = [];
        this.rows = [];
    }

    function DataSet(hAxis) {
        this.categories = [];
        this.hAxis = hAxis;

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

        this.addCategory = function(category, columns, rows) {
            var index = this.getOrCreateCategoryIndex(category);
            for(var i = 0; i < columns.length; i++) {
                this.categories[index].columns.push(columns[i]);
            }
            for(var i = 0; i < rows.length; i++) {
                this.categories[index].rows.push(rows[i]);
            }
        }
    }

    function Graph(id, title) {
        this.chart = new google.visualization.LineChart(document.getElementById(id));

        // Drawing properties
        this.title = title;
        this.hAxisTitle = "";
        this.width = 1000;
        this.height = 500;

        this.draw = function(dataSet) {
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

            this.chart.draw(dataTable, {
              title : this.title,
              legend : 'none', // We'll draw a better legend
              interpolateNulls : false,
              width: this.width,
              height: this.height,
              vAxis: {0: {}, 1: {}},
              hAxis: { title: this.hAxisTitle },
              series: {1: {targetAxisIndex:1}}
            });
        }
    }

    this.DataSet = DataSet
    this.Graph = Graph
}
gvizPlus._construct()