import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

const Map: React.FC = () => {
  let map: mapboxgl.Map | null = null;
  let draw: MapboxDraw | null = null;
  let poly: any[] = [];
  let name: string = '';
  let polyId: string = '';
  let allPolys: any[] = [];
  let isEditting: boolean = false;

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoia3Jpc2F3eWVyciIsImEiOiJjbG1vZHFiY2wxMDJ5MmxwbjVwNm5qZnVzIn0.-toq3H6oxw1OCdkI2ZERsA';

    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40],
      zoom: 9,
    });

    draw = new MapboxDraw({
      displayControlsDefault: false,
    });

    map.on('load', () => {
      if (map && draw) {
        map.addControl(draw);

        document.querySelectorAll('.mapbox-gl-draw_ctrl').forEach((control) => {
          control.remove();
        });
      }
    });

    map.on('draw.create', (event) => {
      poly.push(event.features[0]);
      renderPolygons();
    });

    map.on('draw.update', (event) => {
      poly.push(event.features[0]);
      renderPolygons();
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
      poly = [];
      renderPolygons();
    }
  };

  const handleSaveButtonClick = () => {
    if (name && poly.length > 0) {
      const newPolygonItem = { id: poly[poly.length - 1].id, name: name, polygon: poly[poly.length - 1].geometry };
      allPolys.push(newPolygonItem);
      name = '';
      poly = [];
      renderPolygons();
      if (draw) {
        draw.deleteAll();
      }
    }
  };

  const renderPolygons = () => {
    const listContainer = document.getElementById('32544');
    if (listContainer) {
      listContainer.innerHTML = '';
      allPolys.forEach((item) => {
        const div = document.createElement('div');
        const editButton = document.createElement('button');
        editButton.textContent = `edit ${item.name}`;
        editButton.addEventListener('click', () => editPolygon(item));
        div.appendChild(editButton);
        listContainer.appendChild(div);
      });
    }
  };

  /* const editPolygon = (item: any) => {
    isEditting = true
    polyId = item.id
    name = item.name
    poly = item.polygon

    console.log(isEditting)
    console.log(polyId)
    console.log(name)
    console.log(poly)
  }; */

  const editPolygon = (item: any) => {
    const coordinates = item.polygon.coordinates[0];
    const initialPolygonData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates]
          }
        }
      ]
    };
  
    if (map && draw) {
      if (map.getLayer('editable-polygons')) {
        map.removeLayer('editable-polygons');
      }
      if (map.getSource('editable-polygons')) {
        map.removeSource('editable-polygons');
      }
  
      map.addSource('editable-polygons', {
        type: 'geojson',
        data: initialPolygonData
      });
  
      map.addLayer({
        id: 'editable-polygons',
        type: 'fill',
        source: 'editable-polygons',
        paint: {
          'fill-color': 'transparent',
          'fill-opacity': 0.5
        }
      });
  
      draw.add(initialPolygonData);
  
      map.on('draw.create', updateData);
      map.on('draw.update', updateData);
      map.on('draw.delete', updateData);
  
      function updateData() {
        const data = draw.getAll();
        map.getSource('editable-polygons').setData(data);
      }
    }
  };
  
  return (
    <div>
      <div id="map" style={{ width: '1000px', height: '600px' }}></div>
      <button onClick={handleDrawButtonClick}>Draw Polygon</button>
      <button onClick={handleDeleteButtonClick}>Delete All</button>
      <br />
      <input type="text" onChange={(e) => { name = e.target.value }} />
      <button onClick={handleSaveButtonClick}>Save Polygon</button>
      <div id="32544"></div>
    </div>
  );
};

export default Map;