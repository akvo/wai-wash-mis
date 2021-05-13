import React, { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { Col, Menu, Row, Divider, Table } from "antd";

import Map from "./maps";
import { jmpColors } from "../../utils/jmp_color";

import { UIStore } from "../../store";

import groupBy from "lodash/groupBy";
import flatten from "lodash/flatten";

const bestIndicators = ["safely managed", "advanced"];
const goodIndicators = ["safely managed", "advanced", "basic"];

const generateChartOptions = (config, data, kebeleKey, firstFilter, kebele) => {
    const ff = {
        hh: "Households",
        school: "Schools",
        health: "Health Facilities",
    };
    const locations = Object.keys(groupBy(data, kebeleKey));
    const options = config.charts.map((item) => {
        let option = {
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow",
                },
            },
            legend: {
                data: item.value,
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
                name: `% of ${ff[firstFilter]} Per ${item.name}`,
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

        const jmpColor = jmpColors[firstFilter];
        const itemColors = jmpColor[item.name.split(" ")[0].toLowerCase()];

        const dataByTopic = item.value.map((val) => {
            const topic = data.filter((x) => x[item.key] === val);
            return {
                name: val,
                values: topic,
            };
        });
        const seriesData = dataByTopic.map((topic) => {
            const dataByLocation = locations
                .map((loc) => {
                    const val = topic.values.filter(
                        (x) => x[kebeleKey] === loc
                    );
                    const totalDataKebele = data.filter(
                        (x) => x[kebeleKey] === loc
                    );
                    const value =
                        val.length !== 0
                            ? (val.length / totalDataKebele.length) * 100
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
                    // #::TODO add sum value of 2 good indicator and sort the charts according to that
                    const sortBy = dataByTopic
                        .map((d) => {
                            if (goodIndicators.includes(d.name.toLowerCase())) {
                                const k = d.values.filter(
                                    (x) => x[kebeleKey] === loc
                                );
                                return k.length;
                            }
                            // put also best value to pretend the value with same total and have best indicator is better
                            if (bestIndicators.includes(d.name.toLowerCase())) {
                                const bk = d.values.filter(
                                    (x) => x[kebeleKey] === loc
                                );
                                return bk.length;
                            }
                            return 0;
                        })
                        .reduce((acc, cur) => acc + cur);
                    res = {
                        ...res,
                        sortBy: sortBy,
                    };
                    return res;
                })
                .sort((a, b) => a.sortBy - b.sortBy);
            const itemColor = itemColors.find(
                (c) => c.name.toLowerCase() === topic.name.toLowerCase()
            );
            const series = {
                name: topic.name,
                type: "bar",
                stack: "test",
                data: dataByLocation,
                itemStyle: {
                    color: itemColor?.color,
                },
            };
            // #::TODO Replace yAxis with sorted value
            option["yAxis"]["data"] = dataByLocation.map((x) => ({
                value: x.name,
                textStyle: { fontSize: 14 },
            }));
            option["series"] = [...option.series, series];
        });
        return { name: item.name, option: option };
    });
    return options;
};

const generateTable = (config, data, kebeleKey, kebele, firstFilter) => {
    const column = [
        {
            title: "Indicator",
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
    const { table } = config;
    const filterDataByKebele = data.filter(
        (x) => x[kebeleKey].toLowerCase() === kebele.toLowerCase()
    );
    let tmp = [];
    // for demographics
    tmp.push({
        name: "Demographics",
        column: column,
        data: [
            {
                indicator: "Demographics",
                option: null,
                value: null,
            },
            {
                indicator: "Population",
                option: "Total Population",
                value: "NA",
            },
            {
                indicator: "Topic",
                option:
                    firstFilter === "hh"
                        ? "Total Households"
                        : firstFilter === "school"
                        ? "Total Schools"
                        : "Total Health Facilities",
                value: "NA",
            },
            {
                indicator: "Adults",
                option: "Total Adults",
                value: "NA",
            },
            {
                indicator: "Childs",
                option: "Total Childrens",
                value: "NA",
            },
        ],
    });
    // end of static demographics
    const tableData = table.map((tb) => {
        const indicators = [];
        tb.indicators.forEach((ind) => {
            let dataByIndicator = groupBy(filterDataByKebele, ind);
            Object.values(dataByIndicator).length > 0 &&
                indicators.push({
                    indicator: config[ind],
                    option: null,
                    value: null,
                });
            dataByIndicator = Object.keys(dataByIndicator).map((key) => {
                let value =
                    (dataByIndicator[key].length / filterDataByKebele.length) *
                    100;
                value = Math.round((value + Number.EPSILON) * 100) / 100;
                return {
                    indicator: config[ind],
                    option: key,
                    value: `${value}%`,
                };
            });
            indicators.push(dataByIndicator);
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

function HouseholdSchoolHealth({ geoUrl }) {
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
        if (secondFilter !== "all") {
            options = options.filter((x) =>
                x.name.toLowerCase().includes(secondFilter.toLowerCase())
            );
        }
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
            if (secondFilter !== "all") {
                tableConfig = tableConfig.filter((x) =>
                    x.name.toLowerCase().includes(secondFilter.toLowerCase())
                );
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
    }, [firstFilter, secondFilter, woreda, kebele]);

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
                                    height: opt.option.series?.[0]?.data
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

export default HouseholdSchoolHealth;
