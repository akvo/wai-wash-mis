import React, { useState, useEffect } from "react";
import { Layout } from "antd";

import { UIStore } from "./store";

import Home from "./pages/home/view";
import Detail from "./pages/details/view";

import "./main.scss";

function Main() {
    const store = UIStore.useState();
    const { page, firstFilter, state } = store;

    useEffect(() => {
        const { data, config } = store?.[firstFilter];
        const { level1, level2, level3 } = config?.locations;

        const level1List =
            data &&
            data
                .map((x) => x[level1])
                .filter((value, index, self) => self.indexOf(value) === index);

        let level2List = [];
        if (store?.level1) {
            level2List =
                data &&
                data
                    .filter(
                        (x) =>
                            x[level1].toLowerCase() ===
                            store.level1.toLowerCase()
                    )
                    .map((x) => x[level2])
                    .filter(
                        (value, index, self) => self.indexOf(value) === index
                    );
        }

        let level3List = [];
        if (store?.level2) {
            level3List =
                data &&
                data
                    .filter(
                        (x) =>
                            x[level1].toLowerCase() ===
                            store.level1.toLowerCase()
                    )
                    .filter(
                        (x) =>
                            x[level2].toLowerCase() ===
                            store.level2.toLowerCase()
                    )
                    .map((x) => x[level3])
                    .filter(
                        (value, index, self) => self.indexOf(value) === index
                    ).sort(function(a, b) {
                        return a - b;
                    });
        }

        UIStore.update((e) => {
            e.state = {
                ...store.state,
                data: data,
                config: config,
            };
            e.level1List = level1List;
            e.level2List = level2List;
            e.level3List = level3List;
        });
    }, [state]);

    return (
        <Layout>
            <Layout className="site-layout">
                {page === "home" ? <Home /> : <Detail />}
            </Layout>
        </Layout>
    );
}

export default Main;
