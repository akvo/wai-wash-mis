import React, { useState, useEffect, useRef } from "react";
import { Layout, Menu, Affix, Spin } from "antd";
import { LoadingOutlined, ReadOutlined } from "@ant-design/icons";

import { HeaderDetail } from "../../components/header";
import HouseholdSchoolHealth from "./hh-school-health";

import { UIStore } from "../../store";

import "./styles.scss";

const { Content } = Layout;

function Detail() {
    const store = UIStore.useState();
    const { firstFilter } = store;

    const handleFirstFilterClick = (cur) => {
        UIStore.update((e) => {
            e.firstFilter = cur.key;
            e.state = {
                data: store[cur.key].data,
                config: store[cur.key].config,
                charts: null,
                tables: null,
            };
        });
    };

    console.log(firstFilter);

    return (
        <div id="details">
            <HeaderDetail />
            <Affix offsetTop={0}>
                <Menu
                    selectedKeys={[firstFilter]}
                    onClick={(cur) => handleFirstFilterClick(cur)}
                    mode="horizontal"
                    className="first-filter"
                    style={{
                        backgroundColor: "#F9F9F9",
                    }}
                >
                    <Menu.Item key="hh">Households</Menu.Item>
                    <Menu.Item key="school">Schools</Menu.Item>
                    <Menu.Item key="health">Health Facilities</Menu.Item>
                    <Menu.Item key="clts">
                        Community Led Total Sanitation
                    </Menu.Item>
                </Menu>
            </Affix>
            <Content className="content-container">
                {["clts"].includes(firstFilter.toLocaleLowerCase()) && (
                    <h1>CLTS Page</h1>
                )}

                {["hh", "school", "health"].includes(
                    firstFilter.toLocaleLowerCase()
                ) && <HouseholdSchoolHealth />}
            </Content>
        </div>
    );
}

export default Detail;
