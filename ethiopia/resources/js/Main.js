import React, { useState, useEffect } from "react";
import { Layout } from "antd";

import { UIStore } from "./store";

import Home from "./pages/home/view";
import Detail from "./pages/details/view";

function Main() {
    const { page } = UIStore.useState();

    return (
        <Layout>
            <Layout className="site-layout">
                {page === "home" ? <Home /> : <Detail />}
            </Layout>
        </Layout>
    );
}

export default Main;
