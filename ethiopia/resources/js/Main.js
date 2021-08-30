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
        const { level1, level2 } = config?.locations;

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
                            x[level1]?.toLowerCase() ===
                            store.level1?.toLowerCase()
                    )
                    .map((x) => x[level2])
                    .filter(
                        (value, index, self) => self.indexOf(value) === index
                    );
        }

        UIStore.update((e) => {
            e.state = {
                ...store.state,
                data: data,
                config: config,
            };
            e.level1List = level1List;
            e.level2List = level2List;
            if (
                e.level2 &&
                !level2List.map((l) => l.toLowerCase()).includes(e.level2)
            ) {
                e.level2 = level2List[0]?.toLowerCase();
            }
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
