import React, { useState, useEffect, useRef } from "react";
import { Layout, Menu, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { HeaderDetail } from "../../components/header";
import HouseHold from "./household";
import Schools from "./schools";
import HealthFacilities from "./health-facilities";
import WaterPoint from "./waterpoint";

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
        fetch("/data/nep-filtered.topo.json")
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
                <Menu.Item key="hh">Households</Menu.Item>
                <Menu.Item key="school">Schools</Menu.Item>
                <Menu.Item key="health">Health Facilities</Menu.Item>
                <Menu.Item key="wp">Water Points</Menu.Item>
            </Menu>
            <Content className="content-container">
                {!geoUrl && <ContentLoading />}
                {geoUrl && ["hh"].includes(firstFilter.toLocaleLowerCase()) && (
                    <div>
                        <Menu
                            selectedKeys={[secondFilter]}
                            onClick={handleMenu}
                            mode="horizontal"
                            style={{ borderBottom: 0 }}
                        >
                            <Menu.Item key="all">All</Menu.Item>
                            <Menu.Item key="water">Water</Menu.Item>
                            <Menu.Item key="sanitation">Sanitation</Menu.Item>
                            <Menu.Item key="hygiene">Hygiene</Menu.Item>
                        </Menu>
                    </div>
                )}

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
            </Content>
        </div>
    );
}

export default Detail;
