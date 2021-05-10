import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { Col, Layout, Menu, Row, Affix } from "antd";

import { HeaderDetail } from "../../components/header";

import { UIStore } from "../../store";

import groupBy from "lodash/groupBy";

import "./style.css";

const { Content } = Layout;

function Detail() {
    const store = UIStore.useState();
    const [test, setTest] = useState({});

    useEffect(() => {
        const { data, config } = store.hh;
        const locations = Object.keys(groupBy(data, "B"));
        const chartOptions = config.charts.map((item) => {
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
            return option;
        });
        setTest(chartOptions[0]);
    }, []);

    return (
        <div>
            <HeaderDetail />
            <Affix offsetTop={3}>
                <Menu
                    mode="horizontal"
                    style={{
                        backgroundColor: "#F9F9F9",
                        padding: "0px 100px",
                        marginTop: "60px",
                    }}
                >
                    <Menu.Item key="1">Households</Menu.Item>
                    <Menu.Item key="3">Schools</Menu.Item>
                    <Menu.Item key="2">Health Facilities</Menu.Item>
                </Menu>
            </Affix>
            <Content
                className="site-layout-background"
                style={{ padding: "20px 100px", marginTop: "60px" }}
            >
                <Row>
                    <Col span="24">
                        <div>
                            <Menu mode="horizontal" style={{ borderBottom: 0 }}>
                                <Menu.Item key="all">All</Menu.Item>
                                <Menu.Item key="water">Water</Menu.Item>
                                <Menu.Item key="sanitation">
                                    Sanitation
                                </Menu.Item>
                                <Menu.Item key="hygiene">Hygiene</Menu.Item>
                            </Menu>
                        </div>
                        {test && (
                            <ReactECharts
                                option={test}
                                style={{ height: "800px" }}
                            />
                        )}
                    </Col>
                </Row>
            </Content>
        </div>
    );
}

export default Detail;
