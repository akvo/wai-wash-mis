import React from "react";
import capitalize from "lodash/capitalize";
import { Table, Divider } from "antd";

const DetailPoint = ({ markerDetail, config, name }) => {
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

    if (markerDetail.active) {
        Object.keys(markerDetail.data).forEach((x, i) => {
            const d = capitalize(config[x].replaceAll("_", " "));
            if (x === name) {
                name = markerDetail.data[x];
            }
            dataSource.push({
                key: i,
                data: d
                    .replace("Woreda", "District")
                    .replace("Kebele", "Sub-County"),
                value:
                    markerDetail.data[x] !== "" ? markerDetail.data[x] : " - ",
            });
        });

        return (
            <>
                <h4>{name}</h4>
                <Divider />
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    pagination={false}
                    bordered={true}
                />
                <Divider />
            </>
        );
    }
    return "";
};

export default DetailPoint;
