const domReady = require('domready');
import './stylesheets/main.css';
import {csv} from 'd3-fetch';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoiZXJobGFuZ28iLCJhIjoiY2s3OThuZHYxMGlmejNkbXk4djNhZTdjdiJ9._774XdciUdaC6RN-6vQmSA';

domReady(() => {
  Promise.all([
    csv('./data/state_regressivity.csv'),
    csv('./data/county_regressivity.csv')
  ]).then(d => {
    const [state, county] = d;
    map();
    othergraphs(state, county);
  })
});


function map() {
  var zoomThreshold = 5;
  var color_ls = ['#F2F12D', '#EED322', '#E6B71E', '#DA9C20', '#CA8323', '#B86B25', '#A25626', '#8B4225', '#723122'];
  var cutoff_r95_vals = [0, 0.5, 0.8, 0.9, 0.95, 1, 1.05, 1.1, Infinity];
  
  var v2 = new mapboxgl.LngLatBounds([-126, 23], [-65, 51])


  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-98, 38.88],
    minZoom: 3,
    zoom: 3,
    maxBounds: v2 // Sets bounds as max
    });

    map.on('load', function() {
      map.addSource('weighted_mean', {
      'type': 'vector',
      'url': 'mapbox://erhlango.cad2m3uh'
      });

      map.addSource('r95_to_r5', {
        'type': 'vector',
        'url': 'mapbox://erhlango.5e7hhwiz'
        });

      map.addLayer(
        {
        'id': 'states-layer',
        'source': 'weighted_mean',
        'source-layer': 'states-61tqdo',
        'maxzoom': zoomThreshold,
        'type': 'fill',
        'paint': {
        'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'weighted_mean'],
        cutoff_r95_vals[0],
        color_ls[0],
        cutoff_r95_vals[1],
        color_ls[1],
        cutoff_r95_vals[2],
        color_ls[2],
        cutoff_r95_vals[3],
        color_ls[3],
        cutoff_r95_vals[4],
        color_ls[4],
        cutoff_r95_vals[5],
        color_ls[5],
        cutoff_r95_vals[6],
        color_ls[6],
        cutoff_r95_vals[7],
        color_ls[7],
        cutoff_r95_vals[8],
        color_ls[8]
        ],
        'fill-opacity': 0.75
        }
        });
      map.addLayer(
        {
        'id': 'counties-layer',
        'source': 'r95_to_r5',
        'source-layer': 'counties-7dni8i',
        'minzoom': zoomThreshold,
        'type': 'fill',
        'paint': {
        'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'r95_to_r5'],
        cutoff_r95_vals[0],
        color_ls[0],
        cutoff_r95_vals[1],
        color_ls[1],
        cutoff_r95_vals[2],
        color_ls[2],
        cutoff_r95_vals[3],
        color_ls[3],
        cutoff_r95_vals[4],
        color_ls[4],
        cutoff_r95_vals[5],
        color_ls[5],
        cutoff_r95_vals[6],
        color_ls[6],
        cutoff_r95_vals[7],
        color_ls[7],
        cutoff_r95_vals[8],
        color_ls[8]
        ],
        'fill-opacity': 0.75
        }
        });
        
        map.on('click', 'states-layer', function(e) {
          new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(e.features[0].properties.NAME)
          .addTo(map);

          console.log(e.features[0].properties.GEOID)
          });

        map.on('click', 'counties-layer', function(e) {
          new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(e.features[0].properties.NAME)
          .addTo(map);

          console.log(e.features[0].properties.GEOID)

          });
        
        map.on('mouseenter', 'states-layer', function() {
        map.getCanvas().style.cursor = 'pointer';
        });
          
        map.on('mouseleave', 'states-layer', function() {
        map.getCanvas().style.cursor = '';
        });

        map.on('mouseenter', 'counties-layer', function() {
        map.getCanvas().style.cursor = 'pointer';
        });
          
        map.on('mouseleave', 'counties-layer', function() {
        map.getCanvas().style.cursor = '';
        });

    });
}

function othergraphs(state, county) {
  console.log(county)
  console.log(state)
};

function empty(){
  var margin = {top: 20, right: 20, bottom: 40, left: 60};
  var width = 800 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;

  var x = d3.scaleLog().domain([0.1,10]).range([width, 0]);
  var y = d3.scaleLog().domain([0.1,10]).range([0,height]);

  var svg = d3.select("#graph").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  var iris = d3.json('iris.json')
  .then((data) => { svg.selectAll("dot")
    .data(data)
    .enter().append("circle")
    .attr("r", 5)
    .attr("cx", function(data) { return x(data.sepalLength); })
      .attr("cy", function(data) { return y(data.petalLength); })
      .attr("class", function(data) { return data.species; })
  })
  .catch(err => console.log(err));

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  svg.append("g")
    .call(d3.axisLeft(y));

  //title
  svg.append("text")
    .attr("x", width/2)
    .attr("y", 10)
    .attr("text-anchor", "middle")  
    .style("font-size", "24px") 
    .text("Sepal Length vs. Petal Length")

  //subtitle
  svg.append("text")
    .attr("x", width/2)
    .attr("y", 40)
    .attr("text-anchor", "middle")  
    .style("font-size", "16px") 
    .text("A Reverse Log-Log Plot")

  //x label
  svg.append("text")             
    .attr("x", width/2)
    .attr("y", height + 35)
    .style("text-anchor", "middle")
    .text("Sepal Length (log)");

  //y label
  svg.append("text")     
    .attr("x", 0 - (height / 2))
    .attr("y", 0 - margin.left / 1.5)
    .attr("transform", "rotate(-90)")        
    .style("text-anchor", "middle")
    .text("Petal Length (log)");

  //data sourcing
  svg.append("text")             
    .attr("x", width - 75)
    .attr("y", height + 37.5)
    .style("font-size", "12px") 
    .text("Source: Iris Dataset");

  //legend
  var legend_x = width - 100;
  var legend_y = height - 350;
  var offset = 20;

  svg.append("text")
    .attr("x", legend_x)
    .attr("y", legend_y - 10)
    .text("Legend")

  svg.append("rect")
    .attr("x", legend_x)
    .attr("y", legend_y)
    .attr("width", 10)
    .attr("height", 10)
    .attr("class", "virginica")

  svg.append("rect")
    .attr("x", legend_x)
    .attr("y", legend_y + offset)
    .attr("width", 10)
    .attr("height", 10)
    .attr("class", "versicolor")

  svg.append("rect")
    .attr("x", legend_x)
    .attr("y", legend_y + 2*offset)
    .attr("width", 10)
    .attr("height", 10)
    .attr("class", "setosa")

  svg.append("text")
    .attr("x", legend_x + offset)
    .attr("y", legend_y + 10)
    .text("virginica")

  svg.append("text")
    .attr("x", legend_x + offset)
    .attr("y", legend_y + 10 + offset)
    .text("versicolor")

  svg.append("text")
    .attr("x", legend_x + offset)
    .attr("y", legend_y + 10 + 2*offset)
    .text("setosa")
  }