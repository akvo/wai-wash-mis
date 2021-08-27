import React, { useState, useEffect, useRef } from "react";
import { Col, Row, Table, Tag, Divider, Drawer } from "antd";
import Map from "../../components/maps";
import DetailPoint from "../../components/detail-point";
import { jmpColors } from "../../utils/jmp_color";
import camelCase from "lodash/camelCase";
import sortBy from "lodash/sortBy";

import { UIStore } from "../../store";

const HealthFacilities = ({ geoUrl }) => {
    const store = UIStore.useState();
    const { level2, level1, health, markerDetail } = store;
    const { data, config } = health;
    const { main: mainConfig } = config;

    let firstDataSource = level1
        ? data.filter(
              (x) => level1 === x?.[config.locations.level1]?.toLowerCase()
          )
        : data;
    if (level2) {
        firstDataSource = firstDataSource.map((x) => {
            if (level2 === x?.[config.locations.level2]?.toLowerCase()) {
                return { ...x, opacity: "100%" };
            }
            return { ...x, opacity: "20%" };
        });
    }
    firstDataSource = firstDataSource.map((x, i) => {
        let res = {
            key: i,
            name: `${x[mainConfig.key]}, ${x[config.locations.level2]}`,
            opacity: x.opacity,
        };
        let values = 0;
        mainConfig.indicators.forEach((i) => {
            const indicator = camelCase(i.name);
            const ivalues = x[i.key]?.replaceAll(" ", "").toLowerCase();
            if (ivalues === "basic") {
                values = values + 1;
            }
            if (ivalues === "limited") {
                values = values + 3;
            }
            if (ivalues === "noservice") {
                values = values + 10;
            }
            res = {
                ...res,
                [indicator]: x[i.key],
            };
        });
        return { ...res, value: values };
    });

    firstDataSource = sortBy(firstDataSource, "value");

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
                    style: {
                        background: jmpColors.facilities[color],
                        opacity: i.opacity,
                    },
                },
                children: (
                    <Tag color={jmpColors.facilities[color]} key={i}>
                        {dt.toUpperCase()}
                    </Tag>
                ),
            };
        },
    }));

    const firstColumns = [
        {
            title: mainConfig.name,
            dataIndex: "name",
            width: "20%",
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
                <div className="table-container">
                    <Drawer
                        width={640}
                        placement="right"
                        visible={markerDetail.active}
                        onClose={() =>
                            UIStore.update((e) => {
                                e.markerDetail = {
                                    ...e.markerDetail,
                                    active: false,
                                    data: {},
                                };
                            })
                        }
                    >
                        <DetailPoint
                            markerDetail={markerDetail}
                            config={config}
                            name={mainConfig.key}
                        />
                    </Drawer>
                    <Table
                        size="small"
                        dataSource={firstDataSource}
                        columns={firstColumns}
                        pagination={false}
                        bordered={true}
                        scroll={{ y: 800 }}
                    />
                </div>
            </Col>
        </Row>
    );
};

export default HealthFacilities;
