import React, { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { Col, Menu, Row, Divider, Table } from "antd";

import Map from "./maps";
import {
    generateChartOptions,
    generateTable,
    generateDetailTable,
} from "../../utils/charts";

import { UIStore } from "../../store";

function WaterPoint({ geoUrl }) {
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

        let woredaKey = "";
        let kebeleKey = "";
        if (config) {
            woredaKey = config?.locations?.woreda;
            kebeleKey = config?.locations?.kebele;
        }

        let filterData = data;
        // filter data by woreda
        if (woreda) {
            filterData =
                filterData &&
                filterData.filter(
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

export default WaterPoint;
