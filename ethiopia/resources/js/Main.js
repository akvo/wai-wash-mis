import React, { useState, useEffect } from "react";
import { Layout } from "antd";

import { UIStore } from "./store";

import Home from "./pages/home/view";
import Detail from "./pages/details/view";

function Main() {
    const store = UIStore.useState();
    const { page, firstFilter } = store;

    useEffect(() => {
        UIStore.update((e) => {
            e.state = {
                ...store.state,
                data: store[firstFilter].data,
                config: store[firstFilter].config,
            };
        });
    }, []);

    return (
        <Layout>
            <Layout className="site-layout">
                {page === "home" ? <Home /> : <Detail />}
            </Layout>
        </Layout>
    );
}

export default Main;
