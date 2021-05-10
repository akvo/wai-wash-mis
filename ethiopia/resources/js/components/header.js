import React from "react";
import { Layout, Menu, Button, Select } from "antd";

import { UIStore } from "../store";

const { Header } = Layout;

const handleOnChangeWoreda = (key) => {
    UIStore.update((e) => {
        e.page = "details";
        e.woreda = key;
    });
};

export function HeaderHome() {
    const woreda = UIStore.useState((e) => e.woreda);
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
                        defaultValue={woreda}
                        onChange={handleOnChangeWoreda}
                    >
                        <Select.Option key="shashamene">
                            Shashemene
                        </Select.Option>
                        <Select.Option key="arsi negele">
                            Arsi Negele
                        </Select.Option>
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
    const woreda = UIStore.useState((e) => e.woreda);
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
                    <Select
                        style={{ width: 220 }}
                        placeholder="Select Woreda"
                        defaultValue={woreda}
                        onChange={handleOnChangeWoreda}
                    >
                        <Select.Option key="shashamene">
                            Shashemene
                        </Select.Option>
                        <Select.Option key="arsi negele">
                            Arsi Negele
                        </Select.Option>
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
