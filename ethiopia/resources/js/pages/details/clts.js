import React, { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { Col, Menu, Row, Divider, Table } from "antd";

import Map from "./maps";

import { UIStore } from "../../store";

import groupBy from "lodash/groupBy";
import flatten from "lodash/flatten";

const generateChartOptions = (config, data, kebeleKey, firstFilter, kebele) => {
    const locations = Object.keys(groupBy(data, kebeleKey));
    const options = config.charts.map((item) => {
        let option = {
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow",
                },
            },
            grid: {
                left: "7%",
                right: "7%",
                bottom: "10%",
                containLabel: true,
            },
            yAxis: {
                type: "category",
                data: locations.map((x) => ({
                    value: x,
                    textStyle: { fontSize: 14 },
                })),
            },
            xAxis: {
                type: "value",
                name: `% of ${item.name}`,
                nameLocation: "middle",
                nameGap: 45,
                nameTextStyle: {
                    fontWeight: "bold",
                    fontSize: 14,
                },
            },
            dataZoom: [
                {
                    type: "inside",
                },
            ],
            series: [],
        };
        const seriesData = locations
            .map((loc) => {
                const filterDataByKebele = data.filter(
                    (x) => x[kebeleKey] === loc
                );
                let filterDataByValue = filterDataByKebele.filter(
                    (x) =>
                        x[item.column].toString().toLowerCase() ===
                        item.value.toLowerCase()
                );
                // #TODO:: filter with and value
                if (
                    item?.and &&
                    item?.and_value &&
                    item.and_value === "not null"
                ) {
                    filterDataByValue = filterDataByValue.filter((x) => {
                        if (typeof x[item.and] === "object") {
                            return x[item.and] !== null;
                        }
                        if (typeof x[item.and] === "string") {
                            return x[item.and] !== "";
                        }
                        return x;
                    });
                }
                const value =
                    filterDataByValue.length > 0
                        ? (filterDataByValue.length /
                              filterDataByKebele.length) *
                          100
                        : 0;
                let res = {
                    name: loc,
                    value: Math.round((value + Number.EPSILON) * 100) / 100,
                };
                if (kebele && kebele !== loc.toLowerCase()) {
                    res = {
                        ...res,
                        itemStyle: {
                            opacity: 0.25,
                        },
                    };
                }
                return res;
            })
            .sort((a, b) => a.value - b.value);
        const series = {
            name: item.name,
            type: "bar",
            data: seriesData,
        };
        // #::TODO Replace yAxis with sorted value
        option["yAxis"]["data"] = seriesData.map((x) => ({
            value: x.name,
            textStyle: { fontSize: 14 },
        }));
        option["series"] = [...option.series, series];
        return { name: item.name, option: option };
    });
    return options;
};

const column = [
    {
        title: "Name",
        dataIndex: "indicator",
        key: "indicator",
        render: (text, row, index) => {
            if (!row.option && !row.value) {
                return {
                    children: <b>{text}</b>,
                    props: {
                        colSpan: 2,
                    },
                };
            }
            return <span style={{ marginLeft: "20px" }}>{row.option}</span>;
        },
    },
    {
        title: "Value",
        dataIndex: "value",
        className: "value-column",
        key: "value",
        render: (text, row, index) => {
            if (!row.option && !row.value) {
                return {
                    children: text,
                    props: {
                        colSpan: 0,
                    },
                };
            }
            return text;
        },
    },
];

const generateTable = (config, data, kebeleKey, kebele, firstFilter) => {
    const { table } = config;
    const filterDataByKebele = data.filter(
        (x) => x[kebeleKey].toLowerCase() === kebele.toLowerCase()
    );
    let tmp = [];
    let tableData = table.filter((x) => x.type === "summary");
    tableData = tableData.map((tb) => {
        const indicators = [];
        tb.indicators.forEach((ind) => {
            let value = "-";
            if (ind.action === "sum") {
                value = filterDataByKebele
                    .map((x) => x[ind.column])
                    .reduce((acc, cur) => acc + cur);
            }
            if (ind.action === "percentage") {
                value = filterDataByKebele.filter(
                    (x) =>
                        x[ind.column].toLowerCase() === ind.value.toLowerCase()
                );
                if (
                    ind?.and &&
                    ind?.and_value &&
                    ind.and_value === "not null"
                ) {
                    value = value.filter((x) => {
                        if (typeof x[ind.and] === "object") {
                            return x[ind.and] !== null;
                        }
                        if (typeof x[ind.and] === "string") {
                            return x[ind.and] !== "";
                        }
                        return x;
                    });
                }
                value =
                    value.length > 0
                        ? (value.length / filterDataByKebele.length) * 100
                        : 0;
                value = Math.round((value + Number.EPSILON) * 100) / 100;
                value = `${value}%`;
            }
            indicators.push({
                indicator: ind.name,
                option: ind.name,
                value: value,
            });
            return;
        });
        const results = {
            name: tb.name,
            column: column,
            data: flatten(indicators).map((x, i) => {
                x.key = i;
                return x;
            }),
        };
        tmp.push(results);
        return results;
    });
    return tmp;
};

const generateDetailTable = (config, data) => {
    const { table, marker } = config;
    let tableData = table.filter((x) => x.type === "detail");
    let tmp = [];
    tableData = tableData.map((tb) => {
        const indicators = [];
        tb.indicators.forEach((ind) => {
            let value = "-";
            if (ind.action === "select" && !ind.value) {
                value = data[ind.column];
            }
            if (ind.type === "date" && value !== "") {
                value = new Date(value);
                value = value.toLocaleString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "2-digit",
                    day: "numeric",
                });
            }
            indicators.push({
                indicator: ind.name,
                option: ind.name,
                value: value,
            });
            return;
        });
        let com_name = null;
        if (marker && marker?.name) {
            com_name = data[marker.name];
        }
        const results = {
            name: com_name ? `${tb.name} of ${com_name}` : tb.name,
            column: column,
            data: flatten(indicators).map((x, i) => {
                x.key = i;
                return x;
            }),
        };
        tmp.push(results);
        return results;
    });
    return tmp;
};

function Clts({ geoUrl }) {
    const store = UIStore.useState();
    const {
        woreda,
        kebele,
        state,
        firstFilter,
        secondFilter,
        markerDetail,
    } = store;
    const [chartOptions, setChartOptions] = useState();
    const [table, setTable] = useState();
    const chartsRef = useRef([]);

    useEffect(() => {
        setChartOptions(null);
        setTable(null);
        const { data, config } = state;
        const woredaKey = config.locations.woreda;
        const kebeleKey = config.locations.kebele;

        let filterData = data;
        // filter data by woreda
        if (woreda) {
            filterData = filterData.filter(
                (x) => x[woredaKey].toLowerCase() === woreda.toLowerCase()
            );
        }

        // generate charts
        let options = generateChartOptions(
            config,
            filterData,
            kebeleKey,
            firstFilter,
            kebele
        );
        setChartOptions(options);

        // generate table when selected
        let tableConfig = null;
        if (kebele) {
            // filter data by kebele
            if (kebele) {
                filterData = filterData.filter(
                    (x) => x[kebeleKey].toLowerCase() === kebele.toLowerCase()
                );
            }
            tableConfig = generateTable(
                config,
                filterData,
                kebeleKey,
                kebele,
                firstFilter
            );
            if (markerDetail.active) {
                const tableDetailConfig = generateDetailTable(
                    config,
                    markerDetail.data
                );
                tableConfig = [...tableConfig, ...tableDetailConfig];
            }
            setTable(tableConfig);
        }

        UIStore.update((e) => {
            e.state = {
                ...state,
                charts: options,
                tables: tableConfig,
            };
        });
    }, [firstFilter, secondFilter, woreda, kebele, markerDetail]);

    const onChartsClick = (params, index) => {
        const echartInstance = chartsRef.current[index].getEchartsInstance();
        UIStore.update((e) => {
            e.kebele = params.data.name.toLowerCase();
            e.markerDetail = {
                ...e.markerDetail,
                active: false,
                data: {},
            };
        });
    };

    return (
        <Row>
            <Col span="24">
                {geoUrl && chartOptions && (
                    <div key="maps" className="map-container">
                        <Map geoUrl={geoUrl} />
                    </div>
                )}
                {geoUrl &&
                    chartOptions &&
                    chartOptions.map((opt, index) => (
                        <div key={opt.name} className="chart-container">
                            <h4>{opt.name}</h4>
                            <Divider />
                            <ReactECharts
                                option={opt.option}
                                onEvents={{
                                    click: (e) => onChartsClick(e, index),
                                }}
                                style={{
                                    height: opt.option?.series?.[0]?.data
                                        ? opt.option.series[0].data.length * 30
                                        : 600,
                                }}
                                ref={(ref) => {
                                    chartsRef.current[index] = ref;
                                }}
                            />
                        </div>
                    ))}
                {kebele &&
                    table &&
                    table.map((tb, index) => (
                        <div
                            key={"div-" + tb.name + index}
                            className="table-container"
                        >
                            <h4
                                style={{
                                    textTransform: "capitalize",
                                }}
                            >
                                {tb.name}
                            </h4>
                            <Divider />
                            <Table
                                size="small"
                                showHeader={false}
                                pagination={false}
                                dataSource={tb.data}
                                columns={tb.column}
                            />
                        </div>
                    ))}
            </Col>
        </Row>
    );
}

export default Clts;
