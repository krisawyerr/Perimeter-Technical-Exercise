import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

const Map: React.FC = () => {
  let map: mapboxgl.Map | null = null;
  let draw: MapboxDraw | null = null;
  let poly: any[] = [];
  let pastPoly: any[] = [];
  let name: string = '';
  let polyId: string = '';
  let allPolys: any[] = [];
  
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
    if (name) {
      let newPolygonItem;
  
      if (poly.length > 0) {
        newPolygonItem = { id: poly[poly.length - 1].id, name: name, polygon: poly[poly.length - 1].geometry };
      } else if (pastPoly) {
        newPolygonItem = { id: pastPoly.id, name: name, polygon: pastPoly.polygon };
      }
      
      if (newPolygonItem) {
        if (allPolys.some(item => item.id === polyId)) {
          allPolys = allPolys.filter(item => item.id !== polyId);
        }
  
        allPolys.push(newPolygonItem);
        name = '';
        poly = [];
        renderPolygons();
        if (draw) {
          draw.deleteAll();
        }
      } else {
        console.error('No polygon data found to save.');
      }
    }
  };
  
  const renderPolygons = () => {
    const listContainer1 = document.getElementById('title');
    if (listContainer1) {
      listContainer1.innerHTML = '';
      allPolys.forEach((item) => {
        const polyTitle = document.createElement('div');
        polyTitle.textContent = `${item.name}`;
        listContainer1.appendChild(polyTitle);
      });
    }
    const listContainer2 = document.getElementById('edit');
    if (listContainer2) {
      listContainer2.innerHTML = '';
      allPolys.forEach((item) => {
        const editButton = document.createElement('button');
        editButton.textContent = `Edit`;
        editButton.addEventListener('click', () => editPolygon(item));
        listContainer2.appendChild(editButton);
      });
    }
    const listContainer3 = document.getElementById('delete');
    if (listContainer3) {
      listContainer3.innerHTML = '';
      allPolys.forEach((item) => {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = `Delete`;
        deleteButton.addEventListener('click', () => deletePolygon(item));
        listContainer3.appendChild(deleteButton);
      });
    }
  };

  const editPolygon = (item: any) => {  
    pastPoly = item
    if (item && item.polygon && item.polygon.coordinates) {
      polyId = item.id;
      if (draw) {
        draw.deleteAll();
      }
  
      const inputElement = document.querySelector('input[type="text"]');
      if (inputElement) {
        inputElement.value = item.name;
      }
  
      name = item.name;
  
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
        draw.add(initialPolygonData);
      }

      renderPolygons();
    } else {
      console.error('Invalid item or polygon data:', item);
    }
  };

  const deletePolygon = (deletedPoly: any) => { 
    allPolys = allPolys.filter(item => item.id !== deletedPoly.id);

    const listContainer1 = document.getElementById('title');
    if (listContainer1) {
      listContainer1.innerHTML = '';
      allPolys.forEach((item) => {
        const polyTitle = document.createElement('div');
        polyTitle.textContent = `${item.name}`;
        listContainer1.appendChild(polyTitle);
      });
    }
    const listContainer2 = document.getElementById('edit');
    if (listContainer2) {
      listContainer2.innerHTML = '';
      allPolys.forEach((item) => {
        const editButton = document.createElement('button');
        editButton.textContent = `Edit`;
        editButton.addEventListener('click', () => editPolygon(item));
        listContainer2.appendChild(editButton);
      });
    }
    const listContainer3 = document.getElementById('delete');
    if (listContainer3) {
      listContainer3.innerHTML = '';
      allPolys.forEach((item) => {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = `Delete`;
        deleteButton.addEventListener('click', () => deletePolygon(item));
        listContainer3.appendChild(deleteButton);
      });
    }
  };

  return (
    <div>
      <div id="map" style={{ width: '1000px', height: '600px' }}></div>
      <button onClick={handleDrawButtonClick}>Draw Polygon</button>
      <button onClick={handleDeleteButtonClick}>Delete All</button>
      <br />
      <form onSubmit={(e) => {e.preventDefault();handleSaveButtonClick();e.target.reset();}}>
        <input type="text" onChange={(e) => { name = e.target.value }} />
        <button type='submit'>Save Polygon</button>
      </form>
      <div>
        <div id="title"></div>
        <div id="edit"></div>
        <div id="delete"></div>
      </div>
    </div>
  );
};

export default Map;