import React from "react";
import capitalize from "lodash/capitalize";
import { Table, Divider, Collapse } from "antd";

const { Panel } = Collapse;

const DetailPointWaterPoint = ({
    markerDetail,
    config, name,
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

    let dataSource = [];
    let reservoirSource = [];
    let tapSource = [];
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

        reservoir.forEach((r, ri) => {
            Object.keys(r).forEach((x, i) => {
                const d = capitalize(reservoirConfig[x].replaceAll("_", " "));
                reservoirSource.push({
                    key: `wpr-${ri}-${i}`,
                    data: d,
                    value: r[x] !== "" ? r[x] : " - ",
                });
            });
        });

        taps.forEach((t, ti) => {
            Object.keys(t).forEach((x, i) => {
                const d = capitalize(tapsConfig[x].replaceAll("_", " "));
                tapSource.push({
                    key: `wpt-${ti}-${i}`,
                    data: d,
                    value: t[x] !== "" ? t[x] : " - ",
                });
            });
        });

        return (
            <div className="detail-point">
                <h4>{name}</h4>
                <Divider />
                <Collapse>
                    <Panel header="Water Point Data" key="1">
                        <Table
                            dataSource={dataSource}
                            size="small"
                            columns={columns}
                            pagination={false}
                            bordered={true}
                        />
                    </Panel>
                    <Panel header="Reservoir Data" key="2">
                        <Table
                            dataSource={reservoirSource}
                            size="small"
                            columns={columns}
                            pagination={false}
                            bordered={true}
                        />
                    </Panel>
                    <Panel header="Taps Data" key="3">
                        <Table
                            dataSource={tapSource}
                            size="small"
                            columns={columns}
                            pagination={false}
                            bordered={true}
                        />
                    </Panel>
                </Collapse>
            </div>
        );
    }
    return "";
};

export default DetailPointWaterPoint;
