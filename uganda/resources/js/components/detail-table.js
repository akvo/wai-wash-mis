import React, { useState, useEffect } from "react";
import groupBy from "lodash/groupBy";
import flatten from "lodash/flatten";
import { Divider, Table } from "antd";
import { UIStore } from "../store";

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
                option: "Total Households",
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

const DetailTable = () => {
    const store = UIStore.useState();
    const { woreda, kebele, state, firstFilter, secondFilter } = store;
    const [table, setTable] = useState();

    useEffect(() => {
        setTable(null);
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
            if (secondFilter !== "all") {
                tableConfig = tableConfig.filter((x) =>
                    x.name.toLowerCase().includes(secondFilter.toLowerCase())
                );
            }
            setTable(tableConfig);
        }

        UIStore.update((e) => {
            e.state = {
                ...state,
                tables: tableConfig,
            };
        });
    }, [firstFilter, secondFilter, woreda, kebele]);

    if (table && kebele) {
        return table.map((tb, index) => (
            <div key={"div-" + tb.name + index} className="table-container">
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
        ));
    }
    return "";
};

export default DetailTable;
