import React, { useEffect } from "react";
import { Col, Row, Card, Statistic } from "antd";
import { UIStore } from "../../store";

import "./styles.scss";

const wpSource = [
    {
        name: "School",
        column: "Water Supply Source",
        source: "school",
    },
    {
        name: "Household",
        column: "Main Source of Drinking Water",
        source: "hh",
    },
    {
        name: "Health Facilities",
        column: "Description of Water Supply in Health Facilities",
        source: "health",
    },
];

function Home() {
    const store = UIStore.useState();
    const { level1, level2 } = store;
    const wpData = wpSource.map((x) => {
        const config = store[x.source].config;
        const obj = Object.keys(config)
            .map((o) => {
                return { key: o, name: config[o] };
            })
            .find((o) => o.name === x.column);
        let data = store[x.source].data;
        if (level1)
            data = data.filter(
                (x) => level1 === x?.[config.locations.level1]?.toLowerCase()
            );
        if (level2)
            data = data.filter(
                (x) => level2 === x?.[config.locations.level2]?.toLowerCase()
            );
        data = data.map((d) => d[obj.key]);
        const res = data.reduce(
            (a, c) => ((a[c] = (a[c] || 0) + 1), a),
            Object.create(null)
        );
        return {
            ...x,
            types: Object.keys(res).map((o) => ({
                name: o !== "" ? o : "No Data",
                value: res[o],
            })),
        };
    });
    const wp = store.wp.data
        .filter((x) => {
            let include = true;
            if (level1) {
                include =
                    x[store.wp.config.locations.level1].toLowerCase() ===
                    level1.toLowerCase();
            }
            if (level2) {
                include =
                    x[store.wp.config.locations.level2].toLowerCase() ===
                    level2.toLowerCase();
            }
            return include;
        })
        .map((x) => {
            if (
                store.wp.config.main.select.value.includes(
                    x[store.wp.config.main.select.key]
                )
            ) {
                return "nf";
            }
            return "f";
        })
        .reduce((a, c) => ((a[c] = (a[c] || 0) + 1), a), Object.create(null));
    return (
        <div id="home" style={{ paddingTop: 20 }}>
            <Row gutter={16}>
                <Col span={24}>
                    <Card>
                        <Row>
                            <Col span={3}>
                                <img
                                    className="icons"
                                    src="/images/waterpoint.png"
                                />
                            </Col>
                            <Col span={21}>
                                <h3>Waterpoints</h3>
                                <hr />
                                <Row>
                                    <Col span={12}>
                                        <Statistic
                                            title="Functional Waterpoints"
                                            value={
                                                wp?.f && wp?.nf
                                                    ? (
                                                          (wp.f /
                                                              (wp.nf + wp.f)) *
                                                          100
                                                      ).toFixed(2)
                                                    : wp?.f
                                                    ? 100
                                                    : 0
                                            }
                                            suffix="%"
                                        />
                                        <p>{wp.f} Waterpoints</p>
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="Non-Functional Waterpoints"
                                            value={
                                                wp?.f && wp?.nf
                                                    ? (
                                                          (wp.nf /
                                                              (wp.nf + wp.f)) *
                                                          100
                                                      ).toFixed(2)
                                                    : wp?.nf
                                                    ? 100
                                                    : 0
                                            }
                                            suffix="%"
                                        />
                                        <p>{wp.nf} Waterpoints</p>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
            {wpData.map((x, i) => (
                <Row style={{ marginTop: "30px" }} key={i}>
                    <Col span={24}>
                        <Card title={x.name}>
                            {x.types.map((t, ti) => (
                                <Card.Grid key={ti}>
                                    <Statistic title={t.name} value={t.value} />
                                </Card.Grid>
                            ))}
                        </Card>
                    </Col>
                </Row>
            ))}
        </div>
    );
}

export default Home;
