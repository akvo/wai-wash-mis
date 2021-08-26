import React, { useState, useEffect, useRef } from "react";
import {
    Col,
    Menu,
    Row,
    Divider,
    Table,
    Tag,
    Modal,
    Typography,
    Button,
} from "antd";
import DetailPoint from "../../components/detail-point";
import camelCase from "lodash/camelCase";
import sortBy from "lodash/sortBy";
import reverse from "lodash/reverse";

import Map from "../../components/maps";

import { UIStore } from "../../store";
import { invert, sumBy } from "lodash";

const { Title, Text } = Typography;

function CommunityLead() {
    const store = UIStore.useState();
    const { level2, clts } = store;
    const { data, config } = clts;
    const { main: mainConfig } = config;

    let firstDataSource = level2
        ? data.map((x) => {
              if (level2 === x?.[config.locations.level2]?.toLowerCase()) {
                  return { ...x, hidden: false };
              }
              return { ...x, hidden: true };
          })
        : data.map((x) => ({ ...x, hidden: false }));
    firstDataSource = firstDataSource.filter((x) => !x.hidden);
    firstDataSource = firstDataSource.map((x, i) => {
        let res = {
            key: i,
            name: `${x[mainConfig.key]}, ${x[config.locations.level2]}`,
        };
        mainConfig.indicators.forEach((i) => {
            const indicator = camelCase(i.name);
            res = {
                ...res,
                [indicator]: x[i.key],
            };
        });
        return { ...res };
    });
    firstDataSource = reverse(sortBy(firstDataSource, ["value"]));

    const indicators = mainConfig.indicators.map((x) => ({
        title: x.name,
        dataIndex: camelCase(x.name),
        key: camelCase(x.name),
        width: `${70 / mainConfig.indicators.length}%`,
        align: "center",
    }));

    indicators.unshift(indicators.pop());

    const openModal = (dt, r) => {
        const dtinit = [
            {
                key: "triggered",
                data: "Number of Communities Triggered",
                value: null,
            },
            {
                key: "verified",
                data: "Number of Communities Verified ODF",
                value: null,
            },
            {
                key: "declared",
                data: "Number of Communities Declared ODF",
                value: null,
            },
            {
                key: "Initial Number Latrines",
                data: "Number of Latrines (Initial)",
                value: null,
            },
            {
                key: "Final Number of Latrines",
                data: "Number of Latrines (Final)",
                value: null,
            },
        ];
        const row = data.find((d) => d[config?.primary_key] === r?.id);
        const ci = invert(config);
        const ds = dtinit.map((s) => ({
            ...s,
            value: ci?.[s.key] === undefined ? 0 : row?.[ci?.[s.key]] || 0,
        }));
        Modal.info({
            icon: "",
            title: dt,
            content: (
                <Table columns={sColumns} dataSource={ds} pagination={false} />
            ),
        });
    };

    const firstColumns = [
        {
            title: mainConfig.name,
            dataIndex: "name",
            width: "30%",
            key: "name",
            visible: false,
            render: (dt, r) => {
                return (
                    <Button type="link" onClick={() => openModal(dt, r)}>
                        {dt}
                    </Button>
                );
            },
        },
        ...indicators,
    ].filter((c) => c.dataIndex !== "id");

    const sColumns = [
        {
            title: "Data",
            dataIndex: "data",
            key: "dt",
        },
        {
            title: "Value",
            dataIndex: "value",
            key: "val",
        },
    ];

    const vCols = [
        {
            title: "Woreda Level Visualization",
            dataIndex: "level",
            key: "level",
        },
        {
            title: "Total Number",
            dataIndex: "total",
            key: "total",
        },
        {
            title: "% of Total Triggered",
            dataIndex: "percentage",
            key: "percentage",
        },
        {
            title: "Average Time from Triggered (Days)",
            dataIndex: "mean",
            key: "mean",
        },
    ];
    let vSource = [
        "Communities Triggered in Woreda X",
        "Communities Verified",
        "Communities Declared ODF",
    ].map((v, i) => {
        const status = config?.charts[0]?.value[i]?.toLowerCase();
        const total = firstDataSource
            ?.map((d) => d.odfStatus.toLowerCase())
            ?.filter((d) => d === status)?.length;
        return {
            key: i,
            level: v,
            total: total,
            percentage: 0,
            mean: "N/A",
        };
    });
    vSource = [
        ...vSource?.map((s) => ({
            ...s,
            percentage: (s.total / sumBy(vSource, "total")) * 100,
            mean:
                s.total > 0
                    ? (
                          sumBy(firstDataSource, "timeDeltaDays") / s.total
                      ).toFixed(2)
                    : "N/A",
        })),
    ];
    return (
        <Row>
            <Col span="24">
                <Title level={4}>Community Led Total Sanitation</Title>
                <Text>
                    # of communities declared/# of communities in program for
                    each kebele
                </Text>
                <Table
                    columns={vCols}
                    dataSource={vSource}
                    bordered
                    pagination={false}
                />
                <div className="table-container">
                    <Title level={4}>Full Data Table</Title>
                    <Divider />
                    <Table
                        columns={firstColumns}
                        dataSource={firstDataSource}
                        size="small"
                        bordered={true}
                    />
                </div>
            </Col>
        </Row>
    );
}

export default CommunityLead;
