import React from "react";
import { Col, Layout, Row, Image } from "antd";

import { HeaderHome } from "../../components/header";

import "./styles.scss";

const { Content } = Layout;

function Home() {
    return (
        <div id="home">
            <HeaderHome />
            <Content className="content-container">
                <Row>
                    <Col span={24}>
                        <Row justify="center" align="middle">
                            <Col span={12}>
                                <Image src="https://via.placeholder.com/400" />
                            </Col>
                            <Col span={12}>
                                <h4>Branding and MIS descriptor</h4>
                                <p>
                                    lorem ipsum dolor sit amet, consectetur
                                    adipisicing elit, sed do eiusmod tempor
                                    incididunt ut labore et dolore magna aliqua.
                                    Ut enim ad minim veniam, quis nostrud
                                    exercitation ullamco laboris nisi ut aliquip
                                    ex ea commodo consequat. Duis aute irure
                                    dolor in reprehenderit in voluptate velit
                                    esse cillum dolore eu fugiat nulla pariatur.
                                    Excepteur sint occaecat cupidatat non
                                    proident, sunt in culpa qui officia deserunt
                                    mollit anim id est laborum.
                                </p>
                            </Col>
                        </Row>
                        <Row justify="center" align="middle">
                            <Col span={24} justify="center" align="middle">
                                <h4>Another branding and descriptor section</h4>
                                <p>
                                    lorem ipsum dolor sit amet, consectetur
                                    adipisicing elit, sed do eiusmod tempor
                                    incididunt ut labore et dolore magna aliqua.
                                    Ut enim ad minim veniam, quis nostrud
                                    exercitation ullamco laboris nisi ut aliquip
                                    ex ea commodo consequat. Duis aute irure
                                    dolor in reprehenderit in voluptate velit
                                    esse cillum dolore eu fugiat nulla pariatur.
                                    Excepteur sint occaecat cupidatat non
                                    proident, sunt in culpa qui officia deserunt
                                    mollit anim id est laborum.
                                </p>
                            </Col>
                        </Row>
                        <Row justify="center" align="middle" gutter={[16, 16]}>
                            <Col span="6">
                                <Image src="https://via.placeholder.com/300" />
                                <strong>Image Title</strong>
                            </Col>
                            <Col span="6">
                                <Image src="https://via.placeholder.com/300" />
                                <strong>Image Title</strong>
                            </Col>
                            <Col span="6">
                                <Image src="https://via.placeholder.com/300" />
                                <strong>Image Title</strong>
                            </Col>
                            <Col span="6">
                                <Image src="https://via.placeholder.com/300" />
                                <strong>Image Title</strong>
                            </Col>
                        </Row>
                        <Row justify="center" align="middle">
                            <Col span={24} justify="center" align="middle">
                                <h4>Another branding and descriptor section</h4>
                                <p>
                                    lorem ipsum dolor sit amet, consectetur
                                    adipisicing elit, sed do eiusmod tempor
                                    incididunt ut labore et dolore magna aliqua.
                                    Ut enim ad minim veniam, quis nostrud
                                    exercitation ullamco laboris nisi ut aliquip
                                    ex ea commodo consequat. Duis aute irure
                                    dolor in reprehenderit in voluptate velit
                                    esse cillum dolore eu fugiat nulla pariatur.
                                    Excepteur sint occaecat cupidatat non
                                    proident, sunt in culpa qui officia deserunt
                                    mollit anim id est laborum.
                                </p>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Content>
        </div>
    );
}

export default Home;
