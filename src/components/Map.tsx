import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

interface Polygon {
  type: string;
  coordinates: number[][][];
}

interface PolygonItem {
  id: string;
  name: string;
  polygon: Polygon;
}

const Map: React.FC = () => {
  let map: mapboxgl.Map | null = null;
  let draw: MapboxDraw | null = null;
  let poly: any[] = [];
  let pastPoly: PolygonItem | null = null;
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

  const handleError = (errorMessage: string) => {
    const listContainer = document.getElementById('error');
    if (listContainer) {
      listContainer.innerHTML = '';
      const div = document.createElement('div');
      div.classList.add('error');
  
      const messageElement = document.createElement('div');
      messageElement.textContent = errorMessage;
      messageElement.classList.add('leftExistingPolygon');
      div.appendChild(messageElement);
  
      listContainer.appendChild(div);
    }
  };
  

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
    /* console.log(poly)
    console.log(typeof(pastPoly))
    console.log(typeof(poly)) */


    let pastPolyEmpty = pastPoly ? "filled" : "empty"
    console.log(pastPolyEmpty)
    if (name) {
      let newPolygonItem;
  
      if (poly.length > 0) {
        newPolygonItem = { id: poly[poly.length - 1].id, name: name, polygon: poly[poly.length - 1].geometry };
        handleError("")
      } else if (pastPoly) {
        if (pastPolyEmpty === "empty") {
          handleError("Draw a polygon to submit!")
          name = '';
        } else {
          newPolygonItem = { id: pastPoly.id, name: name, polygon: pastPoly.polygon };
          handleError("")
        }
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
        handleError("Draw a polygon to submit!")
      }
    } else {
      if (poly.length > 0) {
        handleError("Enter name to submit!")
      } else {
        if (pastPolyEmpty === "empty") {
          handleError("Enter name and draw polygon to submit!")
        } else {
          handleError("Enter name to submit!")
        }
      }
    }
  };
  
  const renderPolygons = () => {
    const listContainer1 = document.getElementById('polygons');
    if (listContainer1) {
      listContainer1.innerHTML = '';
      allPolys.forEach((item) => {
        const div = document.createElement('div');
        div.classList.add('existingPolygon');
        div.addEventListener('click', () => editPolygon(item));

        const leftSide = document.createElement('div');
        const rightSide = document.createElement('div');
        div.appendChild(leftSide);
        leftSide.classList.add('leftExistingPolygon');
        div.appendChild(rightSide);
        rightSide.classList.add('rightExistingPolygon');

        const polyTitle = document.createElement('div');
        polyTitle.textContent = `${item.name}`;
        leftSide.appendChild(polyTitle);

        const deleteButton = document.createElement('img');
        deleteButton.src = 'src/assets/trash.svg';
        deleteButton.alt = 'Delete'; 
        deleteButton.title = 'Delete polygon'; 
        deleteButton.addEventListener('click', (event) => {
          event.stopPropagation();
          deletePolygon(item);
        });
        rightSide.appendChild(deleteButton);

        listContainer1.appendChild(div);
      });
    }
  };

  const editPolygon = (item: any) => {  
    pastPoly = item;
    if (item && item.polygon && item.polygon.coordinates) {
      polyId = item.id as string; // Type assertion for id
      if (draw) {
        draw.deleteAll();
      }

      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement | null;
      if (inputElement) {
        inputElement.value = item.name as string; // Type assertion for name
      }

      name = item.name as string;

      const coordinates = item.polygon.coordinates[0];

      const centerCoordinates = {
        lng: coordinates[0][0], 
        lat: coordinates[0][1]
      };

      const initialPolygonData: GeoJSON.FeatureCollection<GeoJSON.Polygon> = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates]
          }
        }]
      };

      if (map && draw) {
        draw.add(initialPolygonData);
      }

      if (map) {
        map.jumpTo({
          center: centerCoordinates,
          zoom: 8
        });
      }

      renderPolygons();
    } else {
      console.error('Invalid item or polygon data:', item);
    }
};


  const deletePolygon = (deletedPoly: any) => { 
    allPolys = allPolys.filter(item => item.id !== deletedPoly.id);

    const listContainer1 = document.getElementById('polygons');
    if (listContainer1) {
      listContainer1.innerHTML = '';
      allPolys.forEach((item) => {
        const div = document.createElement('div');
        div.classList.add('existingPolygon');
        div.addEventListener('click', () => editPolygon(item));

        const leftSide = document.createElement('div');
        const rightSide = document.createElement('div');
        div.appendChild(leftSide);
        leftSide.classList.add('leftExistingPolygon');
        div.appendChild(rightSide);
        rightSide.classList.add('rightExistingPolygon');

        const polyTitle = document.createElement('div');
        polyTitle.textContent = `${item.name}`;
        leftSide.appendChild(polyTitle);

        const deleteButton = document.createElement('img');
        deleteButton.src = 'src/assets/trash.svg';
        deleteButton.alt = 'Delete'; 
        deleteButton.title = 'Delete polygon'; 
        deleteButton.addEventListener('click', (event) => {
          event.stopPropagation();
          deletePolygon(item);
        });
        rightSide.appendChild(deleteButton);

        listContainer1.appendChild(div);
      });
    }
  };

  return (
    <div className='pageGrid'>
      <div id="map"></div>
      {/* <div className='mapMenu'> */}
        <div className='mapButtons'>
          <div className='leftMapButtons'>
            <img onClick={handleDrawButtonClick} src="src/assets/draw.svg" alt="Draw" title="Draw polygon"/>
            <img onClick={handleDeleteButtonClick} src="src/assets/trash.svg" alt="Delete" title="Delete drawing"/>
          </div>
          {/* <form onSubmit={(e) => { e.preventDefault(); handleSaveButtonClick(); const formElement = e.target as HTMLFormElement; formElement.reset(); }} className='rightMapButtons'>
            <input type="text" onChange={(e) => { name = e.target.value }} placeholder='Enter name'/>
            <button type='submit'>Save Polygon</button>
          </form> */}
        </div>
        
          <div className='existingPolygons'>
            <div className='existingPolygonsContainer'>
              <h1>Save Polygon:</h1>
              <form onSubmit={(e) => { e.preventDefault(); handleSaveButtonClick(); const formElement = e.target as HTMLFormElement; formElement.reset(); }} className='rightMapButtons'>
                <input type="text" onChange={(e) => { name = e.target.value }} placeholder='Enter name'/>
                <button type='submit'>Save Polygon</button>
              </form>
              <div id="error"></div>
              <div id="polygons"></div>
            </div>
          </div>        
      {/* </div> */}
    </div>
  );
};

export default Map;