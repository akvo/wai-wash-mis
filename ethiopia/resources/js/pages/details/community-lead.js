import React from "react";
import { Col, Row, Divider, Table, Modal, Typography, Button } from "antd";
import camelCase from "lodash/camelCase";
import sortBy from "lodash/sortBy";
import reverse from "lodash/reverse";

import Map from "../../components/maps";

import { UIStore } from "../../store";
import { countBy, invert, sumBy } from "lodash";

const { Title, Text } = Typography;

const CommunityLead = ({ geoUrl }) => {
    const store = UIStore.useState();
    const { level1, level2, clts } = store;
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
    if (level1)
        firstDataSource = firstDataSource.filter(
            (d) => level1 === d?.[config.locations.level1]?.toLowerCase()
        );
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
        key: camelCase(x.name),
        title: x.name,
        width: 215,
        dataIndex: camelCase(x.name),
    }));

    indicators.unshift(indicators.pop());

    const handleCountStatus = (row, ci, status) => {
        const lData = data?.map((d) => {
            return Object.keys(d).reduce(
                (n, k) => ((n[k] = isNaN(d[k]) ? d[k]?.toLowerCase() : d), n),
                {}
            );
        });
        const amount = countBy(lData, (item) => {
            return (
                item?.[ci["Woreda"]] === row?.[ci["Woreda"]]?.toLowerCase() &&
                item?.[ci["ODF Status"]] === status
            );
        });
        return amount.true || 0;
    };

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
            value:
                ci?.[s.key] === undefined
                    ? handleCountStatus(row, ci, s.key)
                    : row?.[ci?.[s.key]] || 0,
        }));
        Modal.info({
            icon: "",
            title: `Summary Data of ${dt}`,
            content: (
                <>
                    <hr />
                    <Table
                        columns={sColumns}
                        dataSource={ds}
                        pagination={false}
                    />
                </>
            ),
        });
    };

    let firstColumns = [
        {
            title: mainConfig.name,
            dataIndex: "name",
            width: 275,
            key: "name",
            visible: false,
            fixed: "left",
            render: (dt, r) => {
                return (
                    <Button type="link" onClick={() => openModal(dt, r)}>
                        {dt}
                    </Button>
                );
            },
        },
        ...indicators,
    ].filter((c) => !["id", "kebele"].includes(c.dataIndex));
    const ordered = [
        "name",
        "odfStatus",
        "dateTriggered",
        "dateOfVerification",
        "progressTimeDays",
        "timeToCompleteDays",
        "implementingPartner",
        "remarks",
    ];
    firstColumns = firstColumns.sort((a, b) => {
        return ordered.indexOf(a.key) - ordered.indexOf(b.key);
    });

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
                          sumBy(firstDataSource, "progressTimeDays") / s.total
                      ).toFixed(2)
                    : "N/A",
        })),
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
                    <Title level={4}>Community Led Total Sanitation</Title>
                    <Divider />
                    <Text>
                        # of communities (declared) in program for each kebele
                    </Text>
                    <Table
                        columns={vCols}
                        dataSource={vSource}
                        bordered
                        pagination={false}
                    />
                </div>
                <div className="table-container">
                    <Title level={4}>Full Data Table</Title>
                    <Divider />
                    <Table
                        columns={firstColumns}
                        dataSource={firstDataSource}
                        size="small"
                        bordered={true}
                        pagination={false}
                        scroll={{ y: 500 }}
                    />
                </div>
            </Col>
        </Row>
    );
};

export default CommunityLead;
