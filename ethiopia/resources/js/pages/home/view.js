import React from "react";
import { Layout } from "antd";

import { HeaderHome } from "../../components/header";

import "./style.css";

const { Content } = Layout;

function Home() {
    return (
        <div>
            <HeaderHome />
            <Content className="site-layout-background">
                This is HomePage!
            </Content>
        </div>
    );
}

export default Home;
