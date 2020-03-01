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
  })
});


function map() {
  var zoomThreshold = 5;
  var color_ls = ['#F2F12D', '#EED322', '#E6B71E', '#DA9C20', '#CA8323', '#B86B25', '#A25626', '#8B4225', '#723122'];
  var cutoff_r95_vals = [0, 0.5, 0.8, 0.9, 0.95, 1, 1.05, 1.1, Infinity];
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-98, 38.88],
    minZoom: 3,
    zoom: 3
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
          });

        map.on('click', 'counties-layer', function(e) {
          new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(e.features[0].properties.NAME)
          .addTo(map);
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

