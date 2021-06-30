import React, { useState, useEffect, useRef } from "react";
import { Layout, Menu, Affix, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { HeaderDetail } from "../../components/header";
import HouseholdSchoolHealth from "./hh-school-health";
import Clts from "./clts";
import WaterPoint from "./wp";

import { UIStore } from "../../store";

import "./styles.scss";

const { Content } = Layout;
const ContentLoading = () => (
    <div className="loading-container">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
    </div>
);

function Detail() {
    const store = UIStore.useState();
    const { firstFilter, secondFilter } = store;
    const [geoUrl, setGeoUrl] = useState();

    useEffect(() => {
        fetch("/data/ug-filtered.topo.json")
            .then((res) => res.json())
            .then((res) => setGeoUrl(res));
    }, []);

    const handleFirstFilterClick = (cur) => {
        UIStore.update((e) => {
            e.firstFilter = cur.key;
            e.state = {
                data: store[cur.key].data,
                config: store[cur.key].config,
                charts: null,
                tables: null,
            };
            e.markerDetail = {
                ...e.markerDetail,
                active: false,
                data: {},
            };
        });
    };

    const handleMenu = (cur) => {
        UIStore.update((e) => {
            e.secondFilter = cur.key;
            e.markerDetail = {
                ...e.markerDetail,
                active: false,
                data: {},
            };
        });
    };

    return (
        <div id="details">
            <HeaderDetail />
            <Affix offsetTop={0}>
                <Menu
                    selectedKeys={[firstFilter]}
                    onClick={(cur) => handleFirstFilterClick(cur)}
                    mode="horizontal"
                    className="first-filter"
                    style={{ backgroundColor: "#F9F9F9" }}
                >
                    <Menu.Item key="hh">Households</Menu.Item>
                    {/*
                    <Menu.Item key="school">Schools</Menu.Item>
                    */}
                    <Menu.Item key="health">Health Facilities</Menu.Item>
                    {/*
                    <Menu.Item key="clts">
                        Community Led Total Sanitation
                    </Menu.Item>
                    */}
                    <Menu.Item key="wp">Water Points</Menu.Item>
                </Menu>
            </Affix>
            <Content className="content-container">
                {!geoUrl && <ContentLoading />}
                {geoUrl &&
                    ["hh", "school", "health"].includes(
                        firstFilter.toLocaleLowerCase()
                    ) && (
                        <div>
                            <Menu
                                selectedKeys={[secondFilter]}
                                onClick={handleMenu}
                                mode="horizontal"
                                style={{ borderBottom: 0 }}
                            >
                                <Menu.Item key="all">All</Menu.Item>
                                <Menu.Item key="water">Water</Menu.Item>
                                <Menu.Item key="sanitation">
                                    Sanitation
                                </Menu.Item>
                                <Menu.Item key="hygiene">Hygiene</Menu.Item>
                            </Menu>
                        </div>
                    )}

                {geoUrl &&
                    ["hh", "school", "health"].includes(
                        firstFilter.toLocaleLowerCase()
                    ) && <HouseholdSchoolHealth geoUrl={geoUrl} />}

                {geoUrl && firstFilter.toLocaleLowerCase() === "clts" && (
                    <Clts geoUrl={geoUrl} />
                )}

                {geoUrl && firstFilter.toLocaleLowerCase() === "wp" && (
                    <WaterPoint geoUrl={geoUrl} />
                )}
            </Content>
        </div>
    );
}

export default Detail;
