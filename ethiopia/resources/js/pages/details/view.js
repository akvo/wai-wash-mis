import React, { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { Col, Layout, Menu, Row, Affix, Spin, Divider, Table } from "antd";
import { LoadingOutlined, ReadOutlined } from "@ant-design/icons";

import { HeaderDetail } from "../../components/header";
import Map from "./maps";
import { jmpColors } from "../../utils/jmp_color";

import { UIStore } from "../../store";

import groupBy from "lodash/groupBy";
import flatten from "lodash/flatten";

import "./styles.scss";

const { Content } = Layout;

const generateChartOptions = (
    config,
    data,
    locations,
    kebeleKey,
    firstFilter,
    kebele
) => {
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
                left: "3%",
                right: "4%",
                bottom: "3%",
                containLabel: true,
            },
            yAxis: {
                type: "category",
                data: locations,
            },
            xAxis: {
                type: "value",
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
            const dataByLocation = locations.map((loc) => {
                const val = topic.values.filter((x) => x[kebeleKey] === loc);
                let res = { name: loc, value: val.length };
                if (kebele && kebele !== loc.toLowerCase()) {
                    res = {
                        ...res,
                        itemStyle: {
                            opacity: 0.25,
                        },
                    };
                }
                return res;
            });
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

function Detail() {
    const store = UIStore.useState();
    const { woreda, kebele, state, firstFilter, secondFilter } = store;
    const [chartOptions, setChartOptions] = useState();
    const [geoUrl, setGeoUrl] = useState();
    const [table, setTable] = useState();
    const chartsRef = useRef([]);

    useEffect(() => {
        fetch("/data/eth-filtered.topo.json")
            .then((res) => res.json())
            .then((res) => setGeoUrl(res));

        const { data, config } = state;
        const woredaKey = config.locations.woreda;
        const kebeleKey = config.locations.kebele;

        let filterData = data;
        // generate charts
        const locations = Object.keys(groupBy(filterData, kebeleKey));
        const options = generateChartOptions(
            config,
            filterData,
            locations,
            kebeleKey,
            firstFilter,
            kebele
        );
        secondFilter !== "all" &&
            setChartOptions(
                options.filter((x) =>
                    x.name.toLowerCase().includes(secondFilter.toLowerCase())
                )
            );
        secondFilter === "all" && setChartOptions(options);

        // generate table when selected
        let tableConfig = null;
        if (kebele) {
            // filter data by woreda
            if (woreda) {
                filterData = filterData.filter(
                    (x) => x[woredaKey].toLowerCase() === woreda.toLowerCase()
                );
            }

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
            secondFilter !== "all" &&
                setTable(
                    tableConfig.filter((x) =>
                        x.name
                            .toLowerCase()
                            .includes(secondFilter.toLowerCase())
                    )
                );
            secondFilter === "all" && setTable(tableConfig);
        }

        UIStore.update((e) => {
            e.state = {
                ...state,
                charts: options,
                tables: tableConfig,
            };
        });
    }, [firstFilter, secondFilter, woreda, kebele]);

    const handleFirstFilterClick = (cur) => {
        setChartOptions([]);
        setTable([]);
        UIStore.update((e) => {
            e.firstFilter = cur.key;
            e.state = {
                data: store[cur.key].data,
                config: store[cur.key].config,
                charts: null,
                tables: null,
            };
        });
    };

    const onChartsClick = (e, index) => {
        const echartInstance = chartsRef.current[index].getEchartsInstance();
        // const base64 = echartInstance.getDataURL();
        let zoomSize = 6;
        const option = chartOptions[index].option;
        // echartInstance.dispatchAction({
        //     type: "dataZoom", // seriesIndex: e.seriesIndex,
        //     startValue:
        //         option["yAxis"].data[Math.max(e.dataIndex - zoomSize / 2, 0)],
        //     endValue:
        //         option["yAxis"].data[
        //             Math.max(
        //                 e.dataIndex + zoomSize / 2,
        //                 option.series[0].data.length - 1
        //             )
        //         ],
        // });
    };

    return (
        <div id="details">
            <HeaderDetail />
            <Affix offsetTop={0}>
                <Menu
                    selectedKeys={[firstFilter]}
                    onClick={(cur) => handleFirstFilterClick(cur)}
                    mode="horizontal"
                    className="first-filter"
                    style={{
                        backgroundColor: "#F9F9F9",
                    }}
                >
                    <Menu.Item key="hh">Households</Menu.Item>
                    <Menu.Item key="school">Schools</Menu.Item>
                    <Menu.Item key="health">Health Facilities</Menu.Item>
                </Menu>
            </Affix>
            <Content className="content-container">
                <Row>
                    <Col span="24">
                        {!geoUrl ? (
                            <div className="loading-container">
                                <Spin
                                    indicator={
                                        <LoadingOutlined
                                            style={{ fontSize: 24 }}
                                            spin
                                        />
                                    }
                                />
                            </div>
                        ) : (
                            <div>
                                <Menu
                                    selectedKeys={[secondFilter]}
                                    onClick={(cur) =>
                                        UIStore.update((e) => {
                                            e.secondFilter = cur.key;
                                        })
                                    }
                                    mode="horizontal"
                                    style={{ borderBottom: 0 }}
                                >
                                    <Menu.Item key="all">All</Menu.Item>
                                    <Menu.Item key="water">Water</Menu.Item>
                                    <Menu.Item key="sanitation">
                                        Sanitation
                                    </Menu.Item>
                                    <Menu.Item key="hygiene">Hygiene</Menu.Item>
                                </Menu>
                            </div>
                        )}
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
                                            click: (e) =>
                                                onChartsClick(e, index),
                                        }}
                                        style={{
                                            height: opt.option.series?.[0]?.data
                                                ? opt.option.series[0].data
                                                      .length * 30
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
            </Content>
        </div>
    );
}

export default Detail;
