import React, { useEffect } from "react";
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
            <span className="brand">WAI Ethiopia</span>
        </div>
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
        e.level1 = key;
        e.level2 = null;
        e.page = "details";
        e.markerDetail = {
            ...e.markerDetail,
            active: false,
            data: {},
        };
    });
};

const handleOnChangeLevel2 = (key) => {
    UIStore.update((e) => {
        e.level2 = key;
        e.markerDetail = {
            ...e.markerDetail,
            active: false,
            data: {},
        };
    });
};

const renderLevel1Option = (level1, level1List) => {
    useEffect(() => {
        if (!level1List.includes(level1) && level1) {
            handleOnChangeLevel1(level1List[0]);
        }
    });
    return (
        <Select
            style={{ width: 220, marginLeft: "5px", marginRight: "5px" }}
            placeholder="Select District"
            value={level1}
            onChange={handleOnChangeLevel1}
        >
            {level1List &&
                level1List
                    .sort()
                    .map((x) => (
                        <Select.Option key={x.toLowerCase()}>{x}</Select.Option>
                    ))}
        </Select>
    );
};

const renderLevel2Option = (level2, level2List) => {
    return (
        <Select
            style={{ width: 220, marginLeft: "5px", marginRight: "5px" }}
            placeholder="Select Municipality"
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

export function HeaderHome() {
    const level1 = UIStore.useState((e) => e.level1);
    const level1List = UIStore.useState((e) => e.level1List).filter(
        (x) => x.length
    );

    return (
        <Header className="header-container">
            <div className="header-content-wrapper">
                {renderLogo()}
                <div>{renderLevel1Option(level1, level1List)}</div>
                {renderLoginBtn()}
            </div>
        </Header>
    );
}

export const HeaderDetail = () => {
    const level1 = UIStore.useState((e) => e.level1);
    const level2 = UIStore.useState((e) => e.level2);
    const level1List = UIStore.useState((e) => e.level1List).filter(
        (x) => x?.length
    );
    const level2List = UIStore.useState((e) => e.level2List).filter(
        (x) => x?.length
    );

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
                    {level1 && (
                        <Button onClick={() => handleOnChangeLevel1(null)}>
                            Remove Filter
                        </Button>
                    )}
                </div>
                {renderLoginBtn()}
            </div>
        </Header>
    );
};
