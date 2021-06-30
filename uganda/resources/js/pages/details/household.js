import React, { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { Col, Menu, Row, Divider } from "antd";

import Map from "../../components/maps";
import DetailTable from "../../components/detail-table";

import { jmpColors } from "../../utils/jmp_color";
import { UIStore } from "../../store";

import groupBy from "lodash/groupBy";

const bestIndicators = ["safely managed", "advanced"];
const goodIndicators = ["safely managed", "advanced", "basic"];

const generateChartOptions = (config, data, kebeleKey, firstFilter, kebele) => {
    const locations = Object.keys(groupBy(data, kebeleKey));
    const options = config?.charts.map((item) => {
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
                name: `% of Households`,
                nameLocation: "middle",
                nameGap: 45,
                nameTextStyle: {
                    fontWeight: "bold",
                    fontSize: 14,
                },
            },
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
                stack: "data",
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
            return seriesData;
        });
        return { name: item.name, option: option };
    });
    return options;
};

const HouseHold = ({ geoUrl }) => {
    const store = UIStore.useState();
    const { woreda, kebele, state, firstFilter, secondFilter } = store;
    const [chartOptions, setChartOptions] = useState();
    const chartsRef = useRef([]);

    useEffect(() => {
        setChartOptions(null);
        const { data, config } = state;
        const woredaKey = config?.locations?.woreda;
        const kebeleKey = config?.locations?.kebele;

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
                {geoUrl && (
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
                <DetailTable />
            </Col>
        </Row>
    );
};

export default HouseHold;
