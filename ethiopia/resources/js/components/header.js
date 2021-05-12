import React from "react";
import { Layout, Menu, Button, Select, Image } from "antd";

import { UIStore } from "../store";

const { Header } = Layout;

const renderLogo = () => {
    return (
        <div
            className="header-logo-wrapper"
            onClick={(e) =>
                UIStore.update((e) => {
                    e.page = "home";
                    e.woreda = null;
                    e.kebele = null;
                })
            }
        >
            <Image width={35} src="/images/wai-logo.png" preview={false} />
            <span className="brand">WAI Ethiopia</span>
        </div>
    );
};

const renderWoredaOption = (woreda, woredaList) => {
    return (
        <Select
            style={{ width: 220 }}
            placeholder="Select Woreda"
            value={woreda}
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
            value={kebele}
            onChange={handleOnChangeKebele}
        >
            {kebeleList.map((x) => (
                <Select.Option key={x.toLowerCase()} value={x.toLowerCase()}>
                    {x}
                </Select.Option>
            ))}
        </Select>
    );
};

const renderLoginBtn = () => {
    return (
        <div>
            <Button type="secondary">Login</Button>
        </div>
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
        <Header className="header-container">
            <div className="header-content-wrapper">
                {renderLogo()}
                <div>{renderWoredaOption(woreda, woredaList)}</div>
                {renderLoginBtn()}
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
        <Header className="header-container header-fixed">
            <div className="header-content-wrapper">
                {renderLogo()}
                <div>
                    {renderWoredaOption(woreda, woredaList)}
                    {renderKebeleOption(kebele, kebeleList)}
                </div>
                {renderLoginBtn()}
            </div>
        </Header>
    );
}
