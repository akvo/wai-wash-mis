import React from "react";
import { Layout, Menu, Button, Select } from "antd";

import { UIStore } from "../store";

const { Header } = Layout;

const handleOnChangeWoreda = (e) => {
    console.log(e);
    UIStore.update((e) => {
        e.page = "details";
    });
};

export function HeaderHome() {
    return (
        <Header
            className="site-layout"
            style={{
                padding: "10px",
                backgroundColor: "#fff",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <div>
                    <h4>WAI Ethiopia</h4>
                </div>
                <div>
                    <Select
                        style={{ width: 220 }}
                        placeholder="Select Woreda"
                        onChange={handleOnChangeWoreda}
                    >
                        <Select.Option key="1">Shashemene</Select.Option>
                        <Select.Option key="2">Negele Asri</Select.Option>
                    </Select>
                </div>
                <div>
                    <Button type="secondary">Login</Button>
                </div>
            </div>
        </Header>
    );
}

export function HeaderDetail() {
    return (
        <Header
            className="site-layout"
            style={{
                padding: "10px",
                backgroundColor: "#F9F9F9",
                position: "fixed",
                zIndex: 1,
                width: "100%",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <div>
                    <h4>WAI Ethiopia</h4>
                </div>
                <div>
                    <Select style={{ width: 220 }} placeholder="Select Woreda">
                        <Select.Option key="1">Shashemene</Select.Option>
                        <Select.Option key="2">Negele Asri</Select.Option>
                    </Select>
                    <Select style={{ width: 220 }} placeholder="All Kebeles">
                        <Select.Option key="1">Faji Goba</Select.Option>
                        <Select.Option key="2">Ebicha</Select.Option>
                    </Select>
                </div>
                <div>
                    <Button type="secondary">Login</Button>
                </div>
            </div>
        </Header>
    );
}
