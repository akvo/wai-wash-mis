import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { Col, Layout, Menu, Row, Affix, Spin, Divider, Table } from "antd";
import { LoadingOutlined, ReadOutlined } from "@ant-design/icons";

import { HeaderDetail } from "../../components/header";
import Map from "./maps";

import { UIStore } from "../../store";

import groupBy from "lodash/groupBy";
import flatten from "lodash/flatten";

import "./styles.scss";

const { Content } = Layout;

const generateChartOptions = (config, data, locations, kebeleKey) => {
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
            xAxis: {
                type: "category",
                data: locations,
            },
            yAxis: {
                type: "value",
            },
            series: [],
        };

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
                return val.length;
            });
            const series = {
                name: topic.name,
                type: "bar",
                stack: "test",
                data: dataByLocation,
            };
            option["series"] = [...option.series, series];
        });
        return { name: item.name, option: option };
    });
    return options;
};

const generateTable = (config, data, kebeleKey, kebele) => {
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
        return {
            name: tb.name,
            column: column,
            data: flatten(indicators).map((x, i) => {
                x.key = i;
                return x;
            }),
        };
    });
    return tableData;
};

function Detail() {
    const store = UIStore.useState();
    const { woreda, kebele, state, firstFilter, secondFilter } = store;
    const [chartOptions, setChartOptions] = useState();
    const [geoUrl, setGeoUrl] = useState();
    const [table, setTable] = useState();

    useEffect(() => {
        fetch("/data/eth-filtered.topo.json")
            .then((res) => res.json())
            .then((res) => setGeoUrl(res));

        const { data, config } = state;
        const woredaKey = config.locations.woreda;
        const kebeleKey = config.locations.kebele;

        // filter data by woreda
        let filterData = data;
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

        // generate charts
        const locations = Object.keys(groupBy(filterData, kebeleKey));
        const options = generateChartOptions(
            config,
            filterData,
            locations,
            kebeleKey
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
            tableConfig = generateTable(config, filterData, kebeleKey, kebele);
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
                            chartOptions.map((opt) => (
                                <div key={opt.name} className="chart-container">
                                    <h4>{opt.name}</h4>
                                    <Divider />
                                    <ReactECharts
                                        option={opt.option}
                                        style={{ height: "300px" }}
                                    />
                                </div>
                            ))}
                        {kebele &&
                            table &&
                            table.map((tb, index) => (
                                <div key={index} className="table-container">
                                    <h4 style={{ textTransform: "capitalize" }}>
                                        {tb.name}
                                    </h4>
                                    <Divider />
                                    <Table
                                        key={index}
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
