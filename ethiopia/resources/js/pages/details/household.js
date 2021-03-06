import React, { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { Col, Menu, Row, Card, Divider } from "antd";

import Map from "../../components/maps";
import DetailTable from "../../components/detail-table";

import { jmpColors } from "../../utils/jmp_color";
import { UIStore } from "../../store";

import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";
import sumBy from "lodash/sumBy";
import camelCase from "lodash/camelCase";
import reverse from "lodash/reverse";

const indicatorRank = {
    safelyManaged: 15,
    basic: 10,
    limited: 1,
    unimproved: -1,
    surfaceWater: -2,
    openDefecation: -2,
    noFacility: -2,
    noService: -2,
};

const generateChartOptions = (
    config,
    data,
    level2Key,
    firstFilter,
    level2,
    level2List
) => {
    if (level2) data = data.filter((x) => x[level2Key] !== "");
    let locations = Object.keys(groupBy(data, level2Key));
    if (level2List.length)
        locations = locations.filter((l) => level2List.includes(l));
    const options = config?.charts.map((item) => {
        data = data.filter((x) => item.value.includes(x[item.key]));
        let option = {
            tooltip: {
                trigger: "axis",
                position: ["80%", "25%"],
                axisPointer: {
                    type: "shadow",
                },
                extraCssText: "text-align:left;",
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
                nameLocation: "middle",
                nameGap: 45,
                max: 100,
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
        let rankedTopic = [];
        const seriesData = dataByTopic.map((topic) => {
            const dataByLocation = locations.map((loc) => {
                const val = topic.values.filter(
                    (x) => String(x[level2Key]) === loc
                );
                const totalDatalevel2 = data.filter(
                    (x) => String(x[level2Key]) === String(loc)
                );
                const value =
                    val.length !== 0
                        ? (val.length / totalDatalevel2.length) * 100
                        : 0;
                let res = {
                    name: loc,
                    value: Math.round((value + Number.EPSILON) * 100) / 100,
                };
                if (level2 && String(level2) !== String(loc).toLowerCase()) {
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
                stack: "data",
                data: dataByLocation,
                itemStyle: {
                    color: itemColor?.color,
                },
            };

            const topicRank = indicatorRank[camelCase(topic.name)];
            if (topicRank) {
                sortBy(dataByLocation, "value").forEach((x, i) => {
                    rankedTopic.push({
                        name: x.name,
                        rank: topicRank * x.value,
                    });
                });
            }

            let collectedRank = groupBy(rankedTopic, "name");
            collectedRank = Object.keys(collectedRank).map((x) => {
                const val = sumBy(collectedRank[x], (o) => o.rank);
                return { name: x, rank: val };
            });
            collectedRank = reverse(sortBy(collectedRank, "rank"));
            option["yAxis"]["data"] = collectedRank.map((x) => ({
                value: x.name,
                textStyle: { fontSize: 14 },
            }));

            option["series"] = [...option.series, series];
            return seriesData;
        });

        const sortedLocation = option.yAxis.data.map((x) => x.value);
        option["series"] = option.series.map((x) => {
            let sortedValue = sortedLocation.map((l) => {
                return x.data.find((d) => d.name === l);
            });
            return {
                ...x,
                data: sortedValue,
            };
        });

        return { name: item.name, option: option };
    });
    return options;
};

const HouseHold = ({ geoUrl }) => {
    const store = UIStore.useState();
    const { level2, state, firstFilter, secondFilter, level2List } = store;
    const [chartOptions, setChartOptions] = useState();
    const chartsRef = useRef([]);

    useEffect(() => {
        setChartOptions(null);
        const { data, config } = state;
        const level2Key = config?.locations?.level2;

        let options = [];
        let filterData = data;
        options = generateChartOptions(
            config,
            filterData,
            level2Key,
            firstFilter,
            level2,
            level2List
        );
        setChartOptions(options);
    }, [firstFilter, secondFilter, level2List, level2]);

    const onChartsClick = (params, index) => {
        const echartInstance = chartsRef.current[index].getEchartsInstance();
        UIStore.update((e) => {
            e.level2 = String(params.data.name).toLowerCase();
            e.markerDetail = {
                ...e.markerDetail,
                active: false,
                data: {},
            };
        });
    };

    return (
        <Row>
            <Col span={12} className="map-block">
                {geoUrl && (
                    <div className="map-container">
                        <Map geoUrl={geoUrl} mapHeight={640} />
                    </div>
                )}
            </Col>
            <Col span={12} className="chart-block">
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
                                        ? opt.option.series[0].data.length * 35
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
