import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
} from "react-simple-maps";
import { Col, Layout, Menu, Row, Affix, Spin, Divider } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { HeaderDetail } from "../../components/header";

import { UIStore } from "../../store";

import groupBy from "lodash/groupBy";

import "./style.css";

const { Content } = Layout;

const generateChartOptions = (config, data, locations, kebele) => {
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
                const val = topic.values.filter((x) => x[kebele] === loc);
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

function Detail() {
    const store = UIStore.useState();
    const { woreda, state, firstFilter, secondFilter } = store;
    const [chartOptions, setChartOptions] = useState();
    const [geoUrl, setGeoUrl] = useState();

    useEffect(() => {
        fetch("/data/eth-filtered.topo.json")
            .then((res) => res.json())
            .then((res) => setGeoUrl(res));

        const { data, config } = state;
        const woredaKey = config.locations.woreda;
        const kebeleKey = config.locations.kebele;
        // const filterDataByWoreda = data.filter(
        //     (x) => x[woredaKey].toLowerCase() === woreda.toLowerCase()
        // );
        const filterDataByWoreda = data;
        const locations = Object.keys(groupBy(filterDataByWoreda, kebeleKey));
        const options = generateChartOptions(
            config,
            filterDataByWoreda,
            locations,
            kebeleKey
        );
        UIStore.update((e) => {
            e.state = {
                ...state,
                charts: options,
            };
        });
        setChartOptions(options);
    }, [firstFilter, woreda]);

    useEffect(() => {
        if (!state.charts) return;
        if (chartOptions && secondFilter === "all") {
            setChartOptions(state.charts);
        }
        if (chartOptions && secondFilter !== "all") {
            const filter = state.charts.filter((x) =>
                x.name.toLowerCase().includes(secondFilter.toLowerCase())
            );
            setChartOptions(filter);
        }
    }, [secondFilter]);

    const handleFirstFilterClick = (cur) => {
        setChartOptions([]);
        UIStore.update((e) => {
            e.firstFilter = cur.key;
            e.state = {
                data: store[cur.key].data,
                config: store[cur.key].config,
                charts: null,
            };
        });
    };

    return (
        <div>
            <HeaderDetail />
            <Affix offsetTop={0}>
                <Menu
                    selectedKeys={[firstFilter]}
                    onClick={(cur) => handleFirstFilterClick(cur)}
                    mode="horizontal"
                    style={{
                        backgroundColor: "#F9F9F9",
                        padding: "0px 175px",
                        marginTop: "64px",
                    }}
                >
                    <Menu.Item key="hh">Households</Menu.Item>
                    <Menu.Item key="school">Schools</Menu.Item>
                    <Menu.Item key="health">Health Facilities</Menu.Item>
                </Menu>
            </Affix>
            <Content
                className="site-layout-background"
                style={{ padding: "20px 175px" }}
            >
                <Row>
                    <Col span="24">
                        {!geoUrl ? (
                            <div
                                style={{
                                    paddingTop: "175px",
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
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
                            <div
                                key="maps"
                                style={{
                                    padding: "20px 0",
                                    margin: "25px 0",
                                    border: "1px solid black",
                                }}
                            >
                                <ComposableMap
                                    data-tip=""
                                    projection="geoEquirectangular"
                                    zoom={10}
                                    height={300}
                                    projectionConfig={{ scale: 22000 }}
                                >
                                    <ZoomableGroup
                                        center={["38.69590", "7.34350"]}
                                    >
                                        <Geographies geography={geoUrl}>
                                            {({ geographies }) =>
                                                geographies.map((geo) => {
                                                    return (
                                                        <Geography
                                                            key={geo.rsmKey}
                                                            geography={geo}
                                                            style={{
                                                                default: {
                                                                    fill:
                                                                        "#D6D6DA",
                                                                    outline:
                                                                        "none",
                                                                },
                                                                hover: {
                                                                    fill:
                                                                        "#F53",
                                                                    outline:
                                                                        "none",
                                                                },
                                                                pressed: {
                                                                    fill:
                                                                        "#E42",
                                                                    outline:
                                                                        "none",
                                                                },
                                                            }}
                                                        />
                                                    );
                                                })
                                            }
                                        </Geographies>
                                    </ZoomableGroup>
                                </ComposableMap>
                            </div>
                        )}
                        {geoUrl &&
                            chartOptions &&
                            chartOptions.map((opt) => (
                                <div
                                    key={opt.name}
                                    style={{
                                        padding: "20px 0",
                                        margin: "25px 0",
                                        border: "1px solid black",
                                        textAlign: "center",
                                    }}
                                >
                                    <h4>{opt.name}</h4>
                                    <Divider />
                                    <ReactECharts
                                        option={opt.option}
                                        style={{ height: "300px" }}
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
