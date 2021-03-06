import React, { useState, useEffect, useRef } from "react";
import { Layout, Menu, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { HeaderDetail } from "../../components/header";
import HouseHold from "./household";
import Schools from "./schools";
import HealthFacilities from "./health-facilities";
import WaterPoint from "./waterpoint";
import CommunityLead from "./community-lead";

import { UIStore } from "../../store";

import "./styles.scss";
import Home from "../home/view";

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
        fetch("/data/eth-filtered.topo.json")
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
            <Menu
                selectedKeys={[firstFilter]}
                onClick={(cur) => handleFirstFilterClick(cur)}
                mode="horizontal"
                className="first-filter"
                style={{ backgroundColor: "#F9F9F9" }}
            >
                <Menu.Item key="home">Home</Menu.Item>
                <Menu.Item key="hh">Households</Menu.Item>
                <Menu.Item key="school">Schools</Menu.Item>
                <Menu.Item key="clts">Community Led Total Sanitation</Menu.Item>
                <Menu.Item key="health">Health Facilities</Menu.Item>
                <Menu.Item key="wp">Water Points</Menu.Item>
            </Menu>
            <Content className="content-container">
                {!geoUrl && <ContentLoading />}
                {geoUrl && firstFilter.toLocaleLowerCase() === "hh" && (
                    <HouseHold geoUrl={geoUrl} />
                )}

                {geoUrl && firstFilter.toLocaleLowerCase() === "school" && (
                    <Schools geoUrl={geoUrl} />
                )}

                {geoUrl && firstFilter.toLocaleLowerCase() === "health" && (
                    <HealthFacilities geoUrl={geoUrl} />
                )}

                {geoUrl && firstFilter.toLocaleLowerCase() === "wp" && (
                    <WaterPoint geoUrl={geoUrl} />
                )}
                {firstFilter.toLocaleLowerCase() === "clts" && (
                    <CommunityLead geoUrl={geoUrl} />
                )}
                {firstFilter.toLocaleLowerCase() === "home" && <Home />}
            </Content>
        </div>
    );
}

export default Detail;
