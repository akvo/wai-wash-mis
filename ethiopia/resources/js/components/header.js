import React from "react";
import { Layout, Menu, Button, Select, Image } from "antd";

import { UIStore } from "../store";

const { Header } = Layout;

const renderLogo = () => {
    return (
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
                    e.kebele = null;
                })
            }
        >
            <Image width={30} src="/images/wai-logo.png" preview={false} />
            <span>WAI Ethiopia</span>
        </div>
    );
};

const renderWoredaOption = (woreda, woredaList) => {
    return (
        <Select
            style={{ width: 220 }}
            placeholder="Select Woreda"
            defaultValue={woreda}
            onChange={handleOnChangeWoreda}
        >
            {woredaList.map((x) => (
                <Select.Option key={x.toLowerCase()}>{x}</Select.Option>
            ))}
        </Select>
    );
};

const renderKebeleOption = (kebele, kebeleList) => {
    return (
        <Select
            style={{ width: 220 }}
            placeholder="All Kebeles"
            allowClear={true}
            defaultValue={kebele}
            onChange={handleOnChangeKebele}
        >
            {kebeleList.map((x) => (
                <Select.Option key={x.toLowerCase()}>{x}</Select.Option>
            ))}
        </Select>
    );
};

const handleOnChangeWoreda = (key) => {
    UIStore.update((e) => {
        e.kebele = null;
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
    const woredaList = UIStore.useState((e) => e.woredaList);

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
                {renderLogo()}
                <div>{renderWoredaOption(woreda, woredaList)}</div>
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
    const woredaList = UIStore.useState((e) => e.woredaList);
    const kebeleList = UIStore.useState((e) => e.kebeleList);

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
                {renderLogo()}
                <div>
                    {renderWoredaOption(woreda, woredaList)}
                    {renderKebeleOption(kebele, kebeleList)}
                </div>
                <div>
                    <Button type="secondary">Login</Button>
                </div>
            </div>
        </Header>
    );
}
