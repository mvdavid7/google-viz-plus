google-viz-plus
===============

A wrapper around the Google Visualization API to support overlaying multiple data sets.

```javascript

// Create your graph by specifying the DIV and title
var graph = new gvizPlus.Graph('awesomeGraphDiv', 'Google Viz Plus Graph');

// Set any properties
graph.width = window.innerWidth - 50;
graph.height = window.innerHeight;

// Initialize the dataset
var dataSet = new gvizPlus.DataSet(hAxis);

// Set your own colors if you don't like the defaults
//dataSet.setColors([...]);

// Grouping lines by categories
dataSet.addCategory('Chart 1 Category', [lineA, lineB], set1Rows);
dataSet.addCategory('Chart 2 Category', [lineC, lineD, lineE], set2Rows);

// You can even group lines in different axes
dataSet.addAxis('Axis 1', [lineA, lineC, lineD]);
dataSet.addAxis('Axis 2', [lineB]);

// Then render
graph.draw(dataSet);

```
