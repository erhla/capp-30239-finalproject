const domReady = require('domready');
import './stylesheets/main.css';
import {csv} from 'd3-fetch';
import mapboxgl from 'mapbox-gl';
import * as d3 from "d3";

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
  var color_ls = ['#D73027', '#F46D43', '#FDAE61', '#FEE08B', '#D9EF8B', '#A6D96A', '#66BD63', '#1A9850'];
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
        color_ls[7]
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
        color_ls[7]
        ],
        'fill-opacity': 0.75
        }
        });
        
        map.on('click', 'states-layer', function(e) {
          new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(e.features[0].properties.NAME + ', ' + e.features[0].properties.r95_to_r5)
          .addTo(map);

          console.log(e.features[0].properties.GEOID)
          });

        map.on('click', 'counties-layer', function(e) {
          var caption = Math.round(parseFloat(e.features[0].properties.r95_to_r5) * 1000) / 1000
                 
          new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(e.features[0].properties.NAME + '<br> Regressivity level: ' + caption)
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



        for (let i = 0; i < color_ls.length; i++) {
          var layer = cutoff_r95_vals[i] + " to " + cutoff_r95_vals[i+1];
          var color = color_ls[i];
          var item = document.createElement('div');
          var key = document.createElement('span');
          key.className = 'legend-key';
          key.style.backgroundColor = color;
        
          var value = document.createElement('span');
          value.innerHTML = layer;
          item.appendChild(key);
          item.appendChild(value);
          legend.appendChild(item);
        }

    });
}

function othergraphs(state, county) {
  console.log(county)
  console.log(state)

  county.forEach(function(d) {
    d.total_pop = +d.total_pop;
  });

  temp(county)

};

function temp(data){

  var margin = {top: 20, right: 20, bottom: 40, left: 60};
  var width = 800 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;

  var x = d3.scaleLinear().domain(d3.extent(data, d => d.prd)).range([0, width]);
  var y = d3.scaleLog().domain([1, d3.max(data, d => d.total_pop)]).range([height, 0]);

  var svg = d3.select("#othergraphs").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
 
  svg.selectAll("dot")
    .data(data)
    .enter().append("circle")
    .attr("r", 5)
    .attr("cx", function(data) { return x(data.prd); })
    .attr("cy", function(data) { return y(data.total_pop); })
    .attr("class", function(data) { return data.density_bin; })

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
    .text("Regressivity by State")

  //subtitle
  svg.append("text")
    .attr("x", width/2)
    .attr("y", 40)
    .attr("text-anchor", "middle")  
    .style("font-size", "16px") 
    .text("Subtitle")

  //x label
  svg.append("text")             
    .attr("x", width/2)
    .attr("y", height + 35)
    .style("text-anchor", "middle")
    .text("PRD");

  //y label
  svg.append("text")     
    .attr("x", 0 - (height / 2))
    .attr("y", 0 - margin.left / 1.5)
    .attr("transform", "rotate(-90)")        
    .style("text-anchor", "middle")
    .text("Population");

  //data sourcing
  svg.append("text")             
    .attr("x", width - 75)
    .attr("y", height + 37.5)
    .style("font-size", "12px") 
    .text("Source: CoreLogic");

  //legend
  var legend_x = width - 100;
  var legend_y = height - 350;
  var offset = 20;

  svg.append("text")
    .attr("x", legend_x)
    .attr("y", legend_y - 10)
    .text("Population")

  svg.append("rect")
    .attr("x", legend_x)
    .attr("y", legend_y)
    .attr("width", 10)
    .attr("height", 10)
    .attr("class", "0-50,000")

  svg.append("rect")
    .attr("x", legend_x)
    .attr("y", legend_y + offset)
    .attr("width", 10)
    .attr("height", 10)
    .attr("class", "50,001-250,000")

  svg.append("rect")
    .attr("x", legend_x)
    .attr("y", legend_y + 2*offset)
    .attr("width", 10)
    .attr("height", 10)
    .attr("class", "250,001-1,000,000")

  svg.append("rect")
    .attr("x", legend_x)
    .attr("y", legend_y + 3*offset)
    .attr("width", 10)
    .attr("height", 10)
    .attr("class", "Over 1,000,000")

  svg.append("text")
    .attr("x", legend_x + offset)
    .attr("y", legend_y + 10)
    .text("0-50,000")

  svg.append("text")
    .attr("x", legend_x + offset)
    .attr("y", legend_y + 10 + offset)
    .text("50,001-250,000")

  svg.append("text")
    .attr("x", legend_x + offset)
    .attr("y", legend_y + 10 + 2*offset)
    .text("250,001-1,000,000")

  svg.append("text")
    .attr("x", legend_x + offset)
    .attr("y", legend_y + 10 + 3*offset)
    .text("Over 1,000,000")
  }