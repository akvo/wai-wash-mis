import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
} from "react-simple-maps";
import { Col, Layout, Menu, Row, Affix } from "antd";
import PropTypes from "prop-types";

import { HeaderDetail } from "../../components/header";

import { UIStore } from "../../store";

import groupBy from "lodash/groupBy";

import "./style.css";

const { Content } = Layout;

function Detail() {
    const { hh, firstFilter, secondFilter } = UIStore.useState();
    const [chartOptions, setChartOptions] = useState();
    const [geoUrl, setGeoUrl] = useState();

    useEffect(() => {
        fetch("http://localhost:8000/data/eth-filtered.topo.json")
            .then((res) => res.json())
            .then((res) => setGeoUrl(res));
        const { data, config } = hh;
        const locations = Object.keys(groupBy(data, "B"));
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
                    const val = topic.values.filter((x) => x["B"] === loc);
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
        setChartOptions(options);
    }, []);

    return (
        <div>
            <HeaderDetail />
            <Affix offsetTop={0}>
                <Menu
                    selectedKeys={[firstFilter]}
                    onClick={(cur) =>
                        UIStore.update((e) => {
                            e.firstFilter = cur.key;
                        })
                    }
                    mode="horizontal"
                    style={{
                        backgroundColor: "#F9F9F9",
                        padding: "0px 100px",
                        marginTop: "64px",
                    }}
                >
                    <Menu.Item key="households">Households</Menu.Item>
                    <Menu.Item key="schools">Schools</Menu.Item>
                    <Menu.Item key="health-facilities">
                        Health Facilities
                    </Menu.Item>
                </Menu>
            </Affix>
            <Content
                className="site-layout-background"
                style={{ padding: "20px 100px" }}
            >
                <Row>
                    <Col span="24">
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
                        {geoUrl && (
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
                                    zoom={12}
                                    height={400}
                                    projectionConfig={{ scale: 30000 }}
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
                                    }}
                                >
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
