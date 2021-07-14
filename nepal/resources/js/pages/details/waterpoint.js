import React, { useState, useEffect, useRef } from "react";
import { Col, Menu, Row, Divider, Table, Tag, Drawer } from "antd";
import DetailPoint from "../../components/detail-point";
import camelCase from "lodash/camelCase";
import sortBy from "lodash/sortBy";
import reverse from "lodash/reverse";

import Map from "../../components/maps";

import { UIStore } from "../../store";

function WaterPoint({ geoUrl }) {
    const store = UIStore.useState();
    const { kebele, wp, markerDetail } = store;
    const { data, config, locations } = wp;
    const { main: mainConfig } = config;

    let firstDataSource = data.filter(
        (x) => x[mainConfig.select.key] === mainConfig.select.value
    );

    firstDataSource = kebele
        ? firstDataSource.map((x) => {
              if (kebele === x?.[config.locations.kebele]?.toLowerCase()) {
                  return { ...x, hidden: false };
              }
              return { ...x, hidden: true };
          })
        : firstDataSource.map((x) => ({ ...x, hidden: false }));
    firstDataSource = firstDataSource.filter((x) => !x.hidden);
    firstDataSource = firstDataSource.map((x, i) => {
        let res = {
            key: i,
            name: `${x[mainConfig.key]}, ${x[config.locations.kebele]}`,
            opacity: x.opacity,
        };
        let values = 0;
        mainConfig.indicators.forEach((i) => {
            const indicator = camelCase(i.name);
            if (x[i.key] === "25-50") {
                values += 1;
            }
            if (x[i.key] === "50-100") {
                values += 5;
            }
            if (x[i.key] === "more than 100") {
                values += 10;
            }
            if (
                x[i.key] ===
                "Institutional use (school or healthcare facility/ health centre)"
            ) {
                values += 10;
            }
            if (x[i.key] === "Drinking water") {
                values += 10;
            }
            res = {
                ...res,
                [indicator]: x[i.key],
            };
        });
        return { ...res, value: values };
    });

    firstDataSource = reverse(sortBy(firstDataSource, ["value"]));

    const indicators = mainConfig.indicators.map((x) => ({
        title: x.name,
        dataIndex: camelCase(x.name),
        key: camelCase(x.name),
        width: `${70 / mainConfig.indicators.length}%`,
        align: "center",
        render: (dt, i) => {
            let color = "#000";
            let bg = "#fff";
            if (dt === "25-50") {
                bg = "#ffca29";
            }
            if (dt === "50-100") {
                bg = "#fa0";
            }
            if (dt === "more than 100") {
                bg = "#dc3545";
                color = "#fff";
            }
            if (
                dt ===
                "Institutional use (school or healthcare facility/ health centre)"
            ) {
                bg = "#dc3545";
                color = "#fff";
            }
            if (dt === "Drinking water") {
                bg = "#dc3545";
                color = "#fff";
            }
            return {
                props: {
                    style: { background: bg, color: color },
                },
                children: dt,
            };
        },
    }));

    const firstColumns = [
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
                <div className="table-container">
                    <h4>Non Functional Facilities</h4>
                    <Divider />
                    <Table
                        dataSource={firstDataSource}
                        columns={firstColumns}
                        size="small"
                        bordered={true}
                    />
                </div>
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
            </Col>
        </Row>
    );
}

export default WaterPoint;
