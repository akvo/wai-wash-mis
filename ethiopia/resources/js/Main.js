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
        const { data, config } = store[firstFilter];
        const { woreda, kebele } = config.locations;

        const woredaList = data
            .map((x) => x[woreda])
            .filter((value, index, self) => self.indexOf(value) === index);

        let kebeleList = [];
        if (store.woreda) {
            kebeleList = data
                .filter(
                    (x) =>
                        x[woreda].toLowerCase() === store.woreda.toLowerCase()
                )
                .map((x) => x[kebele])
                .filter((value, index, self) => self.indexOf(value) === index);
        }

        UIStore.update((e) => {
            e.state = {
                ...store.state,
                data: data,
                config: config,
            };
            e.woredaList = woredaList;
            e.kebeleList = kebeleList;
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
