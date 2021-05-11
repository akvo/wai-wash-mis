import React from "react";
import { Layout, Menu, Button, Select, Image } from "antd";

import { UIStore } from "../store";

const { Header } = Layout;

const handleOnChangeWoreda = (key) => {
    UIStore.update((e) => {
        e.page = "details";
        e.woreda = key;
    });
};

const handleOnChangeKebele = (key) => {
    UIStore.update((e) => {
        e.kebele = key;
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
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                    }}
                    onClick={(e) =>
                        UIStore.update((e) => {
                            e.page = "home";
                            e.woreda = null;
                        })
                    }
                >
                    <Image
                        width={30}
                        src="/images/wai-logo.png"
                        preview={false}
                    />
                    <span>WAI Ethiopia</span>
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
    const kebele = UIStore.useState((e) => e.kebele);

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
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                    }}
                    onClick={(e) =>
                        UIStore.update((e) => {
                            e.page = "home";
                            e.woreda = null;
                        })
                    }
                >
                    <Image
                        width={30}
                        src="/images/wai-logo.png"
                        preview={false}
                    />
                    <span>WAI Ethiopia</span>
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
                    <Select
                        style={{ width: 220 }}
                        placeholder="All Kebeles"
                        defaultValue={kebele}
                        onChange={handleOnChangeKebele}
                    >
                        <Select.Option key="faji goba">Faji Goba</Select.Option>
                        <Select.Option key="ebichaa">Ebicha</Select.Option>
                    </Select>
                </div>
                <div>
                    <Button type="secondary">Login</Button>
                </div>
            </div>
        </Header>
    );
}
