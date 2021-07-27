import React from "react";
import capitalize from "lodash/capitalize";
import { Table, Divider, Collapse, Typography } from "antd";

const { Panel } = Collapse;
const { Text } = Typography;

const DetailPointWaterPoint = ({
    markerDetail,
    config,
    name,
    reservoir,
    reservoirConfig,
    taps,
    tapsConfig
}) => {
    const columns = [
        {
            title: "Data",
            dataIndex: "data",
            width: "50%",
            key: "data",
        },
        {
            title: "Value",
            dataIndex: "value",
            key: "value",
            width: "50%",
        },
    ];

    const renderMoreDetail = (data, config, columns) => {
        if (data.length === 0) {
            return <Text type="secondary">No Data</Text>
        }
        return (
            <Collapse accordion>
                {
                    data.map((r, ri) => {
                        let source = [];
                        const name = config?.names
                                        ? config.names.map(n => r[n]).join(" - ")
                                        : "No name";
                        const fk = r?.[config.foreign_key];
                        Object.keys(r).forEach((x, i) => {
                            const d = capitalize(config[x].replaceAll("_", " "));
                            source.push({
                                key: `${fk}-${ri}-${i}`,
                                data: d,
                                value: r[x] !== "" ? r[x] : " - ",
                            });
                        });
                        return (
                            <Panel header={name} key={fk + "-" + ri}>
                                <Table
                                    dataSource={source}
                                    size="small"
                                    columns={columns}
                                    pagination={false}
                                    bordered={true}
                                />
                            </Panel>
                        )
                    })
                }
            </Collapse>
        );
    };

    let dataSource = [];
    if (markerDetail.active) {
        Object.keys(markerDetail.data).forEach((x, i) => {
            const d = capitalize(config[x].replaceAll("_", " "));
            if (x === name) {
                name = markerDetail.data[x];
            }
            dataSource.push({
                key: `wp-${i}`,
                data: d,
                value:
                    markerDetail.data[x] !== "" ? markerDetail.data[x] : " - ",
            });
        });

        return (
            <div className="detail-point">
                <h4>{name}</h4>
                <Divider />
                <Collapse accordion>
                    <Panel header="General" key="1">
                        <Table
                            dataSource={dataSource}
                            size="small"
                            columns={columns}
                            pagination={false}
                            bordered={true}
                        />
                    </Panel>
                    <Panel header="Reservoir Details" key="2">
                        {renderMoreDetail(reservoir, reservoirConfig, columns)}
                    </Panel>
                    <Panel header="Tap Details" key="3">
                        {renderMoreDetail(taps, tapsConfig, columns)}
                    </Panel>
                </Collapse>
            </div>
        );
    }
    return "";
};

export default DetailPointWaterPoint;
