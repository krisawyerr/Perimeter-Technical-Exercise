import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

const Map: React.FC = () => {
  let map: mapboxgl.Map | null = null;
  let draw: MapboxDraw | null = null;

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoia3Jpc2F3eWVyciIsImEiOiJjbG1vZHFiY2wxMDJ5MmxwbjVwNm5qZnVzIn0.-toq3H6oxw1OCdkI2ZERsA';

    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/krisawyerr/clubvvb26000q01pw535n9929',
      center: [-74.5, 40],
      zoom: 9 
    });

    draw = new MapboxDraw({
      displayControlsDefault: false
    });

    map.on('load', () => {
      if (map && draw) {
        map.addControl(draw);

        document.querySelectorAll('.mapbox-gl-draw_ctrl').forEach((control) => {
          control.remove();
        });
      }
    });

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  const handleDrawButtonClick = () => {
    if (draw) {
      draw.changeMode('draw_polygon');
    }
  };

  const handleDeleteButtonClick = () => {
    if (draw) {
      draw.deleteAll();
    }
  };

  return (
    <div>
      <div id="map" style={{ width: '1000px', height: '600px' }}></div>
      <input type="text" />
      <button onClick={handleDrawButtonClick}>Draw Polygon</button>
      <button onClick={handleDeleteButtonClick}>Delete All</button>
    </div>  
  );
};

export default Map;