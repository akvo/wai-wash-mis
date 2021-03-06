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
                    e.level1 = null;
                    e.level2 = null;
                    e.level3 = null;
                    e.firstFilter = "hh";
                    e.secondFilter = "all";
                    e.markerDetail = {
                        ...e.markerDetail,
                        active: false,
                        data: {},
                    };
                })
            }
        >
            <Image width={35} src="/images/wai-logo.png" preview={false} />
            <span className="brand">WAI Bangladesh</span>
        </div>
    );
};

const renderLevel1Option = (level1, level1List) => {
    return (
        <Select
            style={{ width: 220, marginLeft: "5px", marginRight: "5px" }}
            placeholder="Select District"
            value={level1}
            onChange={handleOnChangeLevel1}
        >
            {level1List &&
                level1List.map((x) => (
                    <Select.Option key={x.toLowerCase()}>{x}</Select.Option>
                ))}
        </Select>
    );
};

const renderLevel2Option = (level2, level2List) => {
    return (
        <Select
            style={{ width: 220, marginLeft: "5px", marginRight: "5px" }}
            placeholder="Select Municipality/Union"
            allowClear={true}
            value={level2}
            onChange={handleOnChangeLevel2}
            getPopupContainer={(trigger) => trigger.parentNode}
        >
            {level2List &&
                level2List.map((x) => (
                    <Select.Option
                        key={x.toLowerCase()}
                        value={x.toLowerCase()}
                    >
                        {x}
                    </Select.Option>
                ))}
        </Select>
    );
};

const renderLevel3Option = (level3, level3List) => {
    return (
        <Select
            style={{ width: 220, marginLeft: "5px", marginRight: "5px" }}
            placeholder="Select Ward Number"
            allowClear={true}
            value={level3}
            onChange={handleOnChangeLevel3}
            getPopupContainer={(trigger) => trigger.parentNode}
        >
            {level3List &&
                level3List.map((x) => (
                    <Select.Option key={x} value={x}>
                        {x}
                    </Select.Option>
                ))}
        </Select>
    );
};

const renderLoginBtn = () => {
    return (
        <div>
            <Button
                onClick={() =>
                    window.open(
                        "https://www.figma.com/proto/WaWFfzgSEwfbt3PVtSGYI5/WAI---ET-V5?page-id=605%3A1338&node-id=687%3A77&viewport=1039%2C1676%2C1&scaling=min-zoom",
                        "blank"
                    )
                }
                type="secondary"
            >
                Login
            </Button>
        </div>
    );
};

const handleOnChangeLevel1 = (key) => {
    UIStore.update((e) => {
        e.level3 = null;
        e.level2 = null;
        e.level1 = key;
        e.markerDetail = {
            ...e.markerDetail,
            active: false,
            data: {},
        };
    });
};

const handleOnChangeLevel2 = (key) => {
    UIStore.update((e) => {
        e.level3 = null;
        e.level2 = key;
        e.page = "details";
        e.markerDetail = {
            ...e.markerDetail,
            active: false,
            data: {},
        };
    });
};

const handleOnChangeLevel3 = (key) => {
    if (key === null) {
        handleOnChangeLevel2(null);
    }
    UIStore.update((e) => {
        e.level3 = key;
        e.markerDetail = {
            ...e.markerDetail,
            active: false,
            data: {},
        };
    });
};

export function HeaderHome() {
    const level1 = UIStore.useState((e) => e.level1);
    const level1List = UIStore.useState((e) => e.level1List).filter(
        (x) => x.length
    );
    const level2 = UIStore.useState((e) => e.level2);
    const level2List = UIStore.useState((e) => e.level2List).filter(
        (x) => x.length
    );

    return (
        <Header className="header-container">
            <div className="header-content-wrapper">
                {renderLogo()}
                <div>
                    {renderLevel1Option(level1, level1List)}
                    {renderLevel2Option(level2, level2List)}
                </div>
                {renderLoginBtn()}
            </div>
        </Header>
    );
}

export const HeaderDetail = () => {
    const level1 = UIStore.useState((e) => e.level1);
    const level2 = UIStore.useState((e) => e.level2);
    const level3 = UIStore.useState((e) => e.level3);
    const level1List = UIStore.useState((e) => e.level1List).filter(
        (x) => x.length
    );
    const level2List = UIStore.useState((e) => e.level2List).filter(
        (x) => x.length
    );
    const level3List = UIStore.useState((e) => e.level3List);

    return (
        <Header
            className="header-container header-fixed"
            style={{ zIndex: 100 }}
        >
            <div className="header-content-wrapper">
                {renderLogo()}
                <div>
                    {renderLevel1Option(level1, level1List)}
                    {renderLevel2Option(level2, level2List)}
                    {renderLevel3Option(level3, level3List)}
                    {(level2 || level3) && (
                        <Button onClick={() => handleOnChangeLevel3(null)}>
                            Remove Filter
                        </Button>
                    )}
                </div>
                {renderLoginBtn()}
            </div>
        </Header>
    );
};
