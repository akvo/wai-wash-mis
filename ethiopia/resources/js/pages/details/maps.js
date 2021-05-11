import React from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
} from "react-simple-maps";

function Map({ geoUrl }) {
    return (
        <ComposableMap
            data-tip=""
            projection="geoEquirectangular"
            zoom={10}
            height={300}
            projectionConfig={{ scale: 22000 }}
        >
            <ZoomableGroup center={["38.69590", "7.34350"]}>
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
