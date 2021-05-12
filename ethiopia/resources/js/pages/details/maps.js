import { filter } from "lodash";
import React, { useState, useEffect } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
    Marker,
} from "react-simple-maps";

import { UIStore } from "../../store";

function Map({ geoUrl }) {
    const mapMaxZoom = 4;
    const [position, setPosition] = useState({
        coordinates: ["38.69590", "7.34350"],
        zoom: 1,
    });
    const { state, woreda, kebele, config, firstFilter } = UIStore.useState();
    const woredaKey = state.config.locations.woreda;
    const kebeleKey = state.config.locations.kebele;
    const latlong = state.config.latlong;
    const [filterData, setFilterData] = useState();

    useEffect(() => {
        const filterData = state.data.filter(
            (x) => x[woredaKey].toLowerCase() === woreda.toLowerCase()
        );
        setFilterData(filterData);
    }, [woreda]);

    const onMapClick = (RK_NAME) => {
        UIStore.update((e) => {
            e.kebele = RK_NAME.toLowerCase();
        });
    };

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
                            const { W_NAME, RK_NAME } = geo.properties;
                            const kebeleData = filterData.filter(
                                (x) =>
                                    x?.[kebeleKey] &&
                                    x[kebeleKey].toString().toLowerCase() ===
                                        RK_NAME.toLowerCase()
                            );
                            const curr = kebeleData.length > 0;
                            const active =
                                kebele &&
                                kebele.toString().toLowerCase() ===
                                    RK_NAME.toLowerCase();
                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    stroke="#79B0CC"
                                    strokeWidth="0.5"
                                    strokeOpacity="0.6"
                                    // onMouseEnter={() => console.log(geo)}
                                    // onMouseLeave={() => console.log(geo)}
                                    onClick={() => {
                                        curr && onMapClick(RK_NAME);
                                    }}
                                    cursor={curr ? "pointer" : ""}
                                    style={{
                                        default: {
                                            fill: active
                                                ? "green"
                                                : curr
                                                ? "yellow"
                                                : "#D6D6DA",
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
                {firstFilter === "school" &&
                    filterData &&
                    filterData.map((item, index) => {
                        const { latitude, longitude } = latlong;
                        const coordinates = [item[longitude], item[latitude]];
                        return (
                            <Marker key={index} coordinates={coordinates}>
                                <circle
                                    r={3}
                                    fill="#F00"
                                    stroke="#fff"
                                    strokeWidth={0.7}
                                    onClick={() => console.log(item)}
                                    cursor="pointer"
                                />
                            </Marker>
                        );
                    })}
            </ZoomableGroup>
        </ComposableMap>
    );
}

export default Map;
