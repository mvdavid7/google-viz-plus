var gvizPlus = {}
gvizPlus._construct = function() {

    function DataLine(id) {
    }

    function DataSet(name, dataTable) {
        this.name = name;
        this.data = dataTable;
    }

    function Graph(id, title) {
        this.chart = new google.visualization.LineChart(document.getElementById(id));
        this.dataSets = [];
        
        // Drawing properties
        this.title = title;
        this.hAxisTitle = "";
        this.width = 1000;
        this.height = 500;

        this.addDataSet = function(dataSet) {
            this.dataSets.push(dataSet);
        }

        this.draw = function() {
            this.chart.draw(this.dataSets[0].data, {
              title : this.title,
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