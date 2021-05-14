import groupBy from "lodash/groupBy";
import flatten from "lodash/flatten";
import uniq from "lodash/uniq";

const column = [
    {
        title: "Name",
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
        className: "value-column",
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

export const generateChartOptions = (
    config,
    data,
    kebeleKey,
    firstFilter,
    kebele
) => {
    const locations = Object.keys(groupBy(data, kebeleKey));
    const options = config.charts.map((item) => {
        let option = {
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow",
                },
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
                name:
                    item.action === "count"
                        ? `% of ${item.name}`
                        : item.action === "sum"
                        ? `Total ${item.name}`
                        : item.name,
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
        if (item?.value && item.value && item.type === "stack") {
            option["legend"] = {
                data: item.value,
            };
        }
        if (item.type === "stack") {
            const dataByTopic = item.value.map((val) => {
                const topic = data.filter((x) => x[item.column] === val);
                return {
                    name: val,
                    values: topic,
                };
            });
            const seriesData = dataByTopic.map((topic) => {
                const dataByLocation = locations.map((loc) => {
                    const totalDataKebele = data.filter(
                        (x) => x[kebeleKey] === loc
                    );

                    let val = topic.values.filter((x) => x[kebeleKey] === loc);
                    // #TODO:: filter with and value
                    if (
                        item?.and &&
                        item?.and_value &&
                        item.and_value === "not null"
                    ) {
                        val = val.filter((x) => {
                            if (typeof x[item.and] === "object") {
                                return x[item.and] !== null;
                            }
                            if (typeof x[item.and] === "string") {
                                return x[item.and] !== "";
                            }
                            return x;
                        });
                    }

                    let value = 0;
                    if (item?.action && item.action === "count") {
                        value =
                            val.length !== 0
                                ? (val.length / totalDataKebele.length) * 100
                                : 0;
                    }
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
                const series = {
                    name: topic.name,
                    type: "bar",
                    stack: "data",
                    data: dataByLocation,
                };
                option["series"] = [...option.series, series];
                return seriesData;
            });
        }

        if (item.type === "bar") {
            const seriesData = locations
                .map((loc) => {
                    const filterDataByKebele = data.filter(
                        (x) => x[kebeleKey] === loc
                    );

                    let filterDataByValue = filterDataByKebele;
                    if (
                        item?.value &&
                        !Array.isArray(item.value) &&
                        !item.value
                    ) {
                        filterDataByValue = filterDataByValue.filter(
                            (x) =>
                                x[item.column].toString().toLowerCase() ===
                                item.value.toLowerCase()
                        );
                    }
                    // #TODO:: filter with and value
                    if (
                        item?.and &&
                        item?.and_value &&
                        item.and_value === "not null"
                    ) {
                        filterDataByValue = filterDataByValue.filter((x) => {
                            if (typeof x[item.and] === "object") {
                                return x[item.and] !== null;
                            }
                            if (typeof x[item.and] === "string") {
                                return x[item.and] !== "";
                            }
                            return x;
                        });
                    }

                    let value = 0;
                    if (item?.action && item.action === "sum") {
                        value = filterDataByValue
                            .map((x) => x[item.column])
                            .reduce((acc, cur) => acc + cur);
                    }
                    if (item?.action && item.action === "percentage") {
                        value =
                            filterDataByValue.length > 0
                                ? (filterDataByValue.length /
                                      filterDataByKebele.length) *
                                  100
                                : 0;
                    }

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
                })
                .sort((a, b) => a.value - b.value);
            const series = {
                name: item.name,
                type: "bar",
                data: seriesData,
            };
            // #::TODO Replace yAxis with sorted value
            option["yAxis"]["data"] = seriesData.map((x) => ({
                value: x.name,
                textStyle: { fontSize: 14 },
            }));
            option["series"] = [...option.series, series];
        }
        return { name: item.name, option: option };
    });
    return options;
};

export const generateTable = (config, data, kebeleKey, kebele, firstFilter) => {
    const { table } = config;
    const filterDataByKebele = data.filter(
        (x) => x[kebeleKey].toLowerCase() === kebele.toLowerCase()
    );
    let tmp = [];
    let tableData = table.filter((x) => x.type === "summary");
    tableData = tableData.map((tb) => {
        const indicators = [];
        tb.indicators.forEach((ind) => {
            let value = "-";
            if (ind.action === "distinct") {
                value = filterDataByKebele.map((x) => x[ind.column]);
                value = uniq(value).join(", ");
            }
            if (ind.action === "group-count") {
                value = groupBy(filterDataByKebele, ind.column);
                value = Object.keys(value).length;
            }
            if (ind.action === "sum") {
                value = filterDataByKebele;
                if (ind?.and && ind?.and_value) {
                    value = value.filter(
                        (x) =>
                            x[ind.and].toString().toLowerCase() ===
                            ind.and_value.toLowerCase()
                    );
                }
                value = value.map((x) => x[ind.column]);
                value =
                    value.length === 0
                        ? 0
                        : value.reduce((acc, cur) => acc + cur);
            }
            if (ind.action === "percentage") {
                value = filterDataByKebele.filter(
                    (x) =>
                        x[ind.column].toLowerCase() === ind.value.toLowerCase()
                );
                if (
                    ind?.and &&
                    ind?.and_value &&
                    ind.and_value === "not null"
                ) {
                    value = value.filter((x) => {
                        if (typeof x[ind.and] === "object") {
                            return x[ind.and] !== null;
                        }
                        if (typeof x[ind.and] === "string") {
                            return x[ind.and] !== "";
                        }
                        return x;
                    });
                }
                value =
                    value.length > 0
                        ? (value.length / filterDataByKebele.length) * 100
                        : 0;
                value = Math.round((value + Number.EPSILON) * 100) / 100;
                value = `${value}%`;
            }
            indicators.push({
                indicator: ind.name,
                option: ind.name,
                value: value,
            });
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

export const generateDetailTable = (config, data) => {
    const { table, marker } = config;
    let tableData = table.filter((x) => x.type === "detail");
    let tmp = [];
    tableData = tableData.map((tb) => {
        const indicators = [];
        tb.indicators.forEach((ind) => {
            let value = "-";
            if (
                ind.action === "select" &&
                !ind.value &&
                ind.type === "number"
            ) {
                value = data[ind.column] === 0 ? value : data[ind.column];
            }
            if (
                ind.action === "select" &&
                !ind.value &&
                ind.type === "string"
            ) {
                value = data[ind.column] === "" ? value : data[ind.column];
            }
            if (ind.action === "select" && !ind.value && ind.type === "date") {
                if (data[ind.column] !== "") {
                    value = data[ind.column];
                    value = new Date(value);
                    value = value.toLocaleString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "2-digit",
                        day: "numeric",
                    });
                }
            }
            indicators.push({
                indicator: ind.name,
                option: ind.name,
                value: value,
            });
            return;
        });
        let com_name = null;
        if (marker && marker?.name) {
            com_name = data[marker.name];
        }
        const results = {
            name: com_name ? `${tb.name} - ${com_name}` : tb.name,
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
