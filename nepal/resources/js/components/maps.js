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
import uniq from "lodash/uniq";
import { scaleQuantize } from "d3-scale";
import { filter } from "lodash";

const mapMaxZoom = 4;
const defCenter = ["81.73551085", "28.42744314"];
const colorRange = ["#bbedda", "#a7e1cb", "#92d5bd", "#7dcaaf", "#67bea1"];
const showMarkerOnFirstFilterValues = ["wp", "health", "school"];

const ToolTipContent = ({ data, geo, config }) => {
    // * commented if needed in the future
    /**
    const filterData = data.filter((x) =>
        x?.[config.locations.level2].toLowerCase() === geo.UNIT_NAME.toLowerCase()
    );
    const ward = uniq(filterData.map((x) => x[config.locations.level3]))
                    .sort(function(a, b) {
                        return a - b;
                    }).join(", ");
    */
    const { UNIT_NAME, UNIT_TYPE, WARD } = geo;
    return (
        <div className="map-tooltip">
            <h3>{UNIT_NAME}</h3>
            {
                WARD &&
                    <ul>
                        <li key="ward-number">
                            <span>Ward Number</span>
                            <b>{WARD}</b>
                        </li>
                    </ul>
            }
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
    const {
        state,
        level1,
        level2,
        level3,
        firstFilter,
        markerDetail,
    } = UIStore.useState();
    const level1Key = state?.config?.locations?.level1;
    const level2Key = state?.config?.locations?.level2;
    const level3Key = state?.config?.locations?.level3;
    const latlong = state?.config?.latlong;
    const marker = state?.config?.marker;
    const [filterData, setFilterData] = useState();
    const [content, setContent] = useState("");

    useEffect(() => {
        let filterData =
            state?.data &&
            state?.data.filter(
                (x) => x[level1Key].toLowerCase() === level1?.toLowerCase()
            );
        if (level2) {
            filterData = filterData.filter(
                (x) => x[level2Key].toLowerCase() === level2?.toLowerCase()
            );
        }
        if (level3) {
            filterData = filterData.filter((x) => x[level3Key] == level3);
        }
        setFilterData(filterData);
    }, [level1, level2, level3]);

    const domain = filterData
        ? Object.values(groupBy(filterData, level2Key)).reduce(
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
        const { UNIT_NAME, WARD } = geo.properties;
        UIStore.update((e) => {
            e.level2 = UNIT_NAME && UNIT_NAME.toLowerCase();
            e.level3 = WARD && WARD;
            e.markerDetail = {
                ...e.markerDetail,
                active: false,
                data: {},
            };
        });
    };

    const onMarkerClick = (data) => {
        UIStore.update((e) => {
            e.level2 = data[level2Key].toLowerCase();
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
                    filterZoomEvent={(evt) => {
                        return evt.type === "wheel" ? false : true;
                    }}
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
                                const name = geo.properties?.UNIT_NAME;
                                const ward = geo.properties?.WARD;
                                const level2Data =
                                    name && filterData &&
                                    filterData.filter(
                                        (x) =>
                                            x?.[level2Key] &&
                                            x[level2Key]
                                                .toString()
                                                .toLowerCase() ===
                                                name.toLowerCase()
                                    );
                                const curr =
                                    level2Data && level2Data.length > 0;
                                const active =
                                    level2 &&
                                    level2.toString().toLowerCase() ===
                                        name.toLowerCase() &&
                                    level3 && level3 == ward;
                                let enableMapOnClick = false;
                                if (level1) {
                                    enableMapOnClick = geo.properties?.DISTRICT.toLowerCase() === level1.toString().toLowerCase();
                                }
                                if (level2) {
                                    enableMapOnClick = name.toLowerCase() === level2.toString().toLowerCase();
                                }

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
                                                    data={level2Data}
                                                    geo={geo.properties}
                                                    config={state.config}
                                                />
                                            );
                                        }}
                                        onMouseLeave={() => {
                                            setContent("");
                                        }}
                                        onClick={() => {
                                            enableMapOnClick && onMapClick(geo);
                                        }}
                                        cursor={enableMapOnClick ? "pointer" : ""}
                                        style={{
                                            default: {
                                                fill: active
                                                    ? "green"
                                                    : fillColor(
                                                          curr
                                                              ? level2Data.length
                                                              : 0
                                                      ),
                                                outline: "none",
                                            },
                                            hover: {
                                                fill: "#FCF176",
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
                            let markerSize =
                                position.zoom < 3.5 ? 2 : position.zoom * 0.5;
                            let highlighted = false;
                            let selected = false;
                            selected = content?.props?.item?.A === item.A;
                            if (markerDetail.active) {
                                highlighted = item.A === markerDetail.data.A;
                            }
                            markerSize =
                                highlighted || selected
                                    ? markerSize * 2
                                    : markerSize;
                            return (
                                <Marker key={index} coordinates={coordinates}>
                                    <circle
                                        r={markerSize}
                                        fill={
                                            markerDetail.active
                                                ? highlighted
                                                    ? fill
                                                    : "#ddd"
                                                : fill
                                        }
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
            <ReactTooltip
                border={true}
                type="light"
                className="tooltip-container"
                borderColor="#ddd"
            >
                {content}
            </ReactTooltip>
        </div>
    );
}

export default Map;
