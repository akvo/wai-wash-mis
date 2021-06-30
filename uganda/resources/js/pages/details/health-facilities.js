import React, { useState, useEffect, useRef } from "react";
import { Col, Row, Table, Tag } from "antd";
import Map from "../../components/maps";
import DetailTable from "../../components/detail-table";
import { jmpColors } from "../../utils/jmp_color";
import camelCase from "lodash/camelCase";
import sortBy from "lodash/sortBy";

import { UIStore } from "../../store";

const HealthFacilities = ({ geoUrl }) => {
    const store = UIStore.useState();
    const { kebele, health } = store;
    const { data, config, locations } = health;
    const { main: mainConfig } = config;
    let dataSource = kebele
        ? data.filter(
              (x) => kebele === x?.[config.locations.kebele]?.toLowerCase()
          )
        : data;
    dataSource = dataSource.map((x, i) => {
        let res = {
            key: i,
            name: `${x[mainConfig.key]}, ${x[config.locations.kebele]}`,
        };
        let values = 0;
        mainConfig.indicators.forEach((i) => {
            const indicator = camelCase(i.name);
            if (x[i.key] === "Basic") {
                values += 1;
            }
            if (x[i.key] === "Limited") {
                values += 3;
            }
            if (x[i.key] === "No Service") {
                values += 10;
            }
            res = {
                ...res,
                [indicator]: x[i.key],
            };
        });
        return { ...res, value: values };
    });

    dataSource = sortBy(dataSource, ["value"]);

    const indicators = mainConfig.indicators.map((x) => ({
        title: x.name,
        dataIndex: camelCase(x.name),
        key: camelCase(x.name),
        width: `${70 / mainConfig.indicators.length}%`,
        align: "center",
        render: (dt, i) => {
            let color = camelCase(dt);
            return {
                props: {
                    style: { background: jmpColors.facilities[color] },
                },
                children: (
                    <Tag color={jmpColors.facilities[color]} key={i}>
                        {dt.toUpperCase()}
                    </Tag>
                ),
            };
        },
    }));

    const columns = [
        {
            title: mainConfig.name,
            dataIndex: "name",
            width: "30%",
            key: "name",
        },
        ...indicators,
    ];

    return (
        <Row>
            <Col span="24">
                {geoUrl && (
                    <div key="maps" className="map-container">
                        <Map geoUrl={geoUrl} />
                    </div>
                )}
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    pagination={false}
                    bordered={true}
                />
                <DetailTable />
            </Col>
        </Row>
    );
};

export default HealthFacilities;
