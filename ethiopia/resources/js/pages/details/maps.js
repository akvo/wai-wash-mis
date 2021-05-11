import React, { useState } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
} from "react-simple-maps";

function Map({ geoUrl }) {
    const mapMaxZoom = 4;
    const [position, setPosition] = useState({
        coordinates: ["38.69590", "7.34350"],
        zoom: 1,
    });

    return (
        <ComposableMap
            data-tip=""
            projection="geoEquirectangular"
            height={300}
            projectionConfig={{ scale: 22000 }}
        >
            <ZoomableGroup
                maxZoom={mapMaxZoom}
                zoom={position.zoom}
                center={position.coordinates}
                onMoveEnd={(x) => {
                    setPosition(x);
                }}
            >
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    stroke="#79B0CC"
                                    strokeWidth="0.5"
                                    strokeOpacity="0.6"
                                    onMouseEnter={() => console.log(geo)}
                                    onMouseLeave={() => console.log(geo)}
                                    onClick={() => console.log(geo)}
                                    style={{
                                        default: {
                                            fill: "#D6D6DA",
                                            outline: "none",
                                        },
                                        hover: {
                                            fill: "#F53",
                                            outline: "none",
                                        },
                                        pressed: {
                                            fill: "#E42",
                                            outline: "none",
                                        },
                                    }}
                                />
                            );
                        })
                    }
                </Geographies>
            </ZoomableGroup>
        </ComposableMap>
    );
}

export default Map;
