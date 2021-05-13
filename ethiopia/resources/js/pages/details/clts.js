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

function Clts({ geoUrl }) {
    const store = UIStore.useState();
    const { woreda, kebele, state, firstFilter, secondFilter } = store;
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
    }, [firstFilter, secondFilter, woreda, kebele]);

    const onChartsClick = (params, index) => {
        const echartInstance = chartsRef.current[index].getEchartsInstance();
        UIStore.update((e) => {
            e.kebele = params.data.name.toLowerCase();
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
            </Col>
        </Row>
    );
}

export default Clts;
