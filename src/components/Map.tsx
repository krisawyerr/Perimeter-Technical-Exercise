import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

const Map: React.FC = () => {
  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoia3Jpc2F3eWVyciIsImEiOiJjbG1vZHFiY2wxMDJ5MmxwbjVwNm5qZnVzIn0.-toq3H6oxw1OCdkI2ZERsA';

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/krisawyerr/clubvvb26000q01pw535n9929',
      center: [-74.5, 40],
      zoom: 9 
    });

    return () => {
      map.remove();
    };
  }, []);

  return <div id="map" style={{ width: '1000px', height: '600px' }}></div>;
};

export default Map;
