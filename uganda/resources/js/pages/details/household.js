import React, { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { Col, Menu, Row, Divider } from "antd";

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
};

const generateChartOptions = (config, data, kebeleKey, firstFilter, kebele) => {
    data = data.filter((x) => x[kebeleKey] !== "");
    const locations = Object.keys(groupBy(data, kebeleKey));
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
                const val = topic.values.filter((x) => x[kebeleKey] === loc);
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
