import React, { useState, useEffect } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
    Marker,
} from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import { Tooltip, Button } from "antd";
import {
    ZoomInOutlined,
    ZoomOutOutlined,
    FullscreenOutlined,
} from "@ant-design/icons";

import { UIStore } from "../store";

import groupBy from "lodash/groupBy";
import { scaleQuantize } from "d3-scale";
import { filter } from "lodash";

const mapMaxZoom = 4;
const defCenter = ["33.3486", "2.9251"];
const colorRange = ["#bbedda", "#a7e1cb", "#92d5bd", "#7dcaaf", "#67bea1"];
const showMarkerOnFirstFilterValues = ["wp", "health"];

const ToolTipContent = ({ data, geo }) => {
    return (
        <div className="map-tooltip">
            <h3>{geo.ADM4_EN}</h3>
        </div>
    );
};

const ToolTipMarker = ({ item, config, firstFilter }) => {
    const { marker } = config;
    return (
        <div className="map-tooltip">
            <h3 style={{ textTransform: "capitalize" }}>
                {marker ? item?.[marker?.name] : "Name"}
            </h3>
            {firstFilter === "wp" && (
                <ul>
                    {marker?.detail &&
                        marker.detail.map(({ name, column, action, type }) => {
                            let value = "-";
                            const nullValue =
                                type === "string"
                                    ? ""
                                    : type === "number"
                                    ? 0
                                    : null;

                            if (action === "select") {
                                value =
                                    item[column] === nullValue
                                        ? value
                                        : item[column];
                            }
                            return (
                                <li key={name}>
                                    <span>{name}</span>
                                    <b>{value}</b>
                                </li>
                            );
                        })}
                </ul>
            )}
        </div>
    );
};

function Map({ geoUrl }) {
    const [position, setPosition] = useState({
        coordinates: defCenter,
        zoom: 1,
    });
    const { state, woreda, kebele, firstFilter } = UIStore.useState();
    const woredaKey = state?.config?.locations?.woreda;
    const kebeleKey = state?.config?.locations?.kebele;
    const latlong = state?.config?.latlong;
    const marker = state?.config?.marker;
    const [filterData, setFilterData] = useState();
    const [content, setContent] = useState("");

    useEffect(() => {
        const filterData =
            state?.data &&
            state?.data.filter(
                (x) => x[woredaKey].toLowerCase() === woreda?.toLowerCase()
            );
        setFilterData(filterData);
    }, [woreda]);

    const domain = filterData
        ? Object.values(groupBy(filterData, kebeleKey)).reduce(
              (acc, curr) => {
                  const v = curr.length;
                  const [min, max] = acc;
                  return [min, v > max ? v : max];
              },
              [0, 0]
          )
        : [0, 0];

    const colorScale = scaleQuantize().domain(domain).range(colorRange);

    const fillColor = (v) => {
        return v === 0 ? "#F9F9F9" : colorScale(v);
    };

    const onMapClick = (geo) => {
        const { ADM4_EN } = geo.properties;
        const coordinates = geo.geometry.coordinates[0];

        // calculate center position
        let center = position.coordinates;
        if (coordinates.length === 1) {
            center = [coordinates[0][0], coordinates[0][1]];
        } else {
            let x = 0;
            let y = 0;
            let z = 0;

            coordinates.forEach((pos) => {
                let latitude = (pos[0] * Math.PI) / 180;
                let longitude = (pos[1] * Math.PI) / 180;
                x += Math.cos(latitude) * Math.cos(longitude);
                y += Math.cos(latitude) * Math.sin(longitude);
                z += Math.sin(latitude);
            });

            let total = coordinates.length;

            x = x / total;
            y = y / total;
            z = z / total;

            let centralLongitude = Math.atan2(y, x);
            let centralSquareRoot = Math.sqrt(x * x + y * y);
            let centralLatitude = Math.atan2(z, centralSquareRoot);

            center = [
                (centralLatitude * 180) / Math.PI,
                (centralLongitude * 180) / Math.PI,
            ];
        }
        setPosition({ coordinates: center, zoom: 3 });
        UIStore.update((e) => {
            e.kebele = ADM4_EN.toLowerCase();
            e.markerDetail = {
                ...e.markerDetail,
                active: false,
                data: {},
            };
        });
    };

    const onMarkerClick = (data) => {
        UIStore.update((e) => {
            e.kebele = data[kebeleKey].toLowerCase();
            e.markerDetail = {
                ...e.markerDetail,
                active: true,
                data: data,
            };
        });
    };

    return (
        <div>
            <div className="map-buttons">
                <Tooltip title="zoom out">
                    <Button
                        type="secondary"
                        icon={<ZoomOutOutlined />}
                        onClick={() => {
                            position.zoom > 1 &&
                                setPosition({
                                    ...position,
                                    zoom: position.zoom - 0.5,
                                });
                        }}
                        disabled={position.zoom <= 1}
                    />
                </Tooltip>
                <Tooltip title="zoom in">
                    <Button
                        disabled={position.zoom >= mapMaxZoom}
                        type="secondary"
                        icon={<ZoomInOutlined />}
                        onClick={() => {
                            setPosition({
                                ...position,
                                zoom: position.zoom + 0.5,
                            });
                        }}
                    />
                </Tooltip>
                <Tooltip title="reset zoom">
                    <Button
                        type="secondary"
                        icon={<FullscreenOutlined />}
                        onClick={() => {
                            setPosition({ coordinates: defCenter, zoom: 1 });
                        }}
                    />
                </Tooltip>
            </div>
            <ComposableMap
                data-tip=""
                projection="geoEquirectangular"
                height={350}
                projectionConfig={{ scale: 25000 }}
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
                                const { ADM4_EN } = geo.properties;
                                const kebeleData =
                                    filterData &&
                                    filterData.filter(
                                        (x) =>
                                            x?.[kebeleKey] &&
                                            x[kebeleKey]
                                                .toString()
                                                .toLowerCase() ===
                                                ADM4_EN.toLowerCase()
                                    );
                                const curr =
                                    kebeleData && kebeleData.length > 0;
                                const active =
                                    kebele &&
                                    kebele.toString().toLowerCase() ===
                                        ADM4_EN.toLowerCase();
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        stroke="#79B0CC"
                                        strokeWidth="0.5"
                                        strokeOpacity="0.6"
                                        onMouseEnter={() => {
                                            setContent(
                                                <ToolTipContent
                                                    data={kebeleData}
                                                    geo={geo.properties}
                                                />
                                            );
                                        }}
                                        onMouseLeave={() => {
                                            setContent("");
                                        }}
                                        onClick={() => {
                                            curr && onMapClick(geo);
                                        }}
                                        cursor={curr ? "pointer" : ""}
                                        style={{
                                            default: {
                                                fill: active
                                                    ? "green"
                                                    : fillColor(
                                                          curr
                                                              ? kebeleData.length
                                                              : 0
                                                      ),
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
                    {showMarkerOnFirstFilterValues.includes(firstFilter) &&
                        filterData &&
                        filterData.map((item, index) => {
                            const { latitude, longitude, lat, lot } = latlong;
                            let coordinates = [];
                            if (latitude && longitude) {
                                coordinates = [item[longitude], item[latitude]];
                            }
                            if (lat && lot) {
                                coordinates = [item[lot], item[lat]];
                            }
                            let fill = "#F00";
                            if (firstFilter === "wp") {
                                const colors = marker?.color;
                                colors &&
                                    colors.forEach(
                                        ({
                                            action,
                                            type,
                                            column,
                                            value,
                                            color,
                                        }) => {
                                            const nullValue =
                                                type === "string"
                                                    ? ""
                                                    : type === "number"
                                                    ? 0
                                                    : null;
                                            if (action === "select") {
                                                const matchValue = value
                                                    ? value.toLowerCase()
                                                    : nullValue;
                                                if (
                                                    item?.[
                                                        column
                                                    ]?.toLowerCase() ===
                                                    matchValue
                                                ) {
                                                    fill = color;
                                                }
                                            }
                                        }
                                    );
                            }
                            return (
                                <Marker key={index} coordinates={coordinates}>
                                    <circle
                                        r={
                                            position.zoom < 3.5
                                                ? 2
                                                : position.zoom * 0.5
                                        }
                                        fill={fill}
                                        stroke="#fff"
                                        strokeWidth={0.3}
                                        onClick={() => onMarkerClick(item)}
                                        onMouseEnter={() =>
                                            setContent(
                                                <ToolTipMarker
                                                    item={item}
                                                    config={state.config}
                                                    firstFilter={firstFilter}
                                                />
                                            )
                                        }
                                        onMouseLeave={() => setContent("")}
                                        cursor="pointer"
                                    />
                                </Marker>
                            );
                        })}
                </ZoomableGroup>
            </ComposableMap>
            <ReactTooltip type="light" className="tooltip-container">
                {content}
            </ReactTooltip>
        </div>
    );
}

export default Map;
